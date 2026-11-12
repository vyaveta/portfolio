"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface SafariWindowProps {
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}

interface SafariState {
  goURL: string;
  currentURL: string;
}

const FAVORITES = [
  { id: "my-github", title: "GitHub", icon: "🐙", link: "https://github.com" },
  { id: "my-linkedin", title: "LinkedIn", icon: "💼", link: "https://linkedin.com" },
  { id: "my-twitter", title: "Twitter/X", icon: "🐦", link: "https://x.com" },
  { id: "leetcode", title: "LeetCode", icon: "💻", link: "https://leetcode.com" },
  { id: "email", title: "Email", icon: "📧", link: "mailto:contact@example.com" },
];

const FREQUENT = [
  { id: "hacker-news", title: "Hacker News", icon: "📰", link: "https://news.ycombinator.com/" },
  { id: "github", title: "GitHub", icon: "🐙", link: "https://github.com/" },
  { id: "twitter", title: "Twitter/X", icon: "🐦", link: "https://x.com/" },
  { id: "mdn", title: "MDN Web Docs", icon: "📚", link: "https://developer.mozilla.org/" },
  { id: "vercel", title: "Vercel", icon: "▲", link: "https://vercel.com/" },
  { id: "npm", title: "npm", icon: "📦", link: "https://www.npmjs.com/" },
];

const PRIVACY_TRACKERS = Math.floor(Math.random() * 99 + 1);

