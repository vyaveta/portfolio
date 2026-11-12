"use client";

import { Wifi, WifiOff, X } from "lucide-react";
import { MenuPopover } from "@/components/menus/base";

type WifiMenuProps = { enabled: boolean; onToggle: () => void; onClose: () => void };

export default function WifiMenu({ enabled, onToggle, onClose }: WifiMenuProps) {
  return (
    <MenuPopover className="wifi-menu">
      <header><div className="menu-icon-tile"><Wifi size={17} /></div><div><strong>Wi-Fi</strong><small>{enabled ? "Connected" : "Off"}</small></div><button onClick={onClose} aria-label="Close Wi-Fi menu"><X size={14} /></button></header>
      <button className={`wifi-toggle-row${enabled ? " enabled" : ""}`} onClick={onToggle}>
        {enabled ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span>{enabled ? "Wi-Fi On" : "Wi-Fi Off"}</span>
        <i aria-hidden="true" />
      </button>
      <p>{enabled ? "Connected to your local network" : "Turn on Wi-Fi to connect to a network"}</p>
    </MenuPopover>
  );
}
