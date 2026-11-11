"use client";

import { Bell, Moon, X } from "lucide-react";
import { BatteryWidget, CalendarWidget, ClockWidget, WeatherWidget } from "@/components/widgets";

export type DesktopNotification = { id: string; title: string; message: string; icon: string; createdAt: number };
type NotificationCenterProps = {
  show: boolean;
  notifications: DesktopNotification[];
  focusMode: boolean;
  onClose: () => void;
  onClear: () => void;
  onToggleFocus: () => void;
};

export default function NotificationCenter({ show, notifications, focusMode, onClose, onClear, onToggleFocus }: NotificationCenterProps) {
  if (!show) return null;
  const now = new Date();
  return (
    <div className="notification-backdrop" onMouseDown={onClose}>
      <aside className="notification-center" onMouseDown={(event) => event.stopPropagation()} aria-label="Notification Center">
        <header><div><strong>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</strong><span>Notification Center</span></div><button onClick={onClose} aria-label="Close notifications"><X size={16} /></button></header>
        <section className="notification-card">
          <div className="notification-card-title"><strong>Notifications</strong><button onClick={onClear} disabled={!notifications.length}>Clear All</button></div>
          {notifications.length ? notifications.map((notification) => (
            <article key={notification.id} className="notification-item">
              <img src={notification.icon} alt="" />
              <div><strong>{notification.title}</strong><span>{new Date(notification.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span><p>{notification.message}</p></div>
            </article>
          )) : <p className="notification-empty"><Bell size={19} />You&apos;re all caught up</p>}
        </section>
        <section className="notification-widgets">
          <CalendarWidget compact />
          <WeatherWidget compact />
          <ClockWidget compact />
          <BatteryWidget compact />
          <button className={`notification-focus${focusMode ? " active" : ""}`} onClick={onToggleFocus}><Moon size={17} /><span>Focus</span><small>{focusMode ? "On" : "Off"}</small></button>
        </section>
      </aside>
    </div>
  );
}
