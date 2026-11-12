"use client";

import { useRef, useState, useEffect, type PointerEvent, type KeyboardEvent, type ChangeEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

const STORAGE_KEY = "macos-portfolio-notes";

const loadNotes = (): Note[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveNotes = (notes: Note[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const initialNotes: Note[] = [
  {
    id: "welcome",
    title: "Welcome to Notes",
    body: "A quiet place for ideas, plans, and everything you want to remember.\n\nStart typing here…",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    pinned: true,
  },
  {
    id: "ideas",
    title: "Project Ideas",
    body: "- Build a macOS-style portfolio\n- Add interactive terminal\n- Create Finder with file navigation\n- Spotify integration\n- Notes app with iCloud sync feel",
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    pinned: false,
  },
  {
    id: "meeting",
    title: "Meeting Notes",
    body: "Next.js 14 features:\n- Server Components\n- Server Actions\n- App Router\n- Turbopack\n\nReact 19:\n- use() hook\n- Server Components improvements\n- useOptimistic\n- useActionState",
    createdAt: Date.now() - 21600000,
    updatedAt: Date.now() - 21600000,
    pinned: false,
  },
];

type NotesWindowProps = {
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

export default function NotesWindow({ minimized, maximized, onClose, onMinimize, onToggleMaximize }: NotesWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ pointerId: number; x: number; y: number; width: number; height: number } | null>(null);
  const closingRef = useRef(false);
  const minimizingRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const [zoomed, setZoomed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [draggingSidebar, setDraggingSidebar] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showNewNoteInput, setShowNewNoteInput] = useState(false);

  // Initialize notes from localStorage
  useEffect(() => {
    const loaded = loadNotes();
    if (loaded.length === 0) {
      saveNotes(initialNotes);
      setNotes(initialNotes);
      setSelectedId(initialNotes[0].id);
    } else {
      setNotes(loaded);
      setSelectedId(loaded[0]?.id || null);
    }
  }, []);

  // Save notes to localStorage when they change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(
      windowRef.current,
      { autoAlpha: 0, scale: 0.92, y: 20 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" },
    );
  }, { scope: windowRef });

  const closeWindow = () => {
    const windowElement = windowRef.current;
    if (!windowElement || closingRef.current || minimizingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  const minimizeWindow = () => {
    const windowElement = windowRef.current;
    const dockIcon = document.querySelector<HTMLElement>('[data-app-id="notes"]');
    if (!windowElement || minimizingRef.current || closingRef.current) return;
    minimizingRef.current = true;

    if (!dockIcon) {
      onMinimize();
      return;
    }

    const windowBounds = windowElement.getBoundingClientRect();
    const iconBounds = dockIcon.getBoundingClientRect();
    gsap.to(windowElement, {
      autoAlpha: 0,
      scale: 0.12,
      x: iconBounds.left + iconBounds.width / 2 - (windowBounds.left + windowBounds.width / 2),
      y: iconBounds.top + iconBounds.height / 2 - (windowBounds.top + windowBounds.height / 2),
      duration: 0.32,
      ease: "power2.in",
      onComplete: onMinimize,
    });
  };

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, input, textarea, .sidebar-resize")) return;
    const windowElement = windowRef.current;
    if (!windowElement) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: Number(gsap.getProperty(windowElement, "x")),
      originY: Number(gsap.getProperty(windowElement, "y")),
    };
    windowElement.classList.add("is-dragging");
  };

  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const windowElement = windowRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !windowElement) return;
    gsap.set(windowElement, {
      x: drag.originX + event.clientX - drag.x,
      y: drag.originY + event.clientY - drag.y,
    });
  };

  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    windowRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (maximized) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const windowElement = windowRef.current;
    if (!windowElement) return;
    const rect = windowElement.getBoundingClientRect();
    resizeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width, height: rect.height };
  };

  const moveResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    const newWidth = Math.max(600, resize.width + event.clientX - resize.x);
    const newHeight = Math.max(400, resize.height + event.clientY - resize.y);
    if (windowRef.current) {
      gsap.set(windowRef.current, { width: newWidth, height: newHeight });
    }
  };

  const endResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const startSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingSidebar(true);
  };

  const moveSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingSidebar) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const rect = sidebar.getBoundingClientRect();
    const newWidth = Math.max(160, Math.min(400, rect.width + event.clientX - rect.right));
    setSidebarWidth(newWidth);
  };

  const endSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingSidebar) return;
    setDraggingSidebar(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const toggleZoom = () => {
    const nextZoomed = !zoomed;
    if (nextZoomed && windowRef.current) {
      gsap.to(windowRef.current, { x: 0, y: 0, duration: 0.22, ease: "power2.out" });
    }
    setZoomed(nextZoomed);
  };

  const filteredNotes = notes
    .filter((note) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.body.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      // Pinned first
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      // Then by updated date
      return b.updatedAt - a.updatedAt;
    });

  const selectedNote = notes.find((n) => n.id === selectedId);

  const createNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: "",
      body: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(newNote.id);
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedId(remaining[0]?.id || null);
    }
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned, updatedAt: Date.now() } : n))
    );
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, title, updatedAt: Date.now() } : n
      )
    );
  };

  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const body = event.target.value;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedId ? { ...n, body, updatedAt: Date.now() } : n
      )
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today · ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } else if (days === 1) {
      return `Yesterday · ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "long" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }
  };

  const style = maximized
    ? undefined
    : { width: "850px", height: "550px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <section
      ref={windowRef}
      className={`app-window notes-window${zoomed ? " is-zoomed" : ""}${maximized ? " is-maximized" : ""}${minimized ? " is-minimized" : ""}`}
      style={style}
      aria-label="Notes app window"
    >
      <header
        className="app-window-titlebar notes-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button, input")) onToggleMaximize();
        }}
      >
        <div className="app-window-controls">
          <button className="red" onClick={closeWindow} aria-label="Close Notes" title="Close" />
          <button className="yellow" onClick={minimizeWindow} aria-label="Minimize Notes" title="Minimize" />
          <button className="green" onClick={onToggleMaximize} aria-label={maximized ? "Restore" : "Full screen"} title={maximized ? "Restore" : "Full screen"} />
        </div>
        <strong>Notes</strong>
        <span className="app-window-spacer" />
      </header>

      <div className="notes-content">
        {/* Sidebar */}
        <aside ref={sidebarRef} className="notes-sidebar" style={{ width: sidebarWidth }}>
          {/* iCloud section */}
          <div className="notes-sidebar-section">
            <span className="notes-sidebar-header">ICLOUD</span>
            <button
              className={`notes-folder${selectedId === "all" ? " active" : ""}`}
              onClick={() => setSelectedId("all")}
            >
              <span className="notes-folder-icon">▣</span> All Notes
              <span className="notes-count">{filteredNotes.length}</span>
            </button>
            <button className="notes-folder">
              <span className="notes-folder-icon">⏱</span> Recently Deleted
            </button>
          </div>

          {/* On My Mac section */}
          <div className="notes-sidebar-section">
            <span className="notes-sidebar-header">ON MY MAC</span>
            <button
              className={`notes-folder${selectedId === "local" ? " active" : ""}`}
              onClick={() => setSelectedId("local")}
            >
              <span className="notes-folder-icon">▤</span> Notes
              <span className="notes-count">{notes.filter(n => !n.pinned && n.id !== "welcome").length}</span>
            </button>
          </div>

          {/* Search */}
          <div className="notes-search" style={{ padding: "8px 12px" }}>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="notes-search-input"
              aria-label="Search notes"
            />
          </div>

          {/* Notes list */}
          <div className="notes-list" style={{ flex: 1, overflow: "auto", padding: "0 8px 8px" }}>
            {viewMode === "list" ? (
              <>
                {/* Pinned notes */}
                {filteredNotes.filter((n) => n.pinned).length > 0 && (
                  <div className="notes-group">
                    <span className="notes-group-header">Pinned</span>
                    {filteredNotes
                      .filter((n) => n.pinned)
                      .map((note) => (
                        <button
                          key={note.id}
                          className={`notes-list-item${selectedId === note.id ? " selected" : ""}`}
                          onClick={() => setSelectedId(note.id)}
                        >
                          <div className="notes-item-title">{note.title || "Untitled Note"}</div>
                          <div className="notes-item-preview">{note.body.split("\n")[0].slice(0, 60)}</div>
                          <div className="notes-item-date">{formatDate(note.updatedAt)}</div>
                        </button>
                      ))}
                  </div>
                )}

                {/* Regular notes */}
                {filteredNotes.filter((n) => !n.pinned).length > 0 && (
                  <div className="notes-group">
                    <span className="notes-group-header">Notes</span>
                    {filteredNotes
                      .filter((n) => !n.pinned)
                      .map((note) => (
                        <button
                          key={note.id}
                          className={`notes-list-item${selectedId === note.id ? " selected" : ""}`}
                          onClick={() => setSelectedId(note.id)}
                        >
                          <div className="notes-item-title">{note.title || "Untitled Note"}</div>
                          <div className="notes-item-preview">{note.body.split("\n")[0].slice(0, 60)}</div>
                          <div className="notes-item-date">{formatDate(note.updatedAt)}</div>
                        </button>
                      ))}
                  </div>
                )}

                {filteredNotes.length === 0 && (
                  <div className="notes-empty" style={{ padding: "20px", textAlign: "center", color: "rgba(0,0,0,0.4)", fontSize: "13px" }}>
                    No notes found
                  </div>
                )}
              </>
            ) : (
              // Grid view
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    className={`notes-grid-item${selectedId === note.id ? " selected" : ""}`}
                    onClick={() => setSelectedId(note.id)}
                    style={{
                      padding: "12px",
                      border: "none",
                      background: selectedId === note.id ? "rgba(0,122,255,0.1)" : "rgba(0,0,0,0.03)",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.1s ease",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "12px", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {note.title || "Untitled Note"}
                      {note.pinned && <span style={{ marginLeft: "4px", fontSize: "10px" }}>📌</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {note.body.slice(0, 100)}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(0,0,0,0.3)", marginTop: "6px" }}>
                      {formatDate(note.updatedAt)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="notes-toolbar" style={{ display: "flex", gap: "4px", padding: "8px", borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
            <button
              onClick={createNote}
              className="notes-toolbar-btn"
              title="New Note"
              aria-label="New Note"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`notes-toolbar-btn${viewMode === "list" ? " active" : ""}`}
              title="List View"
              aria-label="List View"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`notes-toolbar-btn${viewMode === "grid" ? " active" : ""}`}
              title="Grid View"
              aria-label="Grid View"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
          </div>
        </aside>

        {/* Sidebar resize handle */}
        <div
          className="sidebar-resize"
          onPointerDown={startSidebarResize}
          onPointerMove={moveSidebarResize}
          onPointerUp={endSidebarResize}
          onPointerCancel={endSidebarResize}
          style={{
            width: "4px",
            cursor: "col-resize",
            background: "transparent",
            position: "relative",
          }}
          aria-label="Resize sidebar"
        >
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(0,0,0,0.05)" }} />
        </div>

        {/* Editor */}
        <article className="notes-editor" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedNote ? (
            <>
              <div className="notes-editor-header" style={{ padding: "16px 20px 8px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={() => togglePin(selectedNote.id)}
                    className={`notes-pin-btn${selectedNote.pinned ? " pinned" : ""}`}
                    title={selectedNote.pinned ? "Unpin" : "Pin"}
                    aria-label={selectedNote.pinned ? "Unpin note" : "Pin note"}
                    style={{
                      padding: "4px",
                      border: "none",
                      background: selectedNote.pinned ? "rgba(0,122,255,0.1)" : "transparent",
                      borderRadius: "4px",
                      cursor: "pointer",
                      color: selectedNote.pinned ? "#007AFF" : "rgba(0,0,0,0.4)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                      <path d="M12 17v5M9 12l3-3 3 3M15 22H9a2 2 0 01-2-2V5a2 2 0 012-2h2.5M17 22h2.5a2 2 0 002-2V5a2 2 0 00-2-2H17" />
                    </svg>
                  </button>
                  <input
                    ref={(el) => { if (el && selectedId === selectedNote.id) el.focus(); }}
                    className="notes-heading"
                    aria-label="Note title"
                    value={selectedNote.title}
                    onChange={handleTitleChange}
                    placeholder="Title"
                    style={{
                      flex: 1,
                      fontSize: "20px",
                      fontWeight: 600,
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      color: "#1c1c1e",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>
                    {formatDate(selectedNote.updatedAt)}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, padding: "16px 20px 20px", overflow: "auto" }}>
                <textarea
                  ref={editorRef}
                  className="notes-textarea"
                  aria-label="Note content"
                  value={selectedNote.body}
                  onChange={handleBodyChange}
                  placeholder="Start typing…"
                  spellCheck={true}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "200px",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    resize: "none",
                    color: "#1c1c1e",
                  }}
                />
              </div>
            </>
          ) : (
            <div className="notes-empty-state" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(0,0,0,0.4)" }}>
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" fill="none" strokeWidth="1.5" style={{ marginBottom: "16px", opacity: 0.5 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>No Note Selected</h2>
              <p style={{ fontSize: "14px" }}>Select a note from the sidebar or create a new one</p>
              <button
                onClick={createNote}
                className="os-glass-button"
                style={{ marginTop: "16px" }}
              >
                New Note
              </button>
            </div>
          )}
        </article>
      </div>

      {!maximized && <button className="app-window-resize" aria-label="Resize window" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} />}
    </section>
  );
}