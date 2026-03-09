"use client";

import Editor from "@monaco-editor/react";

const LANGUAGE_MAP = {
  javascript: "javascript",
  typescript: "typescript",
  html: "html",
  css: "css",
  python: "python",
};

export default function CodeEditor({ code, language, onChange }) {
  const monacoLang = LANGUAGE_MAP[language] || "javascript";

  return (
    <Editor
      height="100%"
      language={monacoLang}
      value={code}
      onChange={(value) => onChange(value || "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        lineNumbers: "on",
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        formatOnPaste: true,
        wordWrap: "on",
        tabSize: 2,
        suggest: {
          showKeywords: true,
          showSnippets: true,
        },
      }}
      loading={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#8b949e",
            fontSize: 14,
          }}
        >
          Loading editor...
        </div>
      }
    />
  );
}
