"use client";

import { useEffect, useState } from "react";
import { BatteryCharging, BatteryFull } from "lucide-react";

type BatteryManager = { level: number; charging: boolean; addEventListener: (name: string, callback: () => void) => void; removeEventListener: (name: string, callback: () => void) => void };
type BatteryCapableNavigator = Navigator & { getBattery?: () => Promise<BatteryManager> };

export default function Battery() {
  const [state, setState] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    let manager: BatteryManager | null = null;
    let alive = true;
    const update = () => { if (manager && alive) setState({ level: manager.level, charging: manager.charging }); };
    (navigator as BatteryCapableNavigator).getBattery?.().then((battery) => {
      if (!alive) return;
      manager = battery;
      update();
      manager.addEventListener("levelchange", update);
      manager.addEventListener("chargingchange", update);
    }).catch(() => undefined);
    return () => {
      alive = false;
      manager?.removeEventListener("levelchange", update);
      manager?.removeEventListener("chargingchange", update);
    };
  }, []);
  const percent = state ? Math.round(state.level * 100) : null;
  return (
    <div className="menubar-battery" title={percent === null ? "Battery status unavailable" : `${percent}%${state?.charging ? ", charging" : ""}`}>
      {state?.charging ? <BatteryCharging size={16} /> : <BatteryFull size={16} />}
      {percent !== null && <span>{percent}%</span>}
    </div>
  );
}
