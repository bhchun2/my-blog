import { escapeHtml } from "./util.js";

// Hand-rolled, regex-based single-pass lexer. Not a real grammar — good
// enough for common cases, but things like nested template-literal
// interpolation or JS regex-vs-division disambiguation are not handled.
const JS_KEYWORDS =
  "const let var function return if else for while do class extends super new this typeof instanceof try catch finally throw switch case break continue default import export from as async await yield null undefined true false in of static get set";

const RULES = {
  js: [
    { type: "comment", re: /\/\/.*|\/\*[\s\S]*?\*\//y },
    { type: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y },
    { type: "number", re: /\b\d+(?:\.\d+)?\b/y },
    { type: "keyword", re: keywordRegex(JS_KEYWORDS) },
    { type: "function", re: /\b[A-Za-z_$][\w$]*(?=\s*\()/y },
  ],
  css: [
    { type: "comment", re: /\/\*[\s\S]*?\*\//y },
    { type: "string", re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/y },
    { type: "number", re: /\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?\b/y },
    { type: "keyword", re: /@[a-zA-Z-]+|#[0-9a-fA-F]{3,8}\b/y },
    { type: "function", re: /\b[a-zA-Z-]+(?=\s*:)/y },
  ],
  json: [
    { type: "string", re: /"(?:[^"\\]|\\.)*"/y },
    { type: "number", re: /\b-?\d+(?:\.\d+)?\b/y },
    { type: "keyword", re: keywordRegex("true false null") },
  ],
  bash: [
    { type: "comment", re: /#.*/y },
    { type: "string", re: /"(?:[^"\\]|\\.)*"|'[^']*'/y },
    { type: "keyword", re: keywordRegex("if then else fi for while do done function echo export return cd ls") },
  ],
  html: [
    { type: "comment", re: /<!--[\s\S]*?-->/y },
    { type: "string", re: /"[^"]*"|'[^']*'/y },
    { type: "keyword", re: /[a-zA-Z][\w-]*/y },
  ],
};
RULES.jsx = RULES.js;
RULES.ts = RULES.js;
RULES.typescript = RULES.js;
RULES.javascript = RULES.js;
RULES.shell = RULES.bash;
RULES.sh = RULES.bash;

function keywordRegex(words) {
  const alternation = words.trim().split(/\s+/).join("|");
  return new RegExp(`\\b(?:${alternation})\\b`, "y");
}

function tokenize(code, rules) {
  const tokens = [];
  let pos = 0;
  while (pos < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = pos;
      const m = rule.re.exec(code);
      if (m && m.index === pos && m[0].length > 0) {
        tokens.push({ type: rule.type, text: m[0] });
        pos += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const last = tokens[tokens.length - 1];
      if (last && last.type === null) {
        last.text += code[pos];
      } else {
        tokens.push({ type: null, text: code[pos] });
      }
      pos++;
    }
  }
  return tokens;
}

function renderTokens(tokens) {
  return tokens
    .map((t) => (t.type ? `<span class="tok-${t.type}">${escapeHtml(t.text)}</span>` : escapeHtml(t.text)))
    .join("");
}

export function highlightCodeBlocks(container) {
  container.querySelectorAll("pre > code").forEach((codeEl) => {
    const langMatch = codeEl.className.match(/language-(\w+)/);
    const lang = langMatch ? langMatch[1].toLowerCase() : null;
    const rules = lang && RULES[lang];
    if (!rules) return;

    const code = codeEl.textContent;
    const tokens = tokenize(code, rules);
    codeEl.innerHTML = renderTokens(tokens);
  });
}
