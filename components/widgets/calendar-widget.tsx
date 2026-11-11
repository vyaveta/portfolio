"use client";

import { useClock } from "@/components/widgets/use-clock";

export default function CalendarWidget({ compact = false }: { compact?: boolean }) {
  const today = useClock();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const start = new Date(today.getFullYear(), today.getMonth(), 1 - first.getDay());
  const days = Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  const month = today.toLocaleDateString(undefined, { month: "long" });
  return (
    <section className={`widget-card calendar-widget${compact ? " compact" : ""}`} aria-label={`${month} calendar`}>
      <strong className="calendar-month">{month}</strong>
      <div className="calendar-grid calendar-weekdays">{"SMTWTFS".split("").map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="calendar-grid calendar-days">
        {days.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          return <span key={`${day.toISOString()}-${index}`} className={`${day.getMonth() === today.getMonth() ? "in-month" : "out-month"}${isToday ? " today" : ""}`}>{day.getDate()}</span>;
        })}
      </div>
    </section>
  );
}
