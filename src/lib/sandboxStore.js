const STORAGE_KEY = "sandboxes";

const DEFAULT_CODE = {
  javascript: `// Welcome to Sandbox!\n// Write your JavaScript code here and click Run\n\nconsole.log("Hello, Sandbox! 🚀");\n\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\nconsole.log("Doubled:", doubled);\n`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <style>\n    body {\n      font-family: 'Segoe UI', sans-serif;\n      display: flex;\n      justify-content: center;\n      align-items: center;\n      min-height: 100vh;\n      margin: 0;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      color: white;\n    }\n    .container {\n      text-align: center;\n      padding: 40px;\n      background: rgba(255,255,255,0.1);\n      border-radius: 20px;\n      backdrop-filter: blur(10px);\n    }\n    h1 { font-size: 2.5em; margin-bottom: 10px; }\n    p { font-size: 1.2em; opacity: 0.9; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <h1>Hello, Sandbox! 🚀</h1>\n    <p>Edit this HTML and click Run to see changes</p>\n  </div>\n</body>\n</html>`,
  css: `/* CSS Sandbox */\nbody {\n  margin: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background: #1a1a2e;\n  font-family: sans-serif;\n}\n\n.box {\n  width: 200px;\n  height: 200px;\n  background: linear-gradient(45deg, #e94560, #0f3460);\n  border-radius: 20px;\n  animation: rotate 3s ease-in-out infinite;\n}\n\n@keyframes rotate {\n  0%, 100% { transform: rotate(0deg) scale(1); }\n  50% { transform: rotate(180deg) scale(1.2); }\n}`,
  typescript: `// TypeScript Sandbox\ninterface User {\n  name: string;\n  age: number;\n  email: string;\n}\n\nconst greetUser = (user: User): string => {\n  return \`Hello, \${user.name}! You are \${user.age} years old.\`;\n};\n\nconst user: User = {\n  name: "Sandbox User",\n  age: 25,\n  email: "user@sandbox.dev"\n};\n\nconsole.log(greetUser(user));\nconsole.log("User data:", JSON.stringify(user, null, 2));\n`,
  python: `# Python Sandbox\n# Note: Python runs in a simulated environment\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nfor i in range(10):\n    print(f"fib({i}) = {fibonacci(i)}")\n\nprint("\\nHello from Python Sandbox! 🐍")\n`,
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
    python: "Python",
  };
  return labels[lang] || lang;
}

export function getLanguageIcon(lang) {
  const icons = {
    javascript: "JS",
    typescript: "TS",
    html: "</>",
    css: "#",
    python: "Py",
  };
  return icons[lang] || "?";
}

export function getLanguageColor(lang) {
  const colors = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    html: "#e34c26",
    css: "#264de4",
    python: "#3776ab",
  };
  return colors[lang] || "#8b949e";
}

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "python", label: "Python" },
];

export { DEFAULT_CODE };
