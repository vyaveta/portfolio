"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Search, SlidersHorizontal, Wifi } from "lucide-react";
import AppleMenu from "@/components/menus/AppleMenu";
import Battery from "@/components/menus/Battery";
import ControlCenterMenu from "@/components/menus/ControlCenterMenu";
import WifiMenu from "@/components/menus/WifiMenu";
import { useClock } from "@/components/widgets/use-clock";

type TopBarProps = {
  title: string;
  brightness: number; setBrightness: (value: number) => void;
  volume: number; setVolume: (value: number) => void;
  wifiEnabled: boolean; toggleWifi: () => void;
  bluetoothEnabled: boolean; toggleBluetooth: () => void;
  airdropEnabled: boolean; toggleAirdrop: () => void;
  focusMode: boolean; toggleFocus: () => void;
  onOpenSpotlight: () => void;
  onOpenNotifications: () => void;
  onOpenAbout: () => void;
  onOpenApp: (id: string) => void;
  onPower: (action: "sleep" | "restart" | "shutdown") => void;
  onLock: () => void;
  onForceQuit: () => void;
};

type MenuName = "apple" | "wifi" | "control" | null;

export default function TopBar(props: TopBarProps) {
  const now = useClock();
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState<MenuName>(null);
  useEffect(() => {
    if (!menu) return;
    const closeOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setMenu(null); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(null); };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); window.removeEventListener("keydown", closeEscape); };
  }, [menu]);

  const toggleMenu = (name: Exclude<MenuName, null>) => setMenu((current) => current === name ? null : name);
  return (
    <div className="macos-menu-bar-shell" ref={rootRef}>
      <header className="macos-menu-bar">
        <div className="macos-menu-left">
          <button className={`macos-menu-button apple-mark${menu === "apple" ? " active" : ""}`} onClick={() => toggleMenu("apple")} aria-label="Apple menu" aria-expanded={menu === "apple"}>
            <img src="/img/icons/sf-icons/general.svg" alt="" />
          </button>
          <strong>{props.title}</strong>
          <button className="macos-menu-button">File</button>
          <button className="macos-menu-button">Edit</button>
          <button className="macos-menu-button">View</button>
          <button className="macos-menu-button">Window</button>
          <button className="macos-menu-button">Help</button>
        </div>
        <div className="macos-menu-right">
          <Battery />
          <button className={`macos-menu-button icon-only${menu === "wifi" ? " active" : ""}`} onClick={() => toggleMenu("wifi")} aria-label="Wi-Fi" aria-expanded={menu === "wifi"}><Wifi size={16} className={props.wifiEnabled ? "" : "opacity-40"} /></button>
          <button className="macos-menu-button icon-only" onClick={props.onOpenSpotlight} aria-label="Spotlight"><Search size={15} /></button>
          <button className={`macos-menu-button icon-only${menu === "control" ? " active" : ""}`} onClick={() => toggleMenu("control")} aria-label="Control Center" aria-expanded={menu === "control"}><SlidersHorizontal size={16} /></button>
          <button className="macos-menu-button date-button" onClick={props.onOpenNotifications} aria-label="Open Notification Center"><Bell size={13} /><span>{now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span><span>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></button>
        </div>
      </header>
      {menu === "apple" && <AppleMenu onClose={() => setMenu(null)} onAbout={props.onOpenAbout} onOpenApp={props.onOpenApp} onPower={props.onPower} onLock={props.onLock} onForceQuit={props.onForceQuit} />}
      {menu === "wifi" && <WifiMenu enabled={props.wifiEnabled} onToggle={props.toggleWifi} onClose={() => setMenu(null)} />}
      {menu === "control" && <ControlCenterMenu brightness={props.brightness} setBrightness={props.setBrightness} volume={props.volume} setVolume={props.setVolume} wifiEnabled={props.wifiEnabled} toggleWifi={props.toggleWifi} bluetoothEnabled={props.bluetoothEnabled} toggleBluetooth={props.toggleBluetooth} airdropEnabled={props.airdropEnabled} toggleAirdrop={props.toggleAirdrop} focusMode={props.focusMode} toggleFocus={props.toggleFocus} onClose={() => setMenu(null)} onOpenNotifications={props.onOpenNotifications} />}
    </div>
  );
}
