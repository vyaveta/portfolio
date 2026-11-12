"use client";

import type { ReactNode } from "react";
import { Airplay, Bluetooth, Focus, Moon, RotateCcw, Volume2, Wifi } from "lucide-react";
import { MenuPopover } from "@/components/menus/base";

type ControlCenterMenuProps = {
  brightness: number; setBrightness: (value: number) => void;
  volume: number; setVolume: (value: number) => void;
  wifiEnabled: boolean; toggleWifi: () => void;
  bluetoothEnabled: boolean; toggleBluetooth: () => void;
  airdropEnabled: boolean; toggleAirdrop: () => void;
  focusMode: boolean; toggleFocus: () => void;
  onClose: () => void; onOpenNotifications: () => void;
};

function ToggleTile({ icon, title, subtitle, active, onClick }: { icon: ReactNode; title: string; subtitle: string; active: boolean; onClick: () => void }) {
  return <button className={`cc-toggle-tile${active ? " active" : ""}`} onClick={onClick}><span>{icon}</span><strong>{title}</strong><small>{subtitle}</small></button>;
}

export default function ControlCenterMenu(props: ControlCenterMenuProps) {
  return (
    <MenuPopover className="control-center-menu">
      <header><strong>Control Center</strong><button onClick={props.onClose} aria-label="Close Control Center"><RotateCcw size={14} /></button></header>
      <div className="cc-connectivity-grid">
        <ToggleTile icon={<Wifi size={17} />} title="Wi-Fi" subtitle={props.wifiEnabled ? "Connected" : "Off"} active={props.wifiEnabled} onClick={props.toggleWifi} />
        <ToggleTile icon={<Bluetooth size={17} />} title="Bluetooth" subtitle={props.bluetoothEnabled ? "On" : "Off"} active={props.bluetoothEnabled} onClick={props.toggleBluetooth} />
        <ToggleTile icon={<Airplay size={17} />} title="AirDrop" subtitle={props.airdropEnabled ? "On" : "Off"} active={props.airdropEnabled} onClick={props.toggleAirdrop} />
        <ToggleTile icon={<Focus size={17} />} title="Focus" subtitle={props.focusMode ? "On" : "Off"} active={props.focusMode} onClick={props.toggleFocus} />
      </div>
      <label className="cc-slider-card"><span><Moon size={15} /> Display</span><input aria-label="Display brightness" type="range" min="20" max="100" value={props.brightness} onChange={(event) => props.setBrightness(Number(event.target.value))} /></label>
      <label className="cc-slider-card"><span><Volume2 size={15} /> Sound</span><input aria-label="Volume" type="range" min="0" max="100" value={props.volume} onChange={(event) => props.setVolume(Number(event.target.value))} /></label>
      <button className="cc-notifications-button" onClick={() => { props.onClose(); props.onOpenNotifications(); }}>Open Notification Center</button>
    </MenuPopover>
  );
}
