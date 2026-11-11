"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Bell, Clock3, Music2, Pause, Play } from "lucide-react";

type IslandNotice = { message: string; type: "generic" | "appLaunch" | "timer" };
type DynamicIslandProps = { currentApp?: string };

export default function DynamicIsland({ currentApp }: DynamicIslandProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [notice, setNotice] = useState<IslandNotice | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<IslandNotice>).detail;
      setNotice(detail ?? { message: "A new notification arrived", type: "generic" });
      setExpanded(true);
    };
    window.addEventListener("island:notify", handler);
    return () => window.removeEventListener("island:notify", handler);
  }, []);

  useEffect(() => {
    if (!timerRunning || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, seconds]);

  useEffect(() => {
    if (seconds === 0 && timerRunning) {
      setTimerRunning(false);
      setNotice({ message: "Your one minute timer is done", type: "timer" });
    }
  }, [seconds, timerRunning]);

  const startTimer = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setSeconds(60);
    setTimerRunning(true);
    setNotice({ message: "1 minute timer", type: "timer" });
    setExpanded(true);
  };

  return (
    <div className={`dynamic-island${expanded ? " expanded" : ""}${hovered ? " hovered" : ""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button className="dynamic-island-pill" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-label="Toggle Dynamic Island">
        {notice ? <Bell size={13} /> : currentApp ? <span className="island-live-dot" /> : <span className="island-camera" />}
        {!expanded && <span className="island-compact-label">{notice?.message ?? currentApp ?? ""}</span>}
      </button>
      {expanded && (
        <section className="dynamic-island-panel">
          <div className="island-now-playing"><span className="island-art"><Music2 size={19} /></span><div><strong>{notice?.type === "timer" ? "Timer" : currentApp ?? "Desktop"}</strong><small>{notice?.message ?? "Your Mac is ready"}</small></div></div>
          <div className="island-actions">
            <span className="island-timer"><Clock3 size={15} />{timerRunning ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Quick timer"}</span>
            <button onClick={timerRunning ? (event) => { event.stopPropagation(); setTimerRunning(false); } : startTimer} aria-label={timerRunning ? "Pause timer" : "Start one minute timer"}>{timerRunning ? <Pause size={15} /> : <Play size={15} />}</button>
          </div>
        </section>
      )}
    </div>
  );
}
