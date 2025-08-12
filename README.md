# Custom Tokenizer App

An interactive web application for text tokenization, demonstrating both word-based and character-based tokenization approaches. Built with React and Vite.

## 🚀 Features

- **Multiple Tokenization Methods**
  - Word-based tokenization
  - Character-based tokenization


- **Interactive UI**
  - Real-time tokenization visualization
  - Highlighted token display
  - Easy token ID copying
  - Interactive encode/decode functionality

- **Advanced Processing**
  - Proper handling of special tokens ([BOS], [EOS], [PAD], [UNK])
  - Case-sensitive token handling
  - Intelligent space and punctuation preservation

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd custom-tokenizer-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 💡 Usage Guide

### Input Text
1. Enter any text in the input field
2. Choose tokenization type (word/character)
3. See real-time tokenization results

### Encoding
- Text is automatically encoded when you type
- Special tokens are added ([BOS] at start, [EOS] at end)
- Unknown tokens are marked as [UNK]
- Tokens are displayed with their IDs

### Decoding
1. Input token IDs in the decode field
2. Click "Decode" button to convert back to text
3. View the reconstructed text output

### Copy Functionality
- Use the "Copy" button to copy encoded tokens
- Tokens are copied in a comma-separated format

## 🔍 Example

Input Text:
```
Namaste JI, Custom Tokenizer App me aapka Swagat hai
```

Encoded Output (Word-based):
```
2, 4, 5, 6, 7, 8, 9, 1, 10, 11, 3
```
Where:
- 2: [BOS] token
- 4-11: Vocabulary tokens
- 1: [UNK] token for unknown words
- 3: [EOS] token

## 🛠️ Technical Details

### Token Types
- `[BOS]`: Beginning of sequence token (ID: 2)
- `[EOS]`: End of sequence token (ID: 3)
- `[UNK]`: Unknown token (ID: 1)
- `[PAD]`: Padding token (ID: 0)

### Tokenization Logic
- Word mode: Splits on spaces and punctuation
- Character mode: Processes each character individually
- Preserves original text formatting
- Handles case sensitivity

## 📝 License

MIT License

## 🤝 Contributing

Feel free to:
- Open issues
- Submit pull requests
- Suggest improvements
- Report bugs

Your contributions are welcome!
