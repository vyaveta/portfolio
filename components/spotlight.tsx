"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import type { WindowApp } from "@/components/app-window";

type SpotlightProps = { show: boolean; apps: WindowApp[]; onClose: () => void; onOpen: (app: WindowApp) => void };

export default function Spotlight({ show, apps, onClose, onOpen }: SpotlightProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const results = useMemo(() => apps.filter((app) => app.name.toLowerCase().includes(query.trim().toLowerCase())), [apps, query]);

  useEffect(() => {
    if (show) inputRef.current?.focus();
    else { setQuery(""); setSelected(0); }
  }, [show]);

  useEffect(() => setSelected(0), [query]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onClose();
    if (event.key === "ArrowDown") { event.preventDefault(); setSelected((current) => Math.min(current + 1, results.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setSelected((current) => Math.max(current - 1, 0)); }
    if (event.key === "Enter" && results[selected]) onOpen(results[selected]);
  };

  if (!show) return null;
  return (
    <div className="spotlight-backdrop" onMouseDown={onClose}>
      <section className="spotlight-window" onMouseDown={(event) => event.stopPropagation()}>
        <label><Search size={20} /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} placeholder="Spotlight Search" /></label>
        {query && <div className="spotlight-results">
          {results.map((app, index) => <button className={index === selected ? "selected" : ""} key={app.id} onMouseEnter={() => setSelected(index)} onClick={() => onOpen(app)}><img src={app.icon} alt="" /><span>{app.name}</span><small>Application</small></button>)}
          {results.length === 0 && <p>No results found</p>}
        </div>}
        <footer>Use ↑ ↓ to navigate · Return to open · Esc to close</footer>
      </section>
    </div>
  );
}