function NavSection({ section, sites, width, setGoURL }: { section: string; sites: typeof FAVORITES; width: number; setGoURL: (url: string) => void }) {
  return (
    <div style={{ margin: "0 auto", width: "100%", maxWidth: "800px", padding: "32px 16px 0" }}>
      <div style={{ fontWeight: 600, marginLeft: "8px", fontSize: width < 640 ? "20px" : "24px", color: "#1c1c1e" }}>
        {section}
      </div>
      <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: width < 640 ? "repeat(4, 1fr)" : "repeat(8, 1fr)", gap: "16px" }}>
        {sites.map((site) => (
          <div key={`safari-nav-${site.id}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "14px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.8)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(0,0,0,0.05)",
                fontSize: "28px",
              }}
              onClick={() => setGoURL(site.link)}
            >
              {site.icon}
            </div>
            <span style={{ marginTop: "8px", fontSize: "12px", color: "rgba(0,0,0,0.6)", textAlign: "center" }}>
              {site.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavPage({ width, setGoURL }: { width: number; setGoURL: (url: string) => void }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        background: "linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 100%)",
      }}
    >
      <div style={{ width: "100%", minHeight: "100%", paddingTop: "32px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)" }}>
        <NavSection section="Favorites" sites={FAVORITES} width={width} setGoURL={setGoURL} />
        <NavSection section="Frequently Visited" sites={FREQUENT} width={width} setGoURL={setGoURL} />

        {/* Privacy Report */}
        <div style={{ margin: "0 auto", width: "100%", maxWidth: "800px", padding: "48px 16px 64px" }}>
          <div style={{ fontWeight: 600, fontSize: width < 640 ? "20px" : "24px", color: "#1c1c1e", marginBottom: "16px" }}>
            Privacy Report
          </div>
          <div
            style={{
              height: "64px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              borderRadius: "16px",
              padding: "0 20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRight: "1px solid rgba(0,0,0,0.1)", paddingRight: "20px" }}>
              <span style={{ fontSize: "24px", color: "#34C759" }}>🛡️</span>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#1c1c1e" }}>{PRIVACY_TRACKERS}</span>
            </div>
            <div style={{ paddingLeft: "20px", fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>
              In the last seven days, Safari has prevented {PRIVACY_TRACKERS} trackers from profiling you.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoInternetPage() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#1c1c1e" }}>You Are Not Connected to the Internet</div>
        <div style={{ paddingTop: "16px", fontSize: "14px", color: "rgba(0,0,0,0.6)" }}>
          This page can't be displayed because your computer is currently offline.
        </div>
      </div>
    </div>
  );
}

export default function SafariWindow({ minimized, maximized, onClose, onMinimize, onToggleMaximize }: SafariWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const closingRef = useRef(false);
  const minimizingRef = useRef(false);
  const [state, setState] = useState<SafariState>({ goURL: "", currentURL: "" });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [wifi, setWifi] = useState(true);

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(
      windowRef.current,
      { autoAlpha: 0, scale: 0.92, y: 20 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" },
    );
  }, { scope: windowRef });

  useEffect(() => {
    const checkOnline = () => setWifi(navigator.onLine);
    checkOnline();
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);
    return () => {
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, []);

  const checkURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const setGoURL = (url: string) => {
    let isValid = checkURL(url);

    if (isValid) {
      if (url.substring(0, 7) !== "http://" && url.substring(0, 8) !== "https://")
        url = `https://${url}`;
    } else if (url !== "") {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }

    setState({ goURL: url, currentURL: url });
  };

  const pressURL = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") setGoURL((e.target as HTMLInputElement).value);
  };

  const closeWindow = () => {
    const windowElement = windowRef.current;
    if (!windowElement || closingRef.current || minimizingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  const minimizeWindow = () => {
    const windowElement = windowRef.current;
    const dockIcon = document.querySelector<HTMLElement>('[data-app-id="safari"]');
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

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, input")) return;
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

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const windowElement = windowRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !windowElement) return;
    gsap.set(windowElement, {
      x: drag.originX + event.clientX - drag.x,
      y: drag.originY + event.clientY - drag.y,
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    windowRef.current?.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const style = maximized
    ? undefined
    : { width: "900px", height: "600px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  const tabTitle = state.goURL
    ? (() => { try { return new URL(state.goURL).hostname.replace(/^www\./, ""); } catch { return state.goURL; } })()
    : "New Tab";

  return (
    <section
      ref={windowRef}
      className={`app-window safari-window${maximized ? " is-maximized" : ""}${minimized ? " is-minimized" : ""}`}
      style={style}
      aria-label="Safari window"
    >
      <header
        className="app-window-titlebar safari-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button, input")) onToggleMaximize();
        }}
      >
        <div className="app-window-controls">
          <button className="red" onClick={closeWindow} aria-label="Close Safari" title="Close" />
          <button className="yellow" onClick={minimizeWindow} aria-label="Minimize Safari" title="Minimize" />
          <button className="green" onClick={onToggleMaximize} aria-label={maximized ? "Restore" : "Full screen"} title={maximized ? "Restore" : "Full screen"} />
        </div>
        <div style={{ flex: 1, display: "flex", justifyContent: "center", marginLeft: "-40px" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%", maxWidth: "500px", gap: "8px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => setGoURL("")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: state.goURL === "" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.6)",
                  cursor: state.goURL === "" ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                }}
                disabled={state.goURL === ""}
              >
                ◀
              </button>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(0,0,0,0.3)",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                }}
              >
                ▶
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "500px",
                  background: "rgba(0,0,0,0.06)",
                  border: "0.5px solid rgba(0,0,0,0.04)",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  gap: "8px",
                }}
              >
                <span style={{ color: "rgba(0,0,0,0.4)" }}>🛡️</span>
                <input
                  type="text"
                  value={state.currentURL}
                  onChange={(e) => setState({ ...state, currentURL: e.target.value })}
                  onKeyPress={pressURL}
                  placeholder="Search or enter website name"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: "13px",
                    textAlign: "center",
                    color: "rgba(0,0,0,0.8)",
                  }}
                />
                <span style={{ color: "rgba(0,0,0,0.4)" }}>⟳</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(0,0,0,0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                }}
              >
                📤
              </button>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(0,0,0,0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                }}
              >
                🔖
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="safari-content" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "#fff" }}>
        {!iframeLoaded && !iframeError && state.goURL && (
          <div className="safari-loading" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f7" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#007aff" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #007aff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Loading…</span>
            </div>
          </div>
        )}
        {iframeError && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", padding: "24px", background: "#f5f5f7", color: "#1c1c1e" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="1.5" style={{ opacity: 0.7 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Unable to load page</h3>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#86868b" }}>The website could not be loaded.</p>
            </div>
            <button
              onClick={() => { setIframeError(false); setIframeLoaded(false); }}
              style={{
                padding: "10px 20px",
                background: "#007aff",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}
        {wifi ? (
          state.goURL === "" ? (
            <NavPage width={900} setGoURL={setGoURL} />
          ) : (
            <iframe
              title={`Safari - ${tabTitle}`}
              src={state.goURL}
              className="safari-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => { setIframeLoaded(true); setIframeError(false); }}
              onError={() => { setIframeError(true); setIframeLoaded(false); }}
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                minHeight: 0,
                border: "none",
                background: "#fff",
                display: "block",
              }}
            />
          )
        ) : (
          <NoInternetPage />
        )}
      </div>
    </section>
  );
}