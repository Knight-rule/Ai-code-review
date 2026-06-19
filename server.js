const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Static Analysis Engine
class CodeAnalyzer {
  constructor(code, language) {
    this.code = code;
    this.language = language;
    this.lines = code.split('\n');
    this.issues = [];
    this.stats = {};
  }

  analyze() {
    this.calculateStats();
    this.detectUnusedVariables();
    this.detectPotentialBugs();
    this.detectSecurityIssues();
    this.detectCodeSmells();
    this.detectComplexityIssues();
    
    const score = this.calculateScore();
    
    return {
      issues: this.issues,
      stats: this.stats,
      score: score,
      language: this.language
    };
  }

  calculateStats() {
    const codeLines = this.lines.filter(l => l.trim().length > 0);
    const commentLines = this.lines.filter(l => this.isComment(l.trim()));
    const functionCount = this.countFunctions();
    
    this.stats = {
      totalLines: this.lines.length,
      codeLines: codeLines.length,
      commentLines: commentLines.length,
      commentRatio: this.lines.length > 0 ? (commentLines.length / this.lines.length * 100).toFixed(1) : 0,
      functions: functionCount,
      blankLines: this.lines.filter(l => l.trim().length === 0).length
    };
  }

  isComment(line) {
    const commentPatterns = {
      javascript: [/^\/\//, /^\/\*/, /^\*/],
      python: [/^#/],
      java: [/^\/\//, /^\/\*/, /^\*/],
      cpp: [/^\/\//, /^\/\*/, /^\*/, /^#/],
      go: [/^\/\//, /^\/\*/],
      rust: [/^\/\//, /^\/\*/, /^\*/, /^#!\[/]
    };
    
    const patterns = commentPatterns[this.language] || commentPatterns.javascript;
    return patterns.some(p => p.test(line));
  }

  countFunctions() {
    const functionPatterns = {
      javascript: [/\bfunction\s+\w+/, /const\s+\w+\s*=\s*\(/, /=>\s*{/, /async\s+function/],
      python: [/\bdef\s+\w+/],
      java: [/\b(public|private|protected|static)\s+[\w<>\[\]]+\s+\w+\s*\(/],
      cpp: [/\b[\w:]+\s+\w+\s*\([^)]*\)\s*({|$)/],
      go: [/\bfunc\s+/],
      rust: [/\bfn\s+\w+/]
    };
    
    const patterns = functionPatterns[this.language] || functionPatterns.javascript;
    let count = 0;
    
    for (const line of this.lines) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          count++;
          break;
        }
      }
    }
    
    return count;
  }

  detectUnusedVariables() {
    const varDeclarations = [];
    const varUsages = new Set();
    
    const declarationPatterns = {
      javascript: [
        { pattern: /\b(?:const|let|var)\s+(\w+)/g, groups: 1 }
      ],
      python: [
        { pattern: /^(\w+)\s*=/g, groups: 1 },
        { pattern: /\bfor\s+(\w+)\s+in/g, groups: 1 }
      ],
      java: [
        { pattern: /(?:int|long|float|double|char|boolean|String|var|final)\s+(\w+)/g, groups: 1 }
      ],
      cpp: [
        { pattern: /(?:int|long|float|double|char|bool|auto|const)\s+(\w+)/g, groups: 1 }
      ],
      go: [
        { pattern: /(?:var|:=)\s*(\w+)/g, groups: 1 }
      ],
      rust: [
        { pattern: /\blet\s+(?:mut\s+)?(\w+)/g, groups: 1 }
      ]
    };

    const patterns = declarationPatterns[this.language] || declarationPatterns.javascript;
    
    this.lines.forEach((line, lineNum) => {
      for (const { pattern, groups } of patterns) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        while ((match = regex.exec(line)) !== null) {
          const varName = match[groups];
          if (varName && varName.length > 1 && !['if', 'else', 'for', 'while', 'return', 'function', 'class'].includes(varName)) {
            varDeclarations.push({ name: varName, line: lineNum + 1 });
          }
        }
      }
      
      const words = line.match(/\b[a-zA-Z_]\w*\b/g) || [];
      words.forEach(word => varUsages.add(word));
    });

    const declaredNames = new Set();
    varDeclarations.forEach(v => declaredNames.add(v.name));
    
    varDeclarations.forEach(v => {
      const usageCount = Array.from(varUsages).filter(u => u === v.name).length;
      if (usageCount <= 1) {
        this.addIssue('warning', 'unused-variable', `Variable '${v.name}' appears unused`, v.line, 'suggestion');
      }
    });
  }

  detectPotentialBugs() {
    this.lines.forEach((line, lineNum) => {
      const lineNum1 = lineNum + 1;
      
      // Null/undefined checks
      if (this.language === 'javascript' || this.language === 'typescript') {
        if (/==\s*null|!=\s*null/.test(line) && !/===|!==/.test(line)) {
          this.addIssue('warning', 'loose-equality', 'Use strict equality (===) instead of loose equality', lineNum1, 'bug');
        }
        
        if (/\bundefined\s*==/.test(line) || /==\s*undefined/.test(line)) {
          this.addIssue('warning', 'undefined-comparison', 'Avoid comparing with undefined, use nullish coalescing', lineNum1, 'bug');
        }
      }
      
      // Off-by-one errors
      if (/\[\s*\w+\.length\s*-\s*1\s*\]/.test(line) && /for|while/.test(line)) {
        this.addIssue('info', 'off-by-one', 'Potential off-by-one error, verify array boundary', lineNum1, 'bug');
      }
      
      // Empty catch blocks
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line)) {
        this.addIssue('warning', 'empty-catch', 'Empty catch block swallows errors silently', lineNum1, 'bug');
      }
      
      // Missing await
      if (/\bfetch\s*\(|\.then\s*\(/.test(line) && !/await|\.then/.test(line)) {
        this.addIssue('info', 'missing-await', 'Promise may need to be awaited', lineNum1, 'bug');
      }
      
      // Integer overflow risk
      if (/parseInt\s*\(/.test(line) && !/radix/.test(line)) {
        this.addIssue('info', 'missing-radix', 'parseInt() without radix parameter', lineNum1, 'bug');
      }
      
      // Potential null dereference (Java/Go)
      if (this.language === 'java' || this.language === 'go') {
        if (/\.\w+\(/.test(line) && !/null|undefined|if/.test(line)) {
          const objMatch = line.match(/(\w+)\.\w+\(/);
          if (objMatch && !line.includes('System') && !line.includes('fmt')) {
            this.addIssue('info', 'null-dereference', `Potential null dereference on '${objMatch[1]}'`, lineNum1, 'bug');
          }
        }
      }
      
      // Unreachable code after return
      if (/^\s*return\b/.test(line) && lineNum > 0) {
        const prevLine = this.lines[lineNum - 1];
        if (prevLine && /^\s*(return|break|continue)\b/.test(prevLine)) {
          this.addIssue('warning', 'unreachable-code', 'Unreachable code after return/break/continue', lineNum1, 'bug');
        }
      }
    });
  }

  detectSecurityIssues() {
    this.lines.forEach((line, lineNum) => {
      const lineNum1 = lineNum + 1;
      
      // eval() usage
      if (/\beval\s*\(/.test(line)) {
        this.addIssue('error', 'eval-usage', 'eval() is a security risk and should be avoided', lineNum1, 'security');
      }
      
      // SQL injection patterns
      if (/(?:SELECT|INSERT|UPDATE|DELETE|DROP).*['"]?\s*\+\s*\w+/i.test(line)) {
        this.addIssue('error', 'sql-injection', 'Potential SQL injection - use parameterized queries', lineNum1, 'security');
      }
      
      // Hardcoded secrets
      if (/(?:password|secret|api_key|apikey|token)\s*[=:]\s*['"][^'"]+['"]/i.test(line)) {
        this.addIssue('error', 'hardcoded-secret', 'Potential hardcoded secret detected', lineNum1, 'security');
      }
      
      // innerHTML usage
      if (/\.innerHTML\s*=/.test(line)) {
        this.addIssue('warning', 'xss-innerhtml', 'innerHTML can lead to XSS attacks', lineNum1, 'security');
      }
      
      // document.write
      if (/\bdocument\.write\s*\(/.test(line)) {
        this.addIssue('warning', 'document-write', 'document.write() is deprecated and can be insecure', lineNum1, 'security');
      }
      
      // HTTP (non-HTTPS) URLs
      if (/http:\/\/(?!localhost|127\.0\.0\.1)/.test(line)) {
        this.addIssue('info', 'insecure-url', 'Consider using HTTPS instead of HTTP', lineNum1, 'security');
      }
      
      // Unsafe regex (ReDoS potential)
      if (/\(\?:.*\+\)\+|\(\?:.*\*\)\*|\(\?:.*\?\)\?/.test(line)) {
        this.addIssue('warning', 'regex-dos', 'Potential ReDoS vulnerability in regex pattern', lineNum1, 'security');
      }
      
      // Disabled security features
      if (/NODE_TLS_REJECT_UNAUTHORIZED.*0|rejectUnauthorized.*false/i.test(line)) {
        this.addIssue('error', 'tls-disabled', 'TLS verification disabled - security risk', lineNum1, 'security');
      }
    });
  }

  detectCodeSmells() {
    this.lines.forEach((line, lineNum) => {
      const lineNum1 = lineNum + 1;
      const trimmed = line.trim();
      
      // Long lines
      if (line.length > 120) {
        this.addIssue('info', 'long-line', `Line exceeds 120 characters (${line.length})`, lineNum1, 'style');
      }
      
      // Magic numbers
      const magicNumMatch = trimmed.match(/(?<!=\s*)(?<![0x])[2-9]\d{2,}(?!\w)/);
      if (magicNumMatch && !/const|let|var|#define|const\s/.test(trimmed)) {
        this.addIssue('info', 'magic-number', `Magic number detected: ${magicNumMatch[0]}`, lineNum1, 'style');
      }
      
      // TODO/FIXME/HACK comments
      if (/TODO|FIXME|HACK|XXX/.test(trimmed)) {
        this.addIssue('info', 'todo-comment', 'TODO/FIXME comment found', lineNum1, 'style');
      }
      
      // console.log in production code
      if (/console\.(log|debug|info)\s*\(/.test(trimmed)) {
        this.addIssue('warning', 'console-log', 'Console statement in code', lineNum1, 'style');
      }
      
      // var usage in JavaScript
      if (this.language === 'javascript' && /\bvar\s+/.test(trimmed)) {
        this.addIssue('info', 'var-usage', 'Consider using const/let instead of var', lineNum1, 'style');
      }
      
      // Nested ternary
      if (/\?[^:]*\?/.test(trimmed) && /\?:|\?[^:]*:/.test(trimmed)) {
        this.addIssue('warning', 'nested-ternary', 'Nested ternary operators reduce readability', lineNum1, 'style');
      }
      
      // Deeply nested code (basic detection)
      const indent = line.length - line.trimStart().length;
      if (indent >= 24) {
        this.addIssue('warning', 'deep-nesting', 'Deeply nested code detected, consider refactoring', lineNum1, 'style');
      }
      
      // Boolean parameter names
      if (/\bfunction\s+\w+\s*\([^)]*\b(is|has|can|should|will)[A-Z]/.test(trimmed)) {
        this.addIssue('info', 'boolean-naming', 'Consider renaming boolean parameters with is/has/can prefix', lineNum1, 'style');
      }
    });
  }

  detectComplexityIssues() {
    let nestingLevel = 0;
    let maxNesting = 0;
    let complexity = 1;
    
    this.lines.forEach((line, lineNum) => {
      const trimmed = line.trim();
      
      // Track nesting
      if (/\{/.test(trimmed)) {
        nestingLevel++;
        maxNesting = Math.max(maxNesting, nestingLevel);
      }
      if(/\}/.test(trimmed)) {
        nestingLevel--;
      }
      
      // Cyclomatic complexity
      if (/\b(if|else\s+if|elif|else if)\b/.test(trimmed)) complexity++;
      if (/\b(for|while|do)\b/.test(trimmed)) complexity++;
      if (/\b(case)\b/.test(trimmed)) complexity++;
      if (/&&|\|\||\?\?/.test(trimmed)) complexity++;
      if (/\bcatch\b/.test(trimmed)) complexity++;
    });
    
    this.stats.complexity = complexity;
    this.stats.maxNesting = maxNesting;
    
    if (complexity > 15) {
      this.addIssue('warning', 'high-complexity', `High cyclomatic complexity: ${complexity}`, 1, 'complexity');
    } else if (complexity > 10) {
      this.addIssue('info', 'moderate-complexity', `Moderate cyclomatic complexity: ${complexity}`, 1, 'complexity');
    }
    
    if (maxNesting > 4) {
      this.addIssue('warning', 'deep-nesting', `Deep nesting detected: ${maxNesting} levels`, 1, 'complexity');
    }
  }

  addIssue(severity, type, message, line, category) {
    this.issues.push({
      severity,
      type,
      message,
      line,
      category
    });
  }

  calculateScore() {
    let score = 100;
    
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    });
    
    // Bonus for good practices
    if (this.stats.commentRatio > 10) score += 5;
    if (this.stats.functions > 0) score += 5;
    if (this.stats.complexity <= 10) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }
}

// API Endpoint
app.post('/api/analyze', (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const analyzer = new CodeAnalyzer(code, language);
    const result = analyzer.analyze();
    
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AI Code Review server running on http://localhost:${PORT}`);
});
