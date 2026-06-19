<h1 align="center">🤖 AI Code Review Tool</h1>

<p align="center">
  <em>Static analysis engine that detects bugs, security issues, and code smells across 6 languages</em>
</p>

<p align="center">
  <a href="https://knight-rule.github.io/ai-code-review"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" alt="Express">
</p>

---

## ✨ Features

- [x] **Real Static Analysis Engine** — Not just linting — actual code understanding
- [x] **15+ Detection Patterns** — Catches common bugs, anti-patterns, and smells
- [x] **Security Vulnerability Detection** — SQL injection, XSS, hardcoded secrets, and more
- [x] **Cyclomatic Complexity** — Measures code complexity with actionable feedback
- [x] **Code Quality Score** — Get an instant letter grade for your code
- [x] **6 Language Support** — JavaScript, Python, Java, C++, Go, and Rust
- [x] **History Tracking** — Review history stored locally for comparison

## 📸 Screenshot

![screenshot](screenshot.png)

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Server runtime and analysis engine |
| Express | API endpoints and web interface |
| Custom Parser | AST-free pattern matching engine |

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/knight-rule/ai-code-review.git

# Navigate to the project
cd ai-code-review

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at `http://localhost:3000`

## 📖 Usage

1. **Select Language** — Choose from JavaScript, Python, Java, C++, Go, or Rust
2. **Paste Code** — Drop your code snippet into the editor
3. **Click Analyze** — Run the static analysis engine
4. **Review Results** — See issues categorized by severity and type
5. **Check History** — Compare with previous analyses

```bash
# API Usage
POST /api/review
Body: {
  "language": "javascript",
  "code": "function example() { ... }"
}

# Response includes:
# - issues[]: Array of detected problems
# - score: Quality grade (A-F)
# - complexity: Cyclomatic complexity score
# - suggestions: Improvement recommendations
```

## ⚙️ How It Works

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Code Input  │───▶│  Tokenizer   │───▶│  Pattern    │
│  + Language   │    │              │    │  Matcher    │
└─────────────┘    └──────────────┘    └──────┬──────┘
                                              │
                         ┌────────────────────┘
                         ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Report     │◀───│  Scoring     │◀───│  15+ Rules  │
│  Generator  │    │  Engine      │    │  Database   │
└─────────────┘    └──────────────┘    └─────────────┘
```

The engine uses pattern-based static analysis:
1. **Tokenization** — Code is split into meaningful tokens
2. **Pattern Matching** — Tokens are checked against 15+ vulnerability and smell patterns
3. **Complexity Analysis** — Control flow is mapped to calculate cyclomatic complexity
4. **Scoring** — Issues are weighted and combined into a quality grade
5. **Reporting** — Results are formatted with line numbers, severity, and fix suggestions

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Prashant** — [@knight-rule](https://github.com/knight-rule)

<p align="center">
  Made with ❤️ for writing better code
</p>
