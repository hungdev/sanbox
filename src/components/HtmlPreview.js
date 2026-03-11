"use client";

import { useRef, useEffect, useMemo } from "react";

export default function HtmlPreview({ html, onConsoleOutput }) {
  const iframeRef = useRef(null);
  const callbackRef = useRef(onConsoleOutput);

  useEffect(() => {
    callbackRef.current = onConsoleOutput;
  }, [onConsoleOutput]);

  const srcDoc = useMemo(() => {
    if (!html) return "";

    const consoleScript = `<script>
(function() {
  var orig = window.console;
  ['log','error','warn','info'].forEach(function(m) {
    window.console[m] = function() {
      var args = [];
      for (var i = 0; i < arguments.length; i++) {
        try {
          args.push(typeof arguments[i] === 'object' ? JSON.stringify(arguments[i], null, 2) : String(arguments[i]));
        } catch(e) { args.push(String(arguments[i])); }
      }
      window.parent.postMessage({ type: 'console', method: m === 'info' ? 'log' : m, content: args.join(' ') }, '*');
      if (orig && orig[m]) orig[m].apply(orig, arguments);
    };
  });
  window.onerror = function(msg, url, line) {
    window.parent.postMessage({ type: 'console', method: 'error', content: msg + (line ? ' (line ' + line + ')' : '') }, '*');
  };
})();
</script>`;

    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1>${consoleScript}`);
    }

    if (/<html[^>]*>/i.test(html)) {
      return html.replace(/<html([^>]*)>/i, `<html$1><head>${consoleScript}</head>`);
    }

    return `${consoleScript}${html}`;
  }, [html]);

  useEffect(() => {
    const handler = (event) => {
      if (event.data && event.data.type === "console" && callbackRef.current) {
        callbackRef.current({
          type: event.data.method,
          content: event.data.content,
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div style={{ height: "100%", background: "#fff" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--header-bg)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--success)",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Preview
          </span>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        style={{
          width: "100%",
          height: "calc(100% - 37px)",
          border: "none",
          background: "#fff",
        }}
        sandbox="allow-scripts allow-modals"
        title="HTML Preview"
      />
    </div>
  );
}
