"use client";

import { useEffect, useState } from "react";
import { BatteryCharging, BatteryWarning } from "lucide-react";

type BatteryStatus = { level: number; charging: boolean; addEventListener: (event: string, listener: () => void) => void; removeEventListener: (event: string, listener: () => void) => void };
type BatteryNavigator = Navigator & { getBattery?: () => Promise<BatteryStatus> };

export default function BatteryWidget({ compact = false }: { compact?: boolean }) {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);

  useEffect(() => {
    const batteryNavigator = navigator as BatteryNavigator;
    let manager: BatteryStatus | null = null;
    let active = true;
    const update = () => {
      if (manager && active) setBattery({ level: Math.round(manager.level * 100), charging: manager.charging });
    };
    batteryNavigator.getBattery?.().then((result) => {
      if (!active) return;
      manager = result;
      update();
      manager.addEventListener("levelchange", update);
      manager.addEventListener("chargingchange", update);
    }).catch(() => setBattery(null));
    return () => {
      active = false;
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  }, []);

  const level = battery?.level;
  const tone = level !== undefined && level <= 20 ? "low" : "normal";
  const message = battery ? battery.charging ? "Charging" : level! <= 20 ? "Low battery" : "On battery" : "Status unavailable";

  return (
    <section className={`widget-card battery-widget${compact ? " compact" : ""}`} aria-label="Battery status">
      <div className="battery-glyph" aria-hidden="true"><span style={{ width: `${level ?? 0}%` }} className={tone} /><i /></div>
      <div className="battery-copy"><strong>{level === undefined ? "—" : `${level}%`}</strong><small>{message}</small></div>
      {battery?.charging && <BatteryCharging size={16} className="battery-charging" aria-label="Charging" />}
      {level !== undefined && level <= 20 && <BatteryWarning size={16} className="battery-warning" aria-label="Low battery" />}
    </section>
  );
}
