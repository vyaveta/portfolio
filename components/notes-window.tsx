"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type NotesWindowProps = {
  onClose: () => void;
  onMinimize: () => void;
  title: string;
  body: string;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
};

export default function NotesWindow({ onClose, onMinimize, title, body, onTitleChange, onBodyChange }: NotesWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const closingRef = useRef(false);
  const minimizingRef = useRef(false);
  const [zoomed, setZoomed] = useState(false);

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

  const toggleZoom = () => {
    const nextZoomed = !zoomed;
    if (nextZoomed && windowRef.current) {
      gsap.to(windowRef.current, { x: 0, y: 0, duration: 0.22, ease: "power2.out" });
    }
    setZoomed(nextZoomed);
  };

  return (
    <section ref={windowRef} className={`notes-window${zoomed ? " is-zoomed" : ""}`} aria-label="Notes app window">
      <header
        className="notes-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="notes-window-controls" aria-label="Window controls">
          <button className="notes-close" onClick={closeWindow} aria-label="Close Notes" title="Close" />
          <button className="notes-minimize" onClick={minimizeWindow} aria-label="Minimize Notes" title="Minimize" />
          <button className="notes-zoom" onClick={toggleZoom} aria-label={zoomed ? "Restore Notes" : "Enter full screen"} title={zoomed ? "Restore" : "Full Screen"} />
        </div>
        <span>Notes</span>
        <button
          className="notes-new"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => { onTitleChange("New Note"); onBodyChange(""); }}
          aria-label="Create a new note"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </header>
      <div className="notes-content">
        <aside className="notes-sidebar">
          <p className="notes-account">ON MY MAC</p>
          <button className="notes-folder active"><span aria-hidden="true">▤</span> All Notes <span className="notes-count">1</span></button>
          <button className="notes-folder"><span aria-hidden="true">▣</span> Recently Deleted</button>
        </aside>
        <article className="notes-editor">
          <p className="notes-date">Today&nbsp; · &nbsp;Just now</p>
          <input
            className="notes-heading"
            aria-label="Note title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Title"
          />
          <textarea
            className="notes-textarea"
            aria-label="Note content"
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="Start typing…"
          />
        </article>
      </div>
    </section>
  );
}
