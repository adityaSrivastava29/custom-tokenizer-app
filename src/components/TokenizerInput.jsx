import { useState, useEffect } from "react";

export default function TokenizerInput({
  inputText,
  setInputText,
  tokenizerType,
  setTokenizerType,
  onEncode,
  encodedTokens,
  tokenSpans,
}) {
  const [highlightedText, setHighlightedText] = useState([]);

  useEffect(() => {
    if (!inputText || !tokenSpans.length) {
      setHighlightedText([{ text: inputText, isToken: false, id: "text" }]);
      return;
    }

    const elements = [];
    let lastPos = 0;

    tokenSpans.forEach((span, index) => {
      // Add text before the token
      if (span.start > lastPos) {
        elements.push({
          text: inputText.slice(lastPos, span.start),
          isToken: false,
          id: `text-${lastPos}`,
        });
      }

      // Add the token with its ID
      elements.push({
        text: span.token,
        isToken: true,
        id: `token-${span.start}`,
        tokenId: encodedTokens[index + 1], // +1 because of BOS token
      });

      lastPos = span.end;
    });

    // Add remaining text
    if (lastPos < inputText.length) {
      elements.push({
        text: inputText.slice(lastPos),
        isToken: false,
        id: "text-end",
      });
    }

    setHighlightedText(elements);
  }, [inputText, tokenSpans, encodedTokens]);

  return (
    <section className="ct-section">
      <h2>Input & Tokenization</h2>
      <div className="ct-input-group">
        <label>Input Text:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Namaste JI, Custom token bnanae ke liye inpute text daalein"
          className="ct-input-textarea"
        />
      </div>

      <div className="ct-input-group">
        <label>Tokenizer Type:</label>
        <select
          value={tokenizerType}
          onChange={(e) => setTokenizerType(e.target.value)}
          className="ct-select">
          <option value="word">Word-based</option>
          <option value="char">Character-based</option>
        </select>
      </div>



      <div className="ct-input-group">
        <label>Tokenized Text :</label>
        <div className="ct-highlighted-text">
          {highlightedText.map((item) => (
            <span
              key={item.id}
              className={`ct-text-segment ${
                item.isToken ? "ct-token-highlight" : ""
              }`}
              data-token-id={item.tokenId}>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
