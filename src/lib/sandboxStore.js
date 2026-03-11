const STORAGE_KEY = "sandboxes";

const DEFAULT_HTML_TEMPLATE = `<div class="container">
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <p>This is a paragraph with some <a href="#">link</a> and <strong>bold text</strong>.</p>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
    <li>List item 3</li>
  </ul>
  <div class="box"></div>
  <div class="card">
    <h3>Card Title</h3>
    <p>Card content goes here.</p>
    <button>Click me</button>
  </div>
  <input type="text" placeholder="Input field" />
  <table>
    <tr><th>Name</th><th>Value</th></tr>
    <tr><td>Item 1</td><td>100</td></tr>
    <tr><td>Item 2</td><td>200</td></tr>
  </table>
</div>`;

const DEFAULT_CODE = {
  javascript: `// Welcome to Sandbox!\n// Write your JavaScript code here and click Run\n\nconsole.log("Hello, Sandbox! 🚀");\n\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Doubled:", doubled);\n`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body {\n      font-family: 'Segoe UI', sans-serif;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      margin: 0;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      color: white;\n    }\n    .container {\n      text-align: center;\n      padding: 40px;\n      background: rgba(255,255,255,0.1);\n      border-radius: 20px;\n      backdrop-filter: blur(10px);\n    }\n    h1 { font-size: 2.5em; margin-bottom: 10px; }\n    p { font-size: 1.2em; opacity: 0.9; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello, Sandbox! 🚀</h1>\n    <p>Edit this HTML and click Run to see changes</p>\n  </div>\n</body>\n</html>`,
  css: `/* CSS Sandbox - Style the HTML elements below */\n/* Available: h1, h2, p, a, strong, ul, li, .box, .container, .card, button, input, table */\n\nbody {\n  margin: 0;\n  padding: 40px;\n  font-family: 'Segoe UI', sans-serif;\n  background: #1a1a2e;\n  color: #eee;\n}\n\nh1 {\n  color: #e94560;\n  font-size: 2em;\n}\n\n.card {\n  background: rgba(255,255,255,0.05);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 12px;\n  padding: 24px;\n  margin: 20px 0;\n}\n\nbutton {\n  background: #e94560;\n  color: white;\n  border: none;\n  padding: 10px 24px;\n  border-radius: 8px;\n  cursor: pointer;\n  font-size: 14px;\n}\n\nbutton:hover {\n  background: #c73e54;\n}\n\n.box {\n  width: 100px;\n  height: 100px;\n  background: linear-gradient(45deg, #e94560, #0f3460);\n  border-radius: 16px;\n  animation: rotate 3s ease-in-out infinite;\n  margin: 20px 0;\n}\n\n@keyframes rotate {\n  0%, 100% { transform: rotate(0deg) scale(1); }\n  50% { transform: rotate(180deg) scale(1.2); }\n}`,
  typescript: `// TypeScript Sandbox\ninterface User {\n  name: string;\n  age: number;\n  email: string;\n}\n\nconst greetUser = (user: User): string => {\n  return \`Hello, \${user.name}! You are \${user.age} years old.\`;\n};\n\nconst user: User = {\n  name: "Sandbox User",\n  age: 25,\n  email: "user@sandbox.dev"\n};\n\nconsole.log(greetUser(user));\nconsole.log("User data:", JSON.stringify(user, null, 2));\n`,
  react: `import { useState, useEffect } from 'react';\n\nfunction App() {\n  const [count, setCount] = useState(0);\n\n  useEffect(() => {\n    document.title = \`Count: \${count}\`;\n  }, [count]);\n\n  return (\n    <div style={{\n      minHeight: "100vh",\n      display: "flex",\n      flexDirection: "column",\n      alignItems: "center",\n      justifyContent: "center",\n      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",\n      color: "white",\n      fontFamily: "'Segoe UI', sans-serif",\n    }}>\n      <h1 style={{ fontSize: "2.5em", marginBottom: 10 }}>\n        Hello, React Sandbox! ⚛️\n      </h1>\n      <p style={{ fontSize: "1.2em", opacity: 0.9, marginBottom: 24 }}>\n        Edit this component and click Run\n      </p>\n      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>\n        <button\n          onClick={() => setCount(c => c - 1)}\n          style={{\n            padding: "10px 20px",\n            fontSize: 18,\n            borderRadius: 8,\n            border: "none",\n            background: "rgba(255,255,255,0.2)",\n            color: "white",\n            cursor: "pointer",\n          }}\n        >\n          −\n        </button>\n        <span style={{ fontSize: 48, fontWeight: "bold", minWidth: 80, textAlign: "center" }}>\n          {count}\n        </span>\n        <button\n          onClick={() => setCount(c => c + 1)}\n          style={{\n            padding: "10px 20px",\n            fontSize: 18,\n            borderRadius: 8,\n            border: "none",\n            background: "rgba(255,255,255,0.2)",\n            color: "white",\n            cursor: "pointer",\n          }}\n        >\n          +\n        </button>\n      </div>\n    </div>\n  );\n}\n`,
};

export function getSandboxes() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getSandbox(id) {
  const sandboxes = getSandboxes();
  return sandboxes.find((s) => s.id === id) || null;
}

export function createSandbox(name, language = "javascript") {
  const sandboxes = getSandboxes();
  const newSandbox = {
    id: crypto.randomUUID(),
    name,
    language,
    code: DEFAULT_CODE[language] || DEFAULT_CODE.javascript,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sandboxes.unshift(newSandbox);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sandboxes));
  return newSandbox;
}

export function updateSandbox(id, updates) {
  const sandboxes = getSandboxes();
  const index = sandboxes.findIndex((s) => s.id === id);
  if (index === -1) return null;
  sandboxes[index] = {
    ...sandboxes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sandboxes));
  return sandboxes[index];
}

export function deleteSandbox(id) {
  const sandboxes = getSandboxes();
  const filtered = sandboxes.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getLanguageLabel(lang) {
  const labels = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    html: "HTML",
    css: "CSS",
    react: "React",
  };
  return labels[lang] || lang;
}

export function getLanguageIcon(lang) {
  const icons = {
    javascript: "JS",
    typescript: "TS",
    html: "</>",
    css: "#",
    react: "⚛",
  };
  return icons[lang] || "?";
}

export function getLanguageColor(lang) {
  const colors = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    html: "#e34c26",
    css: "#264de4",
    react: "#61dafb",
  };
  return colors[lang] || "#8b949e";
}

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "react", label: "React (JSX)" },
];

export { DEFAULT_CODE, DEFAULT_HTML_TEMPLATE };
