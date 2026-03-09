"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  ArrowLeft,
  Save,
  Square,
} from "lucide-react";
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
  const containerRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    const sb = getSandbox(id);
    if (sb) {
      setSandbox(sb);
      setCode(sb.code);
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

  const handleSave = useCallback(() => {
    if (sandbox) {
      updateSandbox(sandbox.id, { code });
      setIsSaved(true);
    }
  }, [sandbox, code]);

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
      const htmlWithCss = `<!DOCTYPE html><html><head><style>${code}</style></head><body><div class="box"></div></body></html>`;
      setHtmlOutput(htmlWithCss);
      setOutputs([{ type: "log", content: "✓ CSS rendered successfully" }]);
      setIsRunning(false);
      return;
    }

    const collectedOutputs = [];

    try {
      let execCode = code;

      if (sandbox.language === "typescript") {
        execCode = code
          .replace(
            /(?:export\s+)?(?:interface|type)\s+\w+[\s\S]*?(?=\n(?:const|let|var|function|class|export|import|\/\/|\n)|$)/gm,
            ""
          )
          .replace(/:\s*\w+(?:<[^>]*>)?(?:\[\])?/g, "")
          .replace(/as\s+\w+/g, "")
          .replace(/<\w+(?:,\s*\w+)*>/g, "");
      }

      if (sandbox.language === "python") {
        const lines = code.split("\n");
        const output = [];
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("print(")) {
            const match = trimmed.match(/print\((.*)\)/);
            if (match) {
              try {
                let content = match[1];
                content = content.replace(/f"([^"]*)"/, (_, template) => {
                  return `"${template.replace(/\{([^}]+)\}/g, "\\${$1}")}"`;
                });
                const result = new Function(
                  `try { return ${content}; } catch(e) { return ${content}; }`
                )();
                output.push(String(result));
              } catch {
                output.push(match[1]);
              }
            }
          }
        }
        if (output.length > 0) {
          output.forEach((line) => {
            collectedOutputs.push({ type: "log", content: line });
          });
        } else {
          collectedOutputs.push({
            type: "warn",
            content:
              "⚠ Python simulation: Only print() statements are evaluated. For full Python support, a backend server is needed.",
          });
        }
        setOutputs(collectedOutputs);
        setIsRunning(false);
        return;
      }

      const originalConsole = { ...console };
      const fakeConsole = {
        log: (...args) => {
          collectedOutputs.push({
            type: "log",
            content: args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
              )
              .join(" "),
          });
        },
        error: (...args) => {
          collectedOutputs.push({
            type: "error",
            content: args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
              )
              .join(" "),
          });
        },
        warn: (...args) => {
          collectedOutputs.push({
            type: "warn",
            content: args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
              )
              .join(" "),
          });
        },
        info: (...args) => {
          collectedOutputs.push({
            type: "log",
            content: args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)
              )
              .join(" "),
          });
        },
        table: (data) => {
          collectedOutputs.push({
            type: "log",
            content: JSON.stringify(data, null, 2),
          });
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
    setTimeout(() => setIsRunning(false), 300);
  }, [sandbox, code, handleSave]);

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
        const updatedSandbox = updateSandbox(sandbox.id, {
          language: newLang,
          code: DEFAULT_CODE[newLang] || "",
        });
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
    sandbox.language === "html" || sandbox.language === "css";

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
            index.{sandbox.language === "javascript" ? "js" : sandbox.language === "typescript" ? "ts" : sandbox.language === "python" ? "py" : sandbox.language}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <CodeEditor
              code={code}
              language={sandbox.language}
              onChange={handleCodeChange}
            />
          </div>
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
            <HtmlPreview html={htmlOutput} />
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
