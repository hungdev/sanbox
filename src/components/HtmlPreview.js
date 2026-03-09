"use client";

import { useRef, useEffect } from "react";

export default function HtmlPreview({ html }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

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
