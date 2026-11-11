"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { WindowApp } from "@/components/app-window";

type LaunchpadProps = { apps: WindowApp[]; onClose: () => void; onOpen: (app: WindowApp) => void };

export default function Launchpad({ apps, onClose, onOpen }: LaunchpadProps) {
  const [query, setQuery] = useState("");
  const visibleApps = useMemo(() => apps.filter((app) => app.name.toLowerCase().includes(query.toLowerCase())), [apps, query]);
  return (
    <section className="launchpad-overlay" aria-label="Launchpad">
      <button className="launchpad-close" onClick={onClose} aria-label="Close Launchpad"><X size={18} /></button>
      <label className="launchpad-search"><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></label>
      <div className="launchpad-grid">
        {visibleApps.map((app, index) => (
          <button key={app.id} style={{ animationDelay: `${index * 35}ms` }} onClick={() => onOpen(app)}>
            <span className="launchpad-icon"><img src={app.icon} alt="" /></span>
            <span>{app.name}</span>
          </button>
        ))}
        {visibleApps.length === 0 && <p className="launchpad-empty">No apps found</p>}
      </div>
    </section>
  );
}
