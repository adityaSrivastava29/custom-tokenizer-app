class Tokenizer {
  constructor(tokenizerType = "word", vocabSize = 1000) {
    this.vocab = new Map();
    this.reverseVocab = new Map();
    this.specialTokens = new Map([
      ["[PAD]", 0],
      ["[UNK]", 1],
      ["[BOS]", 2],
      ["[EOS]", 3],
    ]);
    this.tokenizerType = tokenizerType;
    this.vocabSize = vocabSize;

    // Store spacing information for accurate reconstruction
    this.spacingInfo = [];

    // Initialize reverse mapping for special tokens
    for (const [token, id] of this.specialTokens) {
      this.reverseVocab.set(id, token);
    }
  }

  setTokenizerType(type) {
    if (!["word", "char"].includes(type)) {
      throw new Error('Invalid tokenizer type. Must be "word" or "char"');
    }
    this.tokenizerType = type;
    // Clear existing vocab when changing type
    this.vocab.clear();
    this.reverseVocab = new Map(
      [...this.specialTokens].map(([token, id]) => [id, token])
    );
  }

  train(text, vocabSize = this.vocabSize, type = this.tokenizerType) {
    if (type !== this.tokenizerType) {
      this.setTokenizerType(type);
    }

    // Clear existing vocab
    this.vocab.clear();
    this.reverseVocab = new Map(
      [...this.specialTokens].map(([token, id]) => [id, token])
    );

    // Tokenize the text
    const tokens = this.tokenize(text);

    if (this.tokenizerType === "char") {
      // For character mode, add all unique characters to vocabulary
      const uniqueChars = new Set();
      for (const token of tokens) {
        if (token.type === "char") {
          uniqueChars.add(token.value);
        } else {
          uniqueChars.add(token.value); // Add spaces and punctuation as is
        }
      }

      // Add all characters to vocabulary
      for (const char of uniqueChars) {
        this.addTokenToVocab(char);
      }
    } else {
      // Word mode - existing frequency-based vocabulary building
      const frequencies = new Map();
      for (const tokenInfo of tokens) {
        const token = tokenInfo.token;
        const normalized = token.toLowerCase();
        frequencies.set(normalized, (frequencies.get(normalized) || 0) + 1);
      }

      const sortedTokens = [...frequencies.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, vocabSize - this.specialTokens.size)
        .map(([token]) => token);

      for (const token of sortedTokens) {
        this.addTokenToVocab(token);
      }
    }
  }

  addTokenToVocab(token) {
    if (this.vocab.has(token) || this.specialTokens.has(token)) return;
    const newId = this.vocab.size + this.specialTokens.size;
    this.vocab.set(token, newId);
    this.reverseVocab.set(newId, token);
  }

  tokenize(text) {
    if (!text) return [];

    if (this.tokenizerType === "char") {
      const tokens = [];
      // Process each character while preserving spaces
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // Store space characters as they are
        if (/\s/.test(char)) {
          tokens.push({ type: "space", value: char });
        }
        // Store punctuation as they are
        else if (/[.,!?;:]/.test(char)) {
          tokens.push({ type: "punct", value: char });
        }
        // Store regular characters with their case information
        else {
          tokens.push({
            type: "char",
            value: char,
            lower: char.toLowerCase(),
            isUpper: char === char.toUpperCase() && char !== char.toLowerCase(),
          });
        }
      }
      return tokens;
    }

    // Enhanced word tokenization that preserves spacing information
    const tokens = [];
    let currentWord = "";
    let currentPos = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (/\s/.test(char)) {
        if (currentWord) {
          tokens.push({
            token: currentWord,
            position: currentPos,
            precedingSpace: "",
            followingSpace: "",
          });
          currentWord = "";
        }

        // Collect consecutive whitespace
        let whitespace = char;
        while (i + 1 < text.length && /\s/.test(text[i + 1])) {
          i++;
          whitespace += text[i];
        }

        // Attach whitespace to the previous token if it exists
        if (tokens.length > 0) {
          tokens[tokens.length - 1].followingSpace = whitespace;
        }

        currentPos = i + 1;
      } else if (/[.,!?;:]/.test(char)) {
        if (currentWord) {
          tokens.push({
            token: currentWord,
            position: currentPos,
            precedingSpace: "",
            followingSpace: "",
          });
          currentWord = "";
        }
        tokens.push({
          token: char,
          position: i,
          precedingSpace: "",
          followingSpace: "",
        });
        currentPos = i + 1;
      } else {
        if (currentWord === "") {
          currentPos = i;
        }
        currentWord += char;
      }
    }

    if (currentWord) {
      tokens.push({
        token: currentWord,
        position: currentPos,
        precedingSpace: "",
        followingSpace: "",
      });
    }

    return tokens.filter((t) => t);
  }

  // Encode to ids (adds BOS/EOS)
  encode(text) {
    if (!text) return { tokens: [], encoded: [], tokenSpans: [] };

    const tokens = this.tokenize(text);
    const encoded = [this.specialTokens.get("[BOS]")];
    const originalTokens = [];

    // Store spacing information for accurate reconstruction
    this.spacingInfo = tokens.map((tok) => ({
      followingSpace:
        this.tokenizerType === "word" ? tok.followingSpace || "" : "",
    }));

    for (const tok of tokens) {
      if (this.tokenizerType === "char") {
        originalTokens.push(tok);
        // For character mode, use the actual character value
        const valueToEncode = tok.value;

        if (this.vocab.has(valueToEncode)) {
          encoded.push(this.vocab.get(valueToEncode));
        } else {
          // Add unknown characters to vocabulary on the fly
          this.addTokenToVocab(valueToEncode);
          encoded.push(this.vocab.get(valueToEncode));
        }
      } else {
        const token = tok.token;
        const normalized = token.toLowerCase();
        originalTokens.push({ original: token, normalized });

        if (this.vocab.has(normalized)) {
          encoded.push(this.vocab.get(normalized));
        } else {
          // Use UNK token for unknown words
          encoded.push(this.specialTokens.get("[UNK]"));
        }
      }
    }

    encoded.push(this.specialTokens.get("[EOS]"));
    return {
      tokens: originalTokens,
      encoded,
      tokenSpans: this.getTokenSpans(text, tokens),
    };
  }

  decode(encodedTokens) {
    if (!Array.isArray(encodedTokens) || encodedTokens.length === 0) {
      return "";
    }

    const specialTokenIds = new Set([
      this.specialTokens.get("[BOS]"),
      this.specialTokens.get("[EOS]"),
      this.specialTokens.get("[PAD]"),
    ]);

    // Filter out only BOS, EOS, and PAD tokens, keep UNK
    const tokenIds = encodedTokens.filter((id) => !specialTokenIds.has(id));

    if (this.tokenizerType === "char") {
      // For character mode, directly map IDs back to characters
      return tokenIds
        .map((id) => {
          if (id === this.specialTokens.get("[UNK]")) {
            return "[UNK]"; // Preserve UNK tokens in output
          }
          const char = this.reverseVocab.get(id);
          return char || ""; // Return empty string if no mapping found
        })
        .join("");
    } else {
      // For word mode - use preserved spacing information
      const decodedTokens = tokenIds.map((id) => {
        if (id === this.specialTokens.get("[UNK]")) {
          return "[UNK]"; // Keep UNK tokens
        }
        const token = this.reverseVocab.get(id);
        return token || ""; // Get original token or empty string if not found
      });

      // Use spacing information if available, otherwise fall back to heuristic
      if (
        this.spacingInfo &&
        this.spacingInfo.length === decodedTokens.length
      ) {
        let result = "";
        for (let i = 0; i < decodedTokens.length; i++) {
          const token = decodedTokens[i];
          if (!token) continue;

          result += token;

          // Add preserved spacing information
          if (this.spacingInfo[i] && this.spacingInfo[i].followingSpace) {
            result += this.spacingInfo[i].followingSpace;
          }
        }
        return result;
      } else {
        // Fallback to original heuristic approach
        let result = "";
        for (let i = 0; i < decodedTokens.length; i++) {
          const token = decodedTokens[i];
          if (!token) continue;

          // Check if current token is space or punctuation
          const isSpaceOrPunct = /^[\s.,!?;:]$/.test(token);

          // If not space/punct and not first token and previous token wasn't space/punct,
          // add a space before current token
          if (
            !isSpaceOrPunct &&
            i > 0 &&
            !/^[\s.,!?;:]$/.test(decodedTokens[i - 1])
          ) {
            result += " ";
          }

          result += token;
        }
        return result;
      }
    }
  }

  getTokenSpans(text, tokens) {
    if (!text || !tokens.length) return [];

    const spans = [];
    let cursor = 0;

    for (const token of tokens) {
      if (!token) continue;

      if (this.tokenizerType === "char") {
        const value = token.value;
        spans.push({
          start: cursor,
          end: cursor + 1,
          token: value,
          text: value,
        });
        cursor += 1;
      } else {
        // For word mode, use the enhanced token information
        const tokenText = token.token;
        const start = text.indexOf(tokenText, cursor);
        if (start === -1) continue;

        const end = start + tokenText.length;
        spans.push({
          start,
          end,
          token: tokenText,
          text: text.slice(start, end),
        });

        // Move cursor past the token and any following space
        cursor = end + (token.followingSpace ? token.followingSpace.length : 0);
      }
    }

    return spans;
  }
}

export default Tokenizer;
