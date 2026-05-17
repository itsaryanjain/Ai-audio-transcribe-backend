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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Syne', sans-serif;
    background: #0d0d0d;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .app {
    width: 100%;
    max-width: 620px;
  }

  .header {
    margin-bottom: 2.5rem;
  }

  .header-tag {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #c8f03a;
    margin-bottom: 0.75rem;
  }

  .header h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: #f0ede6;
    line-height: 1.1;
  }

  .header h1 span {
    color: #c8f03a;
  }

  .card {
    background: #161616;
    border: 1px solid #2a2a2a;
    border-radius: 20px;
    padding: 2rem;
  }

  /* Drop Zone */
  .drop-zone {
    border: 1.5px dashed #333;
    border-radius: 14px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #111;
    position: relative;
    margin-bottom: 1.5rem;
  }

  .drop-zone:hover, .drop-zone.dragging {
    border-color: #c8f03a;
    background: #141a06;
  }

  .drop-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .drop-icon {
    width: 48px;
    height: 48px;
    background: #1e1e1e;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    border: 1px solid #2a2a2a;
  }

  .drop-icon svg {
    color: #c8f03a;
  }

  .drop-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #f0ede6;
    margin-bottom: 0.3rem;
  }

  .drop-sub {
    font-size: 0.8rem;
    color: #555;
    font-family: 'DM Mono', monospace;
  }

  /* File selected state */
  .file-selected {
    border: 1.5px solid #2a2a2a;
    border-radius: 14px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.5rem;
    background: #111;
  }

  .file-icon {
    width: 40px;
    height: 40px;
    background: #1a2206;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .file-name {
    flex: 1;
    font-size: 0.85rem;
    color: #f0ede6;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-remove {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.15s;
    flex-shrink: 0;
  }

  .file-remove:hover { color: #f0ede6; }

  /* Language row */
  .row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .lang-label {
    font-size: 0.75rem;
    color: #555;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }

  .lang-select-wrap {
    flex: 1;
  }

  select {
    width: 100%;
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    color: #f0ede6;
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    padding: 0.7rem 1rem;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  select:focus {
    outline: none;
    border-color: #c8f03a;
  }

  select option {
    background: #161616;
  }

  /* Button */
  .btn {
    width: 100%;
    padding: 0.9rem;
    border-radius: 12px;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.02em;
  }

  .btn-primary {
    background: #c8f03a;
    color: #0d0d0d;
  }

  .btn-primary:hover:not(:disabled) {
    background: #d4f55a;
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  /* Progress bar */
  .progress-wrap {
    margin-bottom: 1.5rem;
  }

  .progress-bar-bg {
    height: 3px;
    background: #222;
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: #c8f03a;
    border-radius: 99px;
    animation: indeterminate 1.4s ease infinite;
    transform-origin: left;
  }

  @keyframes indeterminate {
    0%   { transform: scaleX(0) translateX(0%); }
    40%  { transform: scaleX(0.6) translateX(60%); }
    100% { transform: scaleX(0.1) translateX(900%); }
  }

  .progress-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: #555;
    margin-top: 0.5rem;
    letter-spacing: 0.08em;
  }

  /* Divider */
  .divider {
    height: 1px;
    background: #2a2a2a;
    margin: 1.5rem 0;
  }

  /* Result */
  .result-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .result-label span {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: #555;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .copy-btn {
    background: none;
    border: 1px solid #2a2a2a;
    border-radius: 7px;
    color: #555;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    padding: 3px 10px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .copy-btn:hover {
    border-color: #c8f03a;
    color: #c8f03a;
  }

  .result-box {
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 1.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    color: #c8c5bc;
    line-height: 1.75;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 260px;
    overflow-y: auto;
  }

  .result-box::-webkit-scrollbar { width: 4px; }
  .result-box::-webkit-scrollbar-track { background: transparent; }
  .result-box::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }

  /* Error */
  .error-box {
    background: #1a0808;
    border: 1px solid #3a1515;
    border-radius: 12px;
    padding: 1rem 1.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.8rem;
    color: #e07070;
    line-height: 1.6;
  }
`;

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
      setFile(f);
      setText("");
      setError("");
    }
  };

  const upload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLanguage", language);

    try {
      setLoading(true);
      setError("");
      setText("");
      const res = await axios.post("https://ai-audio-transcribe-backend.onrender.com/api/transcribe", formData);
      setText(res.data);
    } catch (e) {
      console.error(e);
      const msg = e.response?.data
        ? JSON.stringify(e.response.data, null, 2)
        : e.message;
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
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-tag">↯ AI Powered</div>
          <h1>Audio <span>Transcriber</span></h1>
        </div>

        <div className="card">
          {/* Drop zone or file selected */}
          {!file ? (
            <div
              className={`drop-zone${dragging ? " dragging" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <div className="drop-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="drop-title">Drop your audio file here</div>
              <div className="drop-sub">or click to browse · mp3, wav, m4a, ogg</div>
            </div>
          ) : (
            <div className="file-selected">
              <div className="file-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8f03a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <span className="file-name">{file.name}</span>
              <button className="file-remove" onClick={() => { setFile(null); setText(""); setError(""); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}

          {/* Language */}
          <div className="lang-select-wrap" style={{ marginBottom: "1.5rem" }}>
            <div className="lang-label">Translate to</div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {languages.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Loading bar */}
          {loading && (
            <div className="progress-wrap">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" />
              </div>
              <div className="progress-label">Processing audio...</div>
            </div>
          )}

          {/* Button */}
          <button
            className="btn btn-primary"
            onClick={upload}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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
              <div className="divider" />
              <div className="result-label">
                <span>Transcription</span>
                <button className="copy-btn" onClick={copy}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="result-box">{text}</div>
            </>
          )}

          {/* Error */}
          {error && (
            <>
              <div className="divider" />
              <div className="error-box">⚠ {error}</div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}