"use client";

import { useRef } from "react";
import { useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { dockApps } from "@/constants";
import NotesWindow from "@/components/notes-window";

type DockProps = { onLaunch?: (id: string) => void };

gsap.registerPlugin(useGSAP);

const dockAssetPaths: Record<string, string> = {
  finder: "/images/finder.png",
  safari: "/img/icons/safari.png",
  photos: "/img/icons/photos.png",
  contact: "/images/contact.png",
  terminal: "/img/icons/terminal.png",
  notes: "/img/icons/notes.png",
  spotify: "/img/icons/spotify.png",
  trash: "/images/trash.png",
};

export default function Dock({ onLaunch }: DockProps) {
  const dockRef = useRef<HTMLElement>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("Welcome to Notes");
  const [noteBody, setNoteBody] = useState("A quiet place for ideas, plans, and everything you want to remember.\n\nStart typing here…");

  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = Array.from(dock.querySelectorAll<HTMLElement>(".dock-icon"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reducedMotion) {
      gsap.fromTo(
        dock,
        { autoAlpha: 0, y: 32 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "back.out(1.5)", delay: 0.15 },
      );
      gsap.fromTo(
        icons,
        { y: 20, scale: 0.75, autoAlpha: 0 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          duration: 0.45,
          stagger: 0.055,
          ease: "back.out(1.8)",
          delay: 0.3,
          onComplete: () => gsap.set(icons, { clearProps: "opacity,visibility" }),
        },
      );
    } else {
      // Ensure icons are visible when reduced motion is enabled
      gsap.set(icons, { autoAlpha: 1, scale: 1, y: 0 });
      gsap.set(dock, { autoAlpha: 1, y: 0 });
    }

    const magnify = (event: PointerEvent) => {
      const pointerX = event.clientX;
      icons.forEach((icon) => {
        const bounds = icon.getBoundingClientRect();
        const distance = Math.abs(pointerX - (bounds.left + bounds.width / 2));
        const influence = Math.max(0, 1 - distance / 115);
        gsap.to(icon, {
          scale: 1 + influence * 0.55,
          y: -influence * 17,
          duration: 0.22,
          ease: "power3.out",
          overwrite: true,
        });
      });
    };

    const reset = () => {
      gsap.to(icons, { scale: 1, y: 0, duration: 0.28, ease: "power3.out", overwrite: true });
    };

    dock.addEventListener("pointermove", magnify);
    dock.addEventListener("pointerleave", reset);

    return () => {
      dock.removeEventListener("pointermove", magnify);
      dock.removeEventListener("pointerleave", reset);
    };
  }, { scope: dockRef });

  return (
    <>
      {notesOpen && (
        <NotesWindow
          onClose={() => setNotesOpen(false)}
          onMinimize={() => setNotesOpen(false)}
          title={noteTitle}
          body={noteBody}
          onTitleChange={setNoteTitle}
          onBodyChange={setNoteBody}
        />
      )}
      <nav id="dock" ref={dockRef} aria-label="Dock">
        <div className="dock-container">
          {dockApps.map((app, index) => (
            <div className="dock-item" key={app.id}>
              {index === dockApps.length - 1 && <span className="dock-divider" aria-hidden="true" />}
              <button
                className="dock-icon"
                type="button"
                aria-label={app.name}
                title={app.name}
                data-app-id={app.id}
                disabled={!app.canOpen}
                aria-expanded={app.id === "notes" ? notesOpen : undefined}
                onClick={app.id === "notes" ? () => setNotesOpen(true) : () => onLaunch?.(app.id)}
              >
                <span className="dock-tooltip" aria-hidden="true">{app.name}</span>
                <Image src={dockAssetPaths[app.id] ?? `/images/${app.icon}`} alt="" width={64} height={64} draggable={false} />
              </button>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
