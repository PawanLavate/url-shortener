package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"sync"
)

// In-memory store (no database needed)
var (
	store = make(map[string]string)
	mu    sync.Mutex
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/shorten", withCORS(shortenHandler))
	mux.HandleFunc("/r/", withCORS(redirectHandler))

	fmt.Println("🚀 Server running on port", port)
	http.ListenAndServe(":"+port, mux)
}

// POST /shorten — { "url": "https://google.com" } → { "short": "abc123" }
func shortenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var body struct {
		URL string `json:"url"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.URL == "" {
		http.Error(w, "URL is required", http.StatusBadRequest)
		return
	}

	code := randomCode(6)
	mu.Lock()
	store[code] = body.URL
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"short": fmt.Sprintf("%s/r/%s", getHost(r), code),
		"code":  code,
	})
}

// GET /r/:code — redirects to original URL
func redirectHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Path[len("/r/"):]
	mu.Lock()
	url, ok := store[code]
	mu.Unlock()

	if !ok {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	http.Redirect(w, r, url, http.StatusFound)
}

func randomCode(n int) string {
	letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func getHost(r *http.Request) string {
	host := os.Getenv("BACKEND_URL")
	if host != "" {
		return host
	}
	return "http://localhost:8080"
}

// CORS middleware — allows React frontend to call the API
func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
