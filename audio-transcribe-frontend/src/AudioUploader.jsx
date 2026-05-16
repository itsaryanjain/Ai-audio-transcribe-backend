import React, { useState, useRef } from "react";
import axios from "axios";

const languages = [
  { value: "auto", label: "Keep Original" },
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Arabic", label: "Arabic" },
  { value: "Japanese", label: "Japanese" },
];

export default function AudioUploader() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("auto");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type.startsWith("audio/")) {
      setFile(f); setText(""); setError("");
    }
  };

  const upload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLanguage", language);
    try {
      setLoading(true); setError(""); setText("");
      const res = await axios.post("http://localhost:8081/api/transcribe", formData);
      setText(res.data);
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div style={{
      fontFamily: "'Syne', sans-serif",
      background: "#0d0d0d",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'); @keyframes spin { to { transform: rotate(360deg); } } @keyframes indeterminate { 0% { transform: scaleX(0) translateX(0%); } 40% { transform: scaleX(0.6) translateX(60%); } 100% { transform: scaleX(0.1) translateX(900%); } }`}</style>

      <div style={{ width: "100%", maxWidth: "620px" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c8f03a", marginBottom: "0.75rem" }}>↯ AI Powered</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#f0ede6", lineHeight: 1.1, margin: 0 }}>
            Audio <span style={{ color: "#c8f03a" }}>Transcriber</span>
          </h1>
        </div>

        {/* Card */}
        <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: "20px", padding: "2rem" }}>

          {/* Drop zone */}
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ border: `1.5px dashed ${dragging ? "#c8f03a" : "#333"}`, borderRadius: "14px", padding: "2.5rem 1.5rem", textAlign: "center", cursor: "pointer", background: dragging ? "#141a06" : "#111", position: "relative", marginBottom: "1.5rem" }}
            >
              <input ref={inputRef} type="file" accept="audio/*" onChange={(e) => handleFile(e.target.files[0])}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
              <div style={{ width: "48px", height: "48px", background: "#1e1e1e", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", border: "1px solid #2a2a2a" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8f03a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#f0ede6", marginBottom: "0.3rem" }}>Drop your audio file here</div>
              <div style={{ fontSize: "0.8rem", color: "#555", fontFamily: "'DM Mono', monospace" }}>or click to browse · mp3, wav, m4a, ogg</div>
            </div>
          ) : (
            <div style={{ border: "1.5px solid #2a2a2a", borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem", background: "#111" }}>
              <div style={{ width: "40px", height: "40px", background: "#1a2206", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8f03a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
              </div>
              <span style={{ flex: 1, fontSize: "0.85rem", color: "#f0ede6", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
              <button onClick={() => { setFile(null); setText(""); setError(""); }}
                style={{ background: "none", border: "none", color: "#555", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Language */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Translate to</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: "10px", color: "#f0ede6", fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", padding: "0.7rem 1rem", appearance: "none", cursor: "pointer" }}>
              {languages.map((l) => <option key={l.value} value={l.value} style={{ background: "#161616" }}>{l.label}</option>)}
            </select>
          </div>

          {/* Progress */}
          {loading && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ height: "3px", background: "#222", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#c8f03a", borderRadius: "99px", animation: "indeterminate 1.4s ease infinite", transformOrigin: "left" }} />
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#555", marginTop: "0.5rem" }}>Processing audio...</div>
            </div>
          )}

          {/* Button */}
          <button onClick={upload} disabled={!file || loading}
            style={{ width: "100%", padding: "0.9rem", borderRadius: "12px", border: "none", fontFamily: "'Syne', sans-serif", fontSize: "0.95rem", fontWeight: 600, cursor: !file || loading ? "not-allowed" : "pointer", background: "#c8f03a", color: "#0d0d0d", opacity: !file || loading ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Transcribing…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                Transcribe Audio
              </>
            )}
          </button>

          {/* Result */}
          {text && (
            <>
              <div style={{ height: "1px", background: "#2a2a2a", margin: "1.5rem 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>Transcription</span>
                <button onClick={copy} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: "7px", color: copied ? "#c8f03a" : "#555", fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", padding: "3px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "1.25rem", fontFamily: "'DM Mono', monospace", fontSize: "0.82rem", color: "#c8c5bc", lineHeight: 1.75, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: "260px", overflowY: "auto" }}>
                {text}
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <>
              <div style={{ height: "1px", background: "#2a2a2a", margin: "1.5rem 0" }} />
              <div style={{ background: "#1a0808", border: "1px solid #3a1515", borderRadius: "12px", padding: "1rem 1.25rem", fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "#e07070", lineHeight: 1.6 }}>
                ⚠ {error}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
