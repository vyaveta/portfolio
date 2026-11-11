"use client";

import { useEffect, useState } from "react";
import { navIcons } from "@/constants";
import dayjs from "dayjs";
import Image from "next/image";

type NavbarProps = {
  onOpenSpotlight?: () => void;
  onOpenNotifications?: () => void;
  onOpenControlCenter?: () => void;
  onOpenLaunchpad?: () => void;
  onOpenApp?: (id: string) => void;
  onOpenAbout?: () => void;
  onPower?: (action: "sleep" | "restart" | "shutdown") => void;
};

const Navbar = ({ onOpenSpotlight, onOpenNotifications, onOpenControlCenter, onOpenLaunchpad, onOpenApp, onOpenAbout, onPower }: NavbarProps) => {
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const list = [
    { name: "Projects", action: onOpenLaunchpad },
    { name: "Portfolio", app: "finder" },
    { name: "Contact", app: "contact" },
    { name: "Github", app: "safari" },
  ];
  const handlers = [onOpenControlCenter, onOpenSpotlight, onOpenNotifications, undefined];
  const labels = ["Control Center", "Spotlight", "Notifications", "Appearance"];

  return (
    <nav id="menubar" className="py-px">
      <div className="menubar-brand">
        <button className="menubar-apple" onClick={() => setShowPowerMenu((show) => !show)} aria-label="System menu" aria-expanded={showPowerMenu}>
          <Image src="/images/logo.svg" height={14} width={14} alt="" />
        </button>
        <p className="font-bold text-sm">Adwaith&apos;s Portfolio</p>
        <ul>
          {list.map((item) => <li key={item.name}><p onClick={item.action ?? (item.app ? () => onOpenApp?.(item.app!) : undefined)}>{item.name}</p></li>)}
        </ul>
      </div>
      <div className="menubar-status">
        <ul>
          {navIcons.map(({ id, img }, index) => (
            <li key={id}>
              <button className="menubar-icon" aria-label={labels[index]} onClick={handlers[index]}>
                <Image src={img} className="icon-hover" alt="" width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
        <time>{dayjs(now).format("ddd MMM D h:mm A")}</time>
      </div>
      {showPowerMenu && (
        <div className="menubar-power-menu">
          <strong>Adwaith&apos;s Mac</strong>
          <button onClick={() => { setShowPowerMenu(false); onOpenAbout?.(); }}>About This Mac</button>
          <hr />
          <button onClick={() => { setShowPowerMenu(false); onPower?.("sleep"); }}>Sleep</button>
          <button onClick={() => { setShowPowerMenu(false); onPower?.("restart"); }}>Restart…</button>
          <button onClick={() => { setShowPowerMenu(false); onPower?.("shutdown"); }}>Shut Down…</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
