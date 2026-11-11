"use client";

import { useClock } from "@/components/widgets/use-clock";

export default function ClockWidget({ compact = false }: { compact?: boolean }) {
  const now = useClock();
  const hourAngle = (now.getHours() % 12) * 30 + now.getMinutes() * 0.5;
  const minuteAngle = now.getMinutes() * 6 + now.getSeconds() * 0.1;
  const secondAngle = now.getSeconds() * 6;
  return (
    <section className={`widget-card clock-widget${compact ? " compact" : ""}`} aria-label="Clock">
      <svg viewBox="0 0 54 54" aria-hidden="true">
        <circle cx="27" cy="27" r="25.5" />
        {Array.from({ length: 12 }, (_, index) => <line key={index} x1="27" y1="4" x2="27" y2="7" transform={`rotate(${index * 30} 27 27)`} className="clock-tick" />)}
        <line x1="27" y1="27" x2="27" y2="14" transform={`rotate(${hourAngle} 27 27)`} className="clock-hour" />
        <line x1="27" y1="27" x2="27" y2="9" transform={`rotate(${minuteAngle} 27 27)`} className="clock-minute" />
        <line x1="27" y1="27" x2="27" y2="6" transform={`rotate(${secondAngle} 27 27)`} className="clock-second" />
        <circle cx="27" cy="27" r="2" className="clock-center" />
      </svg>
      <div><strong>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong><small>{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</small></div>
    </section>
  );
}
