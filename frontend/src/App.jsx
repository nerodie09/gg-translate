import { useState } from "react";
import axios from "axios";
import "./App.css";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "jp", label: "Japanese" },
  { code: "kr", label: "Korean" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
];

const INTENT_COLORS = {
  callout: "#ff4d4d",
  command: "#4da6ff",
  location: "#ffd700",
  status: "#ff9900",
  chat: "#aaaaaa",
};

export default function App() {
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("jp");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [correcting, setCorrecting] = useState(false);
  const [correction, setCorrection] = useState("");
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  const [gamePack, setGamePack] = useState(null);

  async function handleTranslate() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("http://localhost:3000/translate", {
        text,
        sourceLang,
        targetLang,
        gamePack,
      });
      setResult(response.data);
      setHistory((prev) => [response.data, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Translation failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTranslate();
    }
  }

  async function handleCorrection() {
    if (!correction.trim() || !result) return;
    try {
      await axios.post("http://localhost:3000/correct", {
        originalText: result.originalText,
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        correctedText: correction,
      });
      setCorrectionSuccess(true);
      setCorrecting(false);
      setCorrection("");
      setTimeout(() => setCorrectionSuccess(false), 4000);
    } catch (err) {
      console.error("Correction failed:", err);
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>🎮 GG Translate</h1>
        <p>Real-time gaming communication translator</p>
      </div>

      {/* Translator Box */}
      <div className="translator-box">
        {/* Language Selectors */}
        <div className="lang-row">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <span className="arrow">→</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Game Pack Selector */}
        <div className="game-row">
          {["none", "valorant", "dota2"].map((game) => (
            <button
              key={game}
              className={`game-btn ${gamePack === (game === "none" ? null : game) ? "active" : ""}`}
              onClick={() => setGamePack(game === "none" ? null : game)}
            >
              {game === "none"
                ? "🎮 Generic"
                : game === "valorant"
                  ? "⚡ VALORANT"
                  : "🛡️ DOTA2"}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          className="input-box"
          placeholder="Type a gaming message... (Enter to translate)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />

        {/* Translate Button */}
        <button
          className="translate-btn"
          onClick={handleTranslate}
          disabled={loading}
        >
          {loading ? "Translating..." : "Translate"}
        </button>

        {/* Error */}
        {error && <div className="error">{error}</div>}

        {/* Result */}
        {result && (
          <div className="result-box">
            <div className="result-header">
              <span
                className="intent-badge"
                style={{
                  backgroundColor: INTENT_COLORS[result.intent] || "#aaaaaa",
                }}
              >
                {result.intent}
              </span>
              {result.fromCache && (
                <span className="cache-badge">⚡ cached</span>
              )}
            </div>
            <div className="translated-text">{result.translatedText}</div>
            {result.normalisedText !== result.originalText && (
              <div className="normalised-text">
                Normalised: "{result.normalisedText}"
              </div>
            )}

            {/* Correction Flow */}
            {!correcting && (
              <button
                className="correct-btn"
                onClick={() => setCorrecting(true)}
              >
                ✏️ Wrong translation? Fix it
              </button>
            )}
            {correcting && (
              <div className="correction-box">
                <input
                  className="correction-input"
                  placeholder="Enter the correct translation..."
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                />
                <div className="correction-actions">
                  <button
                    className="submit-correction-btn"
                    onClick={handleCorrection}
                  >
                    Submit
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setCorrecting(false);
                      setCorrection("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {correctionSuccess && (
                  <div className="correction-success">
                    ✅ Correction saved! Next time this phrase will use your
                    version.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="history">
          <h3>Recent Translations</h3>
          {history.map((item, index) => (
            <div key={index} className="history-item">
              <span className="history-original">{item.originalText}</span>
              <span className="history-arrow">→</span>
              <span className="history-translated">{item.translatedText}</span>
              <span
                className="intent-badge small"
                style={{
                  backgroundColor: INTENT_COLORS[item.intent] || "#aaaaaa",
                }}
              >
                {item.intent}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
