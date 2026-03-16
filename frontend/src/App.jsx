import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [url, setUrl] = useState("");
  const [short, setShort] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setShort("");
    try {
      const res = await axios.post(`${API}/shorten`, { url });
      setShort(res.data.short);
    } catch {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(short);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.emoji}>🔗</span>
          <h1 style={styles.title}>URL Shortener</h1>
          <p style={styles.subtitle}>Paste a long URL and get a short one instantly</p>
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="url"
            placeholder="https://your-long-url.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleShorten()}
          />
          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleShorten}
            disabled={loading}
          >
            {loading ? "..." : "Shorten"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        {short && (
          <div style={styles.resultBox}>
            <p style={styles.resultLabel}>Your short URL is ready!</p>
            <a 
              href={short}
              target="_blank"
              rel="noreferrer"
              style={styles.shortLink}
            >
              {short}
            </a>
            <button style={styles.copyBtn} onClick={handleCopy}>
              {copied ? "✅ Copied!" : "Copy"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "20px",
  },
  container: {
    background: "#fff",
    borderRadius: "16px",
    padding: "40px",
    width: "100%",
    maxWidth: "520px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  emoji: {
    fontSize: "48px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "8px 0 4px",
    color: "#1a1a2e",
  },
  subtitle: {
    color: "#888",
    fontSize: "14px",
    margin: 0,
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    outline: "none",
    transition: "border 0.2s",
  },
  button: {
    padding: "12px 22px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    transition: "opacity 0.2s",
  },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffcccc",
    color: "#cc0000",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "16px",
  },
  resultBox: {
    background: "#f5f3ff",
    border: "2px solid #667eea",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  resultLabel: {
    margin: 0,
    color: "#555",
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  shortLink: {
    color: "#667eea",
    fontWeight: "700",
    fontSize: "17px",
    wordBreak: "break-all",
    textDecoration: "none",
  },
  copyBtn: {
    padding: "8px 24px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};