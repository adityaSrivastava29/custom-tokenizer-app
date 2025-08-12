import { useCallback, useEffect, useRef, useState } from "react";
import Tokenizer from "./utils/tokenizer";
import "./App.css";
import Header from "./components/Header.jsx";
import TokenizerInput from "./components/TokenizerInput.jsx";
import TokenOutput from "./components/TokenOutput.jsx";

export default function App() {
  const [vocabSize, setVocabSize] = useState(1000);
  const tokenizerRef = useRef(new Tokenizer("word", vocabSize));
  const [tokenizerType, setTokenizerType] = useState("word");
  const [inputText, setInputText] = useState(
    "Namaste JI, Custom Tokenizer App me aapka Swagat hai"
  );
  const [encodedTokens, setEncodedTokens] = useState([]);
  const [tokenSpans, setTokenSpans] = useState([]);
  const [decodedText, setDecodedText] = useState("");

  const handleEncode = useCallback(() => {
    if (!inputText.trim()) {
      setEncodedTokens([]);
      setTokenSpans([]);
      return;
    }

    // Build vocabulary from the input text first
    tokenizerRef.current.setTokenizerType(tokenizerType);
    tokenizerRef.current.train(inputText, vocabSize, tokenizerType);

    const { encoded, tokenSpans: spans } =
      tokenizerRef.current.encode(inputText);
    setEncodedTokens(encoded);
    setTokenSpans(spans);
    // Clear decoded text when encoding new input
    setDecodedText("");
  }, [inputText, tokenizerType, vocabSize]);

  const handleDecode = useCallback((tokenIds) => {
    const decoded = tokenizerRef.current.decode(tokenIds);
    setDecodedText(decoded);
  }, []);

  // Auto-encode when input or tokenizer type changes
  useEffect(() => {
    handleEncode();
  }, [handleEncode]);

  return (
    <div className="ct-container">
      <Header />
      <div className="ct-main">
        <TokenizerInput
          inputText={inputText}
          setInputText={setInputText}
          tokenizerType={tokenizerType}
          setTokenizerType={setTokenizerType}
          onEncode={handleEncode}
          encodedTokens={encodedTokens}
          tokenSpans={tokenSpans}
          vocabSize={vocabSize}
          setVocabSize={setVocabSize}
        />
        <TokenOutput
          encodedTokens={encodedTokens}
          onDecode={handleDecode}
          decodedText={decodedText}
        />
      </div>
    </div>
  );
}
