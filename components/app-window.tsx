"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export type WindowApp = { id: string; name: string; icon: string };
type AppWindowProps = {
  app: WindowApp;
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

type Geometry = { left: number | null; top: number | null; width: number; height: number };

export default function AppWindow({ app, minimized, maximized, onClose, onMinimize, onToggleMaximize }: AppWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const resizeRef = useRef<{ pointerId: number; x: number; y: number; width: number; height: number } | null>(null);
  const wasMinimizedRef = useRef(false);
  const [geometry, setGeometry] = useState<Geometry>({ left: null, top: null, width: 720, height: 480 });

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(windowRef.current, { autoAlpha: 0, scale: 0.88, y: 14 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.32, ease: "power3.out" });
  }, { scope: windowRef });

  useEffect(() => {
    const element = windowRef.current;
    if (wasMinimizedRef.current && !minimized && element) {
      gsap.set(element, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, clearProps: "clipPath,visibility,opacity" });
      gsap.fromTo(element, { autoAlpha: 0, scale: 0.9, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" });
    }
    wasMinimizedRef.current = minimized;
  }, [minimized]);

  const animateToDock = (complete: () => void) => {
    const element = windowRef.current;
    const icon = document.querySelector<HTMLElement>(`[data-app-id="${app.id}"]`);
    if (!element || !icon) { complete(); return; }
    const bounds = element.getBoundingClientRect();
    const iconBounds = icon.getBoundingClientRect();
    const currentX = Number(gsap.getProperty(element, "x"));
    const currentY = Number(gsap.getProperty(element, "y"));
    const dx = iconBounds.left + iconBounds.width / 2 - bounds.left - bounds.width / 2;
    const dy = iconBounds.top + iconBounds.height / 2 - bounds.top - bounds.height / 2;
    gsap.timeline({ onComplete: complete })
      .to(element, { clipPath: "polygon(0 0,100% 0,100% 72%,55% 72%,50% 100%,45% 72%,0 72%)", duration: 0.18, ease: "power2.in" })
      .to(element, { x: currentX + dx, y: currentY + dy, scaleX: 0.06, scaleY: 0.035, autoAlpha: 0, duration: 0.35, ease: "power3.in" });
  };

  const close = () => onClose();
  const minimize = () => animateToDock(onMinimize);

  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if (maximized || (event.target as HTMLElement).closest("button")) return;
    const element = windowRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top };
  };
  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setGeometry((current) => ({ ...current, left: drag.left + event.clientX - drag.x, top: drag.top + event.clientY - drag.y }));
  };
  const endDrag = (event: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const startResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (maximized) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, width: geometry.width, height: geometry.height };
  };
  const moveResize = (event: PointerEvent<HTMLButtonElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    setGeometry((current) => ({ ...current, width: Math.max(360, resize.width + event.clientX - resize.x), height: Math.max(260, resize.height + event.clientY - resize.y) }));
  };
  const endResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const style = maximized
    ? undefined
    : { width: `min(${geometry.width}px, calc(100vw - 2rem))`, height: `min(${geometry.height}px, calc(100dvh - 7rem))`, left: geometry.left === null ? "50%" : `${geometry.left}px`, top: geometry.top === null ? "50%" : `${geometry.top}px`, transform: geometry.left === null ? "translate(-50%, -50%)" : "none" };

  return (
    <section ref={windowRef} className={`app-window${maximized ? " is-maximized" : ""}${minimized ? " is-minimized" : ""}`} style={style} aria-label={`${app.name} window`}>
      <header className="app-window-titlebar" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onToggleMaximize(); }}>
        <div className="app-window-controls">
          <button className="red" onClick={close} aria-label="Close" title="Close"><X size={8} /></button>
          <button className="yellow" onClick={minimize} aria-label="Minimize" title="Minimize"><Minimize2 size={8} /></button>
          <button className="green" onClick={onToggleMaximize} aria-label={maximized ? "Restore" : "Full screen"} title={maximized ? "Restore" : "Full screen"}><Maximize2 size={8} /></button>
        </div>
        <strong>{app.name}</strong>
        <span className="app-window-spacer" />
      </header>
      <div className="app-window-body">
        <img src={app.icon} alt="" />
        <h1>{app.name}</h1>
        <p>This window is part of Adwaith&apos;s interactive portfolio desktop.</p>
        {app.id === "resume" && <a href="/files/resume.pdf" target="_blank" rel="noreferrer">Open resume PDF</a>}
      </div>
      {!maximized && <button className="app-window-resize" aria-label="Resize window" onPointerDown={startResize} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} />}
    </section>
  );
}
