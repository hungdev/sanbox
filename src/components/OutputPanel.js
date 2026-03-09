"use client";

import { Trash2 } from "lucide-react";

export default function OutputPanel({ outputs, onClear }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0d1117",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
              background: outputs.some((o) => o.type === "error")
                ? "var(--danger)"
                : "var(--success)",
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
            Console
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              background: "var(--sidebar-bg)",
              padding: "2px 8px",
              borderRadius: 10,
            }}
          >
            {outputs.length}
          </span>
        </div>
        <button
          onClick={onClear}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
            borderRadius: 4,
          }}
          title="Clear console"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "12px 16px",
        }}
        className="console-output"
      >
        {outputs.length === 0 ? (
          <div
            style={{
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.6,
            }}
          >
            Run your code to see output here...
          </div>
        ) : (
          outputs.map((output, i) => (
            <div
              key={i}
              className={`console-${output.type}`}
              style={{
                padding: "4px 0",
                borderBottom:
                  i < outputs.length - 1
                    ? "1px solid rgba(48, 54, 61, 0.5)"
                    : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.4,
                  minWidth: 20,
                  textAlign: "right",
                  paddingTop: 2,
                  userSelect: "none",
                }}
              >
                {i + 1}
              </span>
              <span style={{ flex: 1 }}>{output.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
