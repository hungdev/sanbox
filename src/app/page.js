"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Code2,
  Trash2,
  Clock,
  ChevronRight,
  Terminal,
  Search,
} from "lucide-react";
import {
  getSandboxes,
  createSandbox,
  deleteSandbox,
  getLanguageColor,
  getLanguageLabel,
  getLanguageIcon,
  LANGUAGES,
} from "@/lib/sandboxStore";

export default function Home() {
  const router = useRouter();
  const [sandboxes, setSandboxes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLang, setNewLang] = useState("javascript");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSandboxes(getSandboxes());
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const sb = createSandbox(newName.trim(), newLang);
    router.push(`/sandbox/${sb.id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Delete this sandbox?")) {
      deleteSandbox(id);
      setSandboxes(getSandboxes());
    }
  };

  const handleQuickCreate = (language) => {
    const sb = createSandbox(
      `${getLanguageLabel(language)} Sandbox`,
      language
    );
    router.push(`/sandbox/${sb.id}`);
  };

  const filteredSandboxes = sandboxes.filter((sb) =>
    sb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!mounted) {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid var(--border-color)",
          background: "var(--header-bg)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, var(--accent), #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Terminal size={20} color="white" />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--foreground)",
                }}
              >
                Sandbox
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Code. Run. Experiment.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            New Sandbox
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 40,
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleQuickCreate(lang.value)}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                padding: "16px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                transition: "all 0.2s",
                color: "var(--foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  getLanguageColor(lang.value);
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 4px 20px ${getLanguageColor(lang.value)}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${getLanguageColor(lang.value)}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 800,
                  color: getLanguageColor(lang.value),
                  fontFamily: "var(--font-mono), monospace",
                }}
              >
                {getLanguageIcon(lang.value)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {lang.label}
              </span>
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--foreground)",
              margin: 0,
            }}
          >
            Your Sandboxes
            <span
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontWeight: 400,
                marginLeft: 8,
              }}
            >
              ({sandboxes.length})
            </span>
          </h2>

          {sandboxes.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                padding: "6px 12px",
              }}
            >
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search sandboxes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--foreground)",
                  fontSize: 13,
                  outline: "none",
                  width: 200,
                }}
              />
            </div>
          )}
        </div>

        {filteredSandboxes.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            <Code2
              size={48}
              style={{ marginBottom: 16, opacity: 0.3 }}
            />
            <p style={{ fontSize: 16, marginBottom: 4 }}>
              {searchQuery
                ? "No sandboxes found"
                : "No sandboxes yet"}
            </p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              {searchQuery
                ? "Try a different search term"
                : "Create your first sandbox to get started!"}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filteredSandboxes.map((sb) => (
              <div
                key={sb.id}
                className="sandbox-card fade-in"
                onClick={() => router.push(`/sandbox/${sb.id}`)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${getLanguageColor(sb.language)}22`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        color: getLanguageColor(sb.language),
                        fontFamily:
                          "var(--font-mono), monospace",
                      }}
                    >
                      {getLanguageIcon(sb.language)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--foreground)",
                        }}
                      >
                        {sb.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {getLanguageLabel(sb.language)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <button
                      onClick={(e) => handleDelete(e, sb.id)}
                      className="btn-danger"
                      style={{
                        padding: 6,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight
                      size={16}
                      color="var(--text-muted)"
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--sidebar-bg)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 11,
                    fontFamily: "var(--font-mono), monospace",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    overflow: "hidden",
                    maxHeight: 72,
                    whiteSpace: "pre",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sb.code?.substring(0, 150) || "Empty"}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 12,
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  <Clock size={12} />
                  {formatDate(sb.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-color)",
              borderRadius: 16,
              padding: 32,
              width: 440,
              maxWidth: "90vw",
            }}
            onClick={(e) => e.stopPropagation()}
            className="fade-in"
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 4,
                color: "var(--foreground)",
              }}
            >
              Create New Sandbox
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 24,
              }}
            >
              Choose a name and language for your new sandbox
            </p>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 6,
                }}
              >
                Sandbox Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="My Awesome Project"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "var(--sidebar-bg)",
                  color: "var(--foreground)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginBottom: 6,
                }}
              >
                Language
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setNewLang(lang.value)}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border:
                        newLang === lang.value
                          ? `2px solid ${getLanguageColor(lang.value)}`
                          : "1px solid var(--border-color)",
                      background:
                        newLang === lang.value
                          ? `${getLanguageColor(lang.value)}15`
                          : "var(--sidebar-bg)",
                      color:
                        newLang === lang.value
                          ? getLanguageColor(lang.value)
                          : "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono), monospace",
                        fontWeight: 800,
                        fontSize: 11,
                      }}
                    >
                      {getLanguageIcon(lang.value)}
                    </span>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="btn-primary"
                disabled={!newName.trim()}
                style={{
                  opacity: newName.trim() ? 1 : 0.5,
                }}
              >
                <Plus size={16} />
                Create Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
