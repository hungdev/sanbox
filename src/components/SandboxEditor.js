"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  ArrowLeft,
  Save,
  Square,
  Braces,
  List,
} from "lucide-react";
import { transform } from "sucrase";
import CodeEditor from "./CodeEditor";
import OutputPanel from "./OutputPanel";
import HtmlPreview from "./HtmlPreview";
import {
  getSandbox,
  updateSandbox,
  LANGUAGES,
  getLanguageColor,
  getLanguageLabel,
  DEFAULT_CODE,
  DEFAULT_HTML_TEMPLATE,
} from "@/lib/sandboxStore";

export default function SandboxEditor({ id }) {
  const router = useRouter();
  const [sandbox, setSandbox] = useState(null);
  const [code, setCode] = useState("");
  const [outputs, setOutputs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [htmlOutput, setHtmlOutput] = useState("");
  const [panelWidth, setPanelWidth] = useState(50);
  const [isSaved, setIsSaved] = useState(true);
  const [inspectMode, setInspectMode] = useState("simple");
  const [hasRun, setHasRun] = useState(false);
  const [cssTab, setCssTab] = useState("css");
  const [htmlTemplate, setHtmlTemplate] = useState(DEFAULT_HTML_TEMPLATE);
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const sb = getSandbox(id);
    if (sb) {
      setSandbox(sb);
      setCode(sb.code);
      if (sb.htmlTemplate) {
        setHtmlTemplate(sb.htmlTemplate);
      }
    } else {
      router.push("/");
    }
  }, [id, router]);

  const handleCodeChange = useCallback(
    (newCode) => {
      setCode(newCode);
      setIsSaved(false);
    },
    []
  );

  const handleHtmlTemplateChange = useCallback((newHtml) => {
    setHtmlTemplate(newHtml);
    setIsSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    if (sandbox) {
      const updates = { code };
      if (sandbox.language === "css") {
        updates.htmlTemplate = htmlTemplate;
      }
      updateSandbox(sandbox.id, updates);
      setIsSaved(true);
    }
  }, [sandbox, code, htmlTemplate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleRun = useCallback(() => {
    if (!sandbox) return;
    setIsRunning(true);
    setOutputs([]);
    handleSave();

    if (sandbox.language === "html") {
      setHtmlOutput(code);
      setOutputs([{ type: "log", content: "✓ HTML rendered successfully" }]);
      setIsRunning(false);
      return;
    }

    if (sandbox.language === "css") {
      const htmlWithCss = `<!DOCTYPE html><html><head><style>${code}</style></head><body>${htmlTemplate}</body></html>`;
      setHtmlOutput(htmlWithCss);
      setOutputs([{ type: "log", content: "✓ CSS rendered successfully" }]);
      setIsRunning(false);
      return;
    }

    const collectedOutputs = [];

    try {
      let execCode = code;

      if (sandbox.language === "typescript") {
        try {
          const result = transform(code, {
            transforms: ["typescript"],
            disableESTransforms: true,
          });
          execCode = result.code;
        } catch (tsError) {
          collectedOutputs.push({
            type: "error",
            content: `TypeScript Error: ${tsError.message}`,
          });
          setOutputs(collectedOutputs);
          setIsRunning(false);
          return;
        }
      }

      if (sandbox.language === "react") {
        try {
          const strippedCode = code.replace(/^import\s+.*?from\s+['"]react['"];?\s*$/gm, "");

          const result = transform(strippedCode, {
            transforms: ["jsx"],
            jsxRuntime: "classic",
            production: true,
          });
          const transpiledCode = result.code;

          const reactHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
<style>* { margin: 0; box-sizing: border-box; }</style>
</head>
<body>
<div id="root"></div>
<script>
(function() {
  var _posted = {};
  ['log','error','warn','info'].forEach(function(m) {
    var orig = window.console[m];
    window.console[m] = function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        try {
          args.push(typeof arguments[i] === 'object' ? JSON.stringify(arguments[i], null, 2) : String(arguments[i]));
        } catch(e) { args.push(String(arguments[i])); }
      }
      var key = m + ':' + args.join(' ');
      if (!_posted[key]) { _posted[key] = 0; }
      _posted[key]++;
      if (_posted[key] <= 5) {
        window.parent.postMessage({ type: 'console', method: m === 'info' ? 'log' : m, content: args.join(' ') }, '*');
      }
      if (orig) orig.apply(console, arguments);
    };
  });
  window.onerror = function(msg, url, line) {
    window.parent.postMessage({ type: 'console', method: 'error', content: msg + (line ? ' (line ' + line + ')' : '') }, '*');
  };
})();
<\/script>
<script>
var { useState, useEffect, useRef, useCallback, useMemo, useReducer, useContext, createContext, Fragment, memo, forwardRef, lazy, Suspense, StrictMode, Children, cloneElement, createElement, isValidElement } = React;
var { createRoot, createPortal } = ReactDOM;

try {
  ${transpiledCode}

  var _appComponent = typeof App !== 'undefined' ? App : null;
  if (!_appComponent) {
    var _keys = Object.keys(window).filter(function(k) { return typeof window[k] === 'function' && /^[A-Z]/.test(k) && k !== 'React' && k !== 'ReactDOM'; });
    if (_keys.length > 0) _appComponent = window[_keys[_keys.length - 1]];
  }

  if (_appComponent) {
    var root = createRoot(document.getElementById('root'));
    root.render(React.createElement(_appComponent));
  } else {
    document.getElementById('root').innerHTML = '<div style="padding:40px;color:#f85149;font-family:monospace;">No React component found. Define a function component like:<br><br><code>function App() { return &lt;h1&gt;Hello&lt;/h1&gt;; }</code></div>';
  }
} catch(e) {
  document.getElementById('root').innerHTML = '<div style="padding:40px;color:#f85149;font-family:monospace;">' + e.message + '</div>';
  window.parent.postMessage({ type: 'console', method: 'error', content: e.message }, '*');
}
<\/script>
</body>
</html>`;

          setHtmlOutput(reactHtml);
          setOutputs([{ type: "log", content: "✓ React component rendered successfully" }]);
          setIsRunning(false);
          return;
        } catch (jsxError) {
          collectedOutputs.push({
            type: "error",
            content: `JSX Error: ${jsxError.message}`,
          });
          setOutputs(collectedOutputs);
          setIsRunning(false);
          return;
        }
      }

      const isDetailed = inspectMode === "detailed";

      const formatValue = (val, depth = 0, seen = new WeakSet()) => {
        if (val === null) return "null";
        if (val === undefined) return "undefined";
        if (typeof val === "string") return depth > 0 ? `"${val}"` : val;
        if (typeof val === "number" || typeof val === "boolean") return String(val);
        if (typeof val === "symbol") return val.toString();
        if (typeof val === "function") return `[Function: ${val.name || "anonymous"}]`;
        if (typeof val === "bigint") return `${val}n`;

        if (typeof val === "object") {
          if (seen.has(val)) return "[Circular]";
          seen.add(val);

          if (val instanceof Error) return `${val.name}: ${val.message}`;
          if (val instanceof Date) return val.toISOString();
          if (val instanceof RegExp) return val.toString();
          if (val instanceof Map) {
            const entries = [...val.entries()].map(([k, v]) => `${formatValue(k, depth + 1, seen)} => ${formatValue(v, depth + 1, seen)}`);
            return `Map(${val.size}) { ${entries.join(", ")} }`;
          }
          if (val instanceof Set) {
            const entries = [...val.values()].map((v) => formatValue(v, depth + 1, seen));
            return `Set(${val.size}) { ${entries.join(", ")} }`;
          }

          if (Array.isArray(val)) {
            if (depth > 3) return "[Array]";
            const items = val.map((v) => formatValue(v, depth + 1, seen));
            return `[${items.join(", ")}]`;
          }

          if (depth > 3) return "{...}";

          if (!isDetailed) {
            try {
              const result = JSON.stringify(val, null, 2);
              if (result !== undefined) return result;
            } catch {}
            return String(val);
          }

          const indent = "  ".repeat(depth + 1);
          const closingIndent = "  ".repeat(depth);

          const ownKeys = Object.getOwnPropertyNames(val);
          const ownPairs = ownKeys.map((k) => {
            try { return `${indent}${k}: ${formatValue(val[k], depth + 1, seen)}`; }
            catch { return `${indent}${k}: [Getter]`; }
          });

          const proto = Object.getPrototypeOf(val);
          const hasCustomProto = proto && proto !== Object.prototype;
          let protoStr = "";
          if (hasCustomProto) {
            const protoKeys = Object.getOwnPropertyNames(proto).filter((k) => k !== "constructor");
            if (protoKeys.length > 0) {
              const protoPairs = protoKeys.map((k) => {
                try { return `${indent}  ${k}: ${formatValue(proto[k], depth + 2, seen)}`; }
                catch { return `${indent}  ${k}: [Getter]`; }
              });
              protoStr = `${indent}[[Prototype]]: {\n${protoPairs.join(",\n")}\n${indent}}`;
            }
          }

          const allParts = [...ownPairs];
          if (protoStr) allParts.push(protoStr);

          if (allParts.length === 0) return "{}";

          return `{\n${allParts.join(",\n")}\n${closingIndent}}`;
        }

        return String(val);
      };

      const formatArgs = (args) =>
        args.map((a) => formatValue(a)).join(" ");

      const originalConsole = { ...console };
      const fakeConsole = {
        log: (...args) => {
          collectedOutputs.push({ type: "log", content: formatArgs(args) });
        },
        error: (...args) => {
          collectedOutputs.push({ type: "error", content: formatArgs(args) });
        },
        warn: (...args) => {
          collectedOutputs.push({ type: "warn", content: formatArgs(args) });
        },
        info: (...args) => {
          collectedOutputs.push({ type: "log", content: formatArgs(args) });
        },
        table: (data) => {
          collectedOutputs.push({ type: "log", content: formatValue(data) });
        },
      };

      const fn = new Function("console", execCode);
      fn(fakeConsole);

      Object.assign(console, originalConsole);
    } catch (error) {
      collectedOutputs.push({
        type: "error",
        content: `${error.name}: ${error.message}`,
      });
    }

    setOutputs(collectedOutputs);
    setHasRun(true);
    setTimeout(() => setIsRunning(false), 300);
  }, [sandbox, code, handleSave, inspectMode]);

  const handleConsoleOutput = useCallback((msg) => {
    setOutputs((prev) => [...prev, msg]);
  }, []);

  const prevInspectMode = useRef(inspectMode);
  useEffect(() => {
    if (prevInspectMode.current !== inspectMode) {
      prevInspectMode.current = inspectMode;
      if (hasRun) {
        handleRun();
      }
    }
  }, [inspectMode, hasRun, handleRun]);

  const handleMouseDown = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e) => {
      if (!isResizing.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.max(20, Math.min(80, percent)));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const handleLanguageChange = useCallback(
    (e) => {
      const newLang = e.target.value;
      if (sandbox) {
        const updates = {
          language: newLang,
          code: DEFAULT_CODE[newLang] || "",
        };
        if (newLang === "css") {
          updates.htmlTemplate = DEFAULT_HTML_TEMPLATE;
          setHtmlTemplate(DEFAULT_HTML_TEMPLATE);
          setCssTab("css");
        }
        const updatedSandbox = updateSandbox(sandbox.id, updates);
        setSandbox(updatedSandbox);
        setCode(updatedSandbox.code);
        setOutputs([]);
        setHtmlOutput("");
      }
    },
    [sandbox]
  );

  if (!sandbox) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--text-muted)",
        }}
      >
        Loading...
      </div>
    );
  }

  const isPreviewLanguage =
    sandbox.language === "html" || sandbox.language === "css" || sandbox.language === "react";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 52,
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border-color)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              borderRadius: 6,
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div
            style={{
              width: 1,
              height: 24,
              background: "var(--border-color)",
            }}
          />

          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: getLanguageColor(sandbox.language),
            }}
          />

          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground)",
            }}
          >
            {sandbox.name}
          </span>

          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              background: "var(--sidebar-bg)",
              padding: "3px 10px",
              borderRadius: 12,
              fontWeight: 500,
            }}
          >
            {getLanguageLabel(sandbox.language)}
          </span>

          {!isSaved && (
            <span
              style={{
                fontSize: 11,
                color: "var(--warning)",
                fontWeight: 500,
              }}
            >
              ● Unsaved
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={sandbox.language}
            onChange={handleLanguageChange}
            className="language-select"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: isSaved ? "var(--text-muted)" : "var(--foreground)",
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            <Save size={14} />
            Save
          </button>

          <button
            onClick={() => setInspectMode(inspectMode === "simple" ? "detailed" : "simple")}
            title={inspectMode === "simple" ? "Simple mode: JSON.stringify (own enumerable only)" : "Detailed mode: All properties + prototype chain"}
            style={{
              background: inspectMode === "detailed" ? "rgba(0, 121, 242, 0.15)" : "transparent",
              border: inspectMode === "detailed" ? "1px solid var(--accent)" : "1px solid var(--border-color)",
              color: inspectMode === "detailed" ? "var(--accent)" : "var(--text-muted)",
              padding: "7px 14px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.2s",
            }}
          >
            {inspectMode === "simple" ? <Braces size={14} /> : <List size={14} />}
            {inspectMode === "simple" ? "Simple" : "Detailed"}
          </button>

          <button
            onClick={handleRun}
            className="btn-run"
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Square size={14} />
                <span className="running-indicator">Running...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Run
              </>
            )}
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${panelWidth}%`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {sandbox.language === "css" ? (
            <>
              <div
                style={{
                  display: "flex",
                  background: "var(--header-bg)",
                  borderBottom: "1px solid var(--border-color)",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setCssTab("css")}
                  className={cssTab === "css" ? "tab-active" : "tab-inactive"}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "#264de4", fontWeight: 700 }}>●</span>
                  style.css
                </button>
                <button
                  onClick={() => setCssTab("html")}
                  className={cssTab === "html" ? "tab-active" : "tab-inactive"}
                  style={{
                    padding: "8px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "#e34c26", fontWeight: 700 }}>●</span>
                  index.html
                </button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                {cssTab === "css" ? (
                  <CodeEditor
                    code={code}
                    language="css"
                    onChange={handleCodeChange}
                  />
                ) : (
                  <CodeEditor
                    code={htmlTemplate}
                    language="html"
                    onChange={handleHtmlTemplateChange}
                  />
                )}
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  padding: "6px 16px",
                  background: "var(--editor-bg)",
                  borderBottom: "1px solid var(--border-color)",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: getLanguageColor(sandbox.language), fontWeight: 600 }}>
                  ●
                </span>
                index.{sandbox.language === "javascript" ? "js" : sandbox.language === "typescript" ? "ts" : sandbox.language === "react" ? "jsx" : sandbox.language}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <CodeEditor
                  code={code}
                  language={sandbox.language}
                  onChange={handleCodeChange}
                />
              </div>
            </>
          )}
        </div>

        <div
          className="resizer"
          onMouseDown={handleMouseDown}
        />

        <div
          style={{
            width: `${100 - panelWidth}%`,
            overflow: "hidden",
          }}
        >
          {isPreviewLanguage && htmlOutput ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <HtmlPreview
                  html={htmlOutput}
                  onConsoleOutput={handleConsoleOutput}
                  skipConsoleInject={sandbox.language === "react"}
                />
              </div>
              <div style={{ height: "30%", minHeight: 80, borderTop: "1px solid var(--border-color)", overflow: "hidden" }}>
                <OutputPanel
                  outputs={outputs}
                  onClear={() => setOutputs([])}
                />
              </div>
            </div>
          ) : (
            <OutputPanel
              outputs={outputs}
              onClear={() => setOutputs([])}
            />
          )}
        </div>
      </div>

      <footer
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          height: 28,
          background: "var(--accent)",
          fontSize: 12,
          color: "white",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span>Sandbox</span>
          <span style={{ opacity: 0.7 }}>|</span>
          <span style={{ opacity: 0.8 }}>{getLanguageLabel(sandbox.language)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ opacity: 0.8 }}>Ctrl+S Save</span>
          <span style={{ opacity: 0.7 }}>|</span>
          <span style={{ opacity: 0.8 }}>Ctrl+Enter Run</span>
        </div>
      </footer>
    </div>
  );
}
