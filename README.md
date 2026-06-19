# AI Code Review Tool

An AI-powered code review tool with real static analysis capabilities. Built with Node.js/Express backend and vanilla JavaScript frontend.

![AI Code Review Tool](https://img.shields.io/badge/AI-Code%20Review-Tool-blue?style=for-the-badge)

## Features

- **Real Static Analysis Engine** - Not mock data, actual code analysis
- **Multi-language Support** - JavaScript, Python, Java, C++, Go, Rust
- **Dark Theme IDE Interface** - Beautiful, professional design
- **Code Quality Scoring** - Visual gauge from 0-100
- **Severity Levels** - Error, Warning, Info with color coding
- **Analysis History** - Stored in localStorage for quick access
- **Responsive Design** - Works on desktop and mobile

## Analysis Capabilities

### Bug Detection
- Unused variables
- Null/undefined reference issues
- Off-by-one errors
- Empty catch blocks
- Missing await statements
- Unreachable code
- Integer overflow risks

### Security Issues
- `eval()` usage
- SQL injection patterns
- Hardcoded secrets/passwords
- XSS vulnerabilities (innerHTML)
- Insecure HTTP URLs
- ReDoS potential
- Disabled TLS verification

### Code Quality
- Cyclomatic complexity
- Nesting depth
- Long lines (>120 chars)
- Magic numbers
- TODO/FIXME comments
- Console statements
- Deprecated patterns

### Metrics
- Lines of code
- Function count
- Comment ratio
- Code complexity score

## Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn

### Installation

```bash
# Clone or download the project
cd 03-ai-code-review

# Install dependencies
npm install

# Start the server
npm start
```

### Development Mode

```bash
# Install nodemon globally (optional)
npm install -g nodemon

# Start with auto-reload
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

## Usage

1. Select a programming language from the dropdown
2. Paste or write your code in the editor
3. Click **Analyze** to run the static analysis
4. View results in the right panel with severity levels
5. Click on any issue to jump to that line in the editor
6. Check **History** tab to see previous analyses

## Project Structure

```
03-ai-code-review/
├── public/
│   └── index.html      # Frontend UI
├── server.js           # Backend API & analysis engine
├── package.json        # Dependencies
└── README.md           # This file
```

## API Endpoints

### POST /api/analyze

Analyze code for issues and metrics.

**Request Body:**
```json
{
  "code": "function foo() { ... }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "issues": [...],
  "stats": {
    "totalLines": 10,
    "codeLines": 8,
    "commentLines": 1,
    "commentRatio": "10.0",
    "functions": 2,
    "complexity": 3
  },
  "score": 85,
  "language": "javascript"
}
```

## Customization

### Adding New Languages

Edit `server.js` and add language-specific patterns to the `CodeAnalyzer` class:

```javascript
// In detectUnusedVariables()
const declarationPatterns = {
  // Add your language patterns here
  typescript: [
    { pattern: /\b(?:const|let|var)\s+(\w+)/g, groups: 1 }
  ]
};
```

### Modifying Scoring

Adjust the `calculateScore()` method in `CodeAnalyzer` class to change how issues affect the final score.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for developers who care about code quality
