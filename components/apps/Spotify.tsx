"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const SPOTIFY_URL = "https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0";

type SpotifyWindowProps = {
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

export default function SpotifyWindow({ minimized, maximized, onClose, onMinimize, onToggleMaximize }: SpotifyWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const closingRef = useRef(false);
  const minimizingRef = useRef(false);
  const [zoomed, setZoomed] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(
      windowRef.current,
      { autoAlpha: 0, scale: 0.92, y: 20 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.38, ease: "power3.out" },
    );
  }, { scope: windowRef });

  // Handle window resize to ensure iframe fills container
  useEffect(() => {
    const handleResize = () => {
      if (windowRef.current) {
        windowRef.current.style.height = windowRef.current.style.height; // Force reflow
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeWindow = () => {
    const windowElement = windowRef.current;
    if (!windowElement || closingRef.current || minimizingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  const minimizeWindow = () => {
    const windowElement = windowRef.current;
    const dockIcon = document.querySelector<HTMLElement>('[data-app-id="spotify"]');
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
    if ((event.target as HTMLElement).closest("button")) return;
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

  const resizeRef = useRef<{ pointerId: number; x: number; y: number; width: number; height: number } | null>(null);

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

  const toggleZoom = () => {
    const nextZoomed = !zoomed;
    if (nextZoomed && windowRef.current) {
      gsap.to(windowRef.current, { x: 0, y: 0, duration: 0.22, ease: "power2.out" });
    }
    setZoomed(nextZoomed);
  };

  const style = maximized
    ? undefined
    : { width: "900px", height: "600px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <section
      ref={windowRef}
      className={`app-window spotify-window${zoomed ? " is-zoomed" : ""}${maximized ? " is-maximized" : ""}${minimized ? " is-minimized" : ""}`}
      style={style}
      aria-label="Spotify window"
    >
      <header
        className="app-window-titlebar spotify-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(event) => {
          if (!(event.target as HTMLElement).closest("button")) onToggleMaximize();
        }}
      >
        <div className="app-window-controls">
          <button className="red" onClick={closeWindow} aria-label="Close Spotify" title="Close" />
          <button className="yellow" onClick={minimizeWindow} aria-label="Minimize Spotify" title="Minimize" />
          <button className="green" onClick={onToggleMaximize} aria-label={maximized ? "Restore" : "Full screen"} title={maximized ? "Restore" : "Full screen"} />
        </div>
        <strong>Spotify</strong>
        <span className="app-window-spacer" />
      </header>
      <div className="spotify-content" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {!iframeLoaded && !iframeError && (
          <div className="spotify-loading" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "#1db954" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid #1db954", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Loading Spotify…</span>
            </div>
          </div>
        )}
        {iframeError && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", padding: "24px", background: "#1a1a2e", color: "#fff" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1db954" strokeWidth="1.5" style={{ opacity: 0.7 }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Unable to load Spotify</h3>
              <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#aaa" }}>The Spotify embed could not be loaded.</p>
            </div>
            <button
              onClick={() => { setIframeError(false); setIframeLoaded(false); }}
              style={{
                padding: "10px 20px",
                background: "#1db954",
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
        <iframe
          src={SPOTIFY_URL}
          className="spotify-iframe"
          title="Spotify"
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
            background: "#000",
            display: "block",
          }}
        />
      </div>
      {!maximized && <button className="app-window-resize" aria-label="Resize window" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} />}
    </section>
  );
}