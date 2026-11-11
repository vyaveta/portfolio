"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import gsap from "gsap";

type AboutThisMacModalProps = { show: boolean; onClose: () => void };

export default function AboutThisMacModal({ show, onClose }: AboutThisMacModalProps) {
  const modalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!show || !modalRef.current) return;
    gsap.fromTo(modalRef.current, { autoAlpha: 0, scale: 0.92, y: 12 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.24, ease: "power3.out" });
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [show, onClose]);

  if (!show) return null;
  return (
    <div className="about-mac-backdrop" onMouseDown={onClose}>
      <section ref={modalRef} className="about-mac-modal" aria-labelledby="about-mac-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><span id="about-mac-title">About This Mac</span><button onClick={onClose} aria-label="Close About This Mac"><X size={15} /></button></header>
        <img className="about-mac-art" src="/img/macOS-Tahoe-26-Feature-removebg-preview.png" alt="macOS Tahoe 26" />
        <h1>Adwaith&apos;s Mac</h1>
        <p className="about-mac-subtitle">A macOS inspired portfolio desktop</p>
        <dl>
          <div><dt>System</dt><dd>macOS Tahoe inspired</dd></div>
          <div><dt>Interface</dt><dd>Liquid Glass</dd></div>
          <div><dt>Built with</dt><dd>Next.js · React · GSAP</dd></div>
        </dl>
        <p className="about-mac-footnote">A small interactive portfolio by Adwaith.</p>
      </section>
    </div>
  );
}
