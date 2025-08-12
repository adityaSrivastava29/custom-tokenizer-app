import { useState, useEffect } from "react";

export default function TokenOutput({ encodedTokens, onDecode, decodedText }) {
  const [decodeInput, setDecodeInput] = useState("");

  // Only auto-populate decode input when encoded tokens change, but don't auto-decode
  useEffect(() => {
    if (encodedTokens && encodedTokens.length > 0) {
      setDecodeInput(encodedTokens.join(", "));
    } else {
      setDecodeInput("");
    }
  }, [encodedTokens]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const handleDecode = () => {
    if (decodeInput.trim()) {
      try {
        const tokenIds = decodeInput
          .split(/[,\s]+/)
          .filter(Boolean)
          .map(Number);
        if (tokenIds.some(isNaN)) {
          alert("Please enter valid numbers separated by commas");
          return;
        }
        onDecode(tokenIds);
      } catch (error) {
        alert("Invalid token format. Please enter numbers separated by commas");
      }
    }
  };

  return (
    <section className="ct-section">
      <h2>Token Output</h2>

      <div className="ct-input-group">
        <label>Encoded Tokens:</label>
        <div className="ct-token-display-container">
          <div className="ct-token-list">
            {encodedTokens.map((tokenId, index) => (
              <span key={index} className="ct-token-chip">
                {tokenId}
              </span>
            ))}
          </div>
          <button
            className="ct-copy-btn"
            onClick={() => copyToClipboard(encodedTokens.join(", "))}
            title="Copy to clipboard">
            📋 Copy
          </button>
        </div>
      </div>

      <div className="ct-input-group">
        <label>Decode Tokens:</label>
        <div className="ct-decode-container">
          <textarea
            value={decodeInput}
            onChange={(e) => setDecodeInput(e.target.value)}
            placeholder="Enter token IDs separated by commas (e.g., 2, 5, 8, 3)"
            className="ct-decode-input"
          />
          <button className="ct-btn" onClick={handleDecode}>
            Decode
          </button>
        </div>
      </div>

      {decodedText && (
        <div className="ct-input-group">
          <label>Decoded Text:</label>
          <div className="ct-decoded-output">{decodedText}</div>
        </div>
      )}
    </section>
  );
}
