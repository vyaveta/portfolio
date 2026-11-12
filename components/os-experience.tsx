"use client";

import { useEffect, useState, type TouchEvent } from "react";
import { BatteryFull, Bluetooth, Volume2, Wifi, X } from "lucide-react";

function AppleLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M16 2C8.3 2 2 8.3 2 16c0 7.7 6.3 14 14 14 7.7 0 14-6.3 14-14C30 8.3 23.7 2 16 2zm0 26C10.5 28 6 23.5 6 18S10.5 8 16 8s10 4.5 10 10-4.5 10-10 10zm5.5-16c0-1.7-.7-3.2-1.8-4.3-1.3-1.4-3.1-2.2-5.2-2.2-2.1 0-3.9.8-5.2 2.2-1.1 1.1-1.8 2.6-1.8 4.3 0 1.7.7 3.2 1.8 4.3 1.3 1.4 3.1 2.2 5.2 2.2 2.1 0 3.9-.8 5.2-2.2 1.1-1.1 1.8-2.6 1.8-4.3z" />
      <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
import Dock from "@/components/dock";
import NotesWindow from "@/components/apps/Notes";
import Finder from "@/components/apps/Finder";
import SpotifyWindow from "@/components/apps/Spotify";
import SafariWindow from "@/components/apps/Safari";
import AboutThisMacModal from "@/components/about-this-mac-modal";
import AppWindow, { type WindowApp } from "@/components/app-window";
import TerminalWindow from "@/components/terminal-window";
import DesktopIcons from "@/components/desktop-icons";
import DynamicIsland from "@/components/dynamic-island";
import Launchpad from "@/components/launchpad";
import NotificationCenter, { type DesktopNotification } from "@/components/notification-center";
import Spotlight from "@/components/spotlight";
import DesktopWidgets from "@/components/widgets/desktop-widgets";
import BatteryWidget from "@/components/widgets/battery-widget";
import TopBar from "@/components/menus/TopBar";
import ContextMenu from "@/components/menus/ContextMenu";

type Screen = "boot" | "login" | "desktop";
type AppInfo = WindowApp;

const apps: AppInfo[] = [
  { id: "finder", name: "Portfolio", icon: "/img/icons/finder.png" },
  { id: "safari", name: "Articles", icon: "/img/icons/safari.png" },
  { id: "photos", name: "Gallery", icon: "/img/icons/photos.png" },
  { id: "contact", name: "Contact", icon: "/images/contact.png" },
  { id: "terminal", name: "Skills", icon: "/img/icons/terminal.png" },
  { id: "spotify", name: "Spotify", icon: "/img/icons/spotify.png" },
  { id: "notes", name: "Notes", icon: "/img/icons/notes.png" },
  { id: "resume", name: "Resume", icon: "/img/icons/sf-icons/pdf.svg" },
  { id: "system-settings", name: "System Settings", icon: "/img/icons/settings.png" },
  { id: "app-store", name: "App Store", icon: "/img/icons/app-store.png" },
];

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function BootScreen({
  busy,
  progress,
  wakeOnly,
  shutdown,
  onStart,
}: {
  busy: boolean;
  progress: number;
  wakeOnly: boolean;
  shutdown: boolean;
  onStart: () => void;
}) {
  return (
    <button className="os-boot-screen" onClick={onStart} disabled={busy} aria-label={shutdown ? "Power on this Mac" : wakeOnly ? "Wake this Mac" : "Start this Mac"}>
      <AppleLogo className="os-boot-apple" width={48} height={48} />
      {busy ? (
        <div className="os-boot-progress" aria-label={`Starting up ${Math.round(progress)} percent`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      ) : shutdown ? (
        <span className="os-boot-prompt">Your Mac is shut down · Click to power on</span>
      ) : (
        <span className="os-boot-prompt">Click to {wakeOnly ? "wake up" : "boot"}</span>
      )}
    </button>
  );
}

function LoginScreen({ onLogin, onPower }: { onLogin: () => void; onPower: (action: "sleep" | "restart" | "shutdown") => void }) {
  const now = useClock();
  const [showSignIn, setShowSignIn] = useState(false);
  const date = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <section className="os-login-screen" onClick={() => !showSignIn && setShowSignIn(true)}>
      <div className="os-login-clock">
        <time>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
        <p>{date}</p>
      </div>
      {showSignIn ? (
        <div className="os-login-user" onClick={(event) => event.stopPropagation()}>
          <div className="os-avatar">A</div>
          <h1>Adwaith</h1>
          <button className="os-glass-button" onClick={onLogin}>Sign In <span aria-hidden="true">↵</span></button>
          <p>Press Enter to continue</p>
          <input
            className="os-login-keyboard"
            aria-label="Press Enter to sign in"
            autoFocus
            onKeyDown={(event) => { if (event.key === "Enter") onLogin(); }}
          />
        </div>
      ) : (
        <button className="os-unlock-hint" onClick={(event) => { event.stopPropagation(); setShowSignIn(true); }}>Click anywhere to unlock</button>
      )}
      <div className="os-power-actions" onClick={(event) => event.stopPropagation()}>
        <button onClick={() => onPower("sleep")}><span>◐</span>Sleep</button>
        <button onClick={() => onPower("restart")}><span>↻</span>Restart</button>
        <button onClick={() => onPower("shutdown")}><span>⏻</span>Shut Down</button>
      </div>
    </section>
  );
}

function ControlCenter({
  onClose,
  brightness,
  setBrightness,
  volume,
  setVolume,
}: {
  onClose: () => void;
  brightness: number;
  setBrightness: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
}) {
  return (
    <aside className="os-utility-panel control" aria-label="Control Center">
      <header>
        <strong>Control Center</strong>
        <button onClick={onClose} aria-label="Close panel"><X size={16} /></button>
      </header>
      <div className="os-toggle-grid">
        <div><Wifi /><span>Wi-Fi</span><small>Connected</small></div>
        <div><Bluetooth /><span>Bluetooth</span><small>On</small></div>
      </div>
      <label className="os-slider"><span>Display</span><input type="range" min="20" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} /></label>
      <label className="os-slider"><span><Volume2 size={16} /> Sound</span><input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} /></label>
      <BatteryWidget compact />
    </aside>
  );
}

function MobileHome({ openApp, openControl, openNotifications, brightness, setBrightness, volume, setVolume }: {
  openApp: (app: AppInfo) => void;
  openControl: () => void;
  openNotifications: () => void;
  brightness: number;
  setBrightness: (value: number) => void;
  volume: number;
  setVolume: (value: number) => void;
}) {
  const now = useClock();
  const touchStart = (event: TouchEvent<HTMLElement>) => {
    const touch = event.touches[0];
    if (touch.clientY < 60) {
      event.currentTarget.dataset.startY = String(touch.clientY);
      event.currentTarget.dataset.startX = String(touch.clientX);
    }
  };
  const touchEnd = (event: TouchEvent<HTMLElement>) => {
    const startY = Number((event.currentTarget as HTMLDivElement).dataset.startY);
    const startX = Number((event.currentTarget as HTMLDivElement).dataset.startX);
    const endY = event.changedTouches[0]?.clientY ?? startY;
    if (startY < 60 && endY - startY > 35) {
      if (startX < window.innerWidth / 2) openNotifications();
      else openControl();
    }
    delete (event.currentTarget as HTMLDivElement).dataset.startY;
    delete (event.currentTarget as HTMLDivElement).dataset.startX;
  };
  return (
    <section className="os-mobile-home" onTouchStart={touchStart} onTouchEnd={touchEnd}>
      <header className="os-mobile-status">
        <button onClick={openNotifications}>{now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</button>
        <button onClick={openControl} aria-label="Open Control Center"><Wifi size={14} /><BatteryFull size={17} /></button>
      </header>
      <div className="os-mobile-date"><strong>{now.toLocaleDateString(undefined, { weekday: "long" })}</strong><span>{now.toLocaleDateString(undefined, { month: "long", day: "numeric" })}</span></div>
      <div className="os-mobile-grid">
        {apps.map((app) => <button key={app.id} onClick={() => openApp(app)}><img src={app.icon} alt="" /><span>{app.name}</span></button>)}
      </div>
      <div className="os-mobile-dock">
        {[apps[0], apps[1], apps[5], apps[3]].map((app) => <button key={app.id} onClick={() => openApp(app)} aria-label={app.name}><img src={app.icon} alt="" /></button>)}
      </div>
      <div className="os-mobile-home-indicator" />
    </section>
  );
}

export default function OsExperience() {
  const [screen, setScreen] = useState<Screen>("boot");
  const [bootBusy, setBootBusy] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [wakeOnly, setWakeOnly] = useState(false);
  const [shutdown, setShutdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(70);
  const [spotlight, setSpotlight] = useState(false);
  const [launchpad, setLaunchpad] = useState(false);
  const [panel, setPanel] = useState<"control" | "notifications" | null>(null);
  const [activeApp, setActiveApp] = useState<AppInfo | null>(null);
  const [windowMinimized, setWindowMinimized] = useState(false);
  const [windowMaximized, setWindowMaximized] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airdropEnabled, setAirdropEnabled] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number }>({ show: false, x: 0, y: 0 });
  const [notifications, setNotifications] = useState<DesktopNotification[]>([]);
  const [noteTitle, setNoteTitle] = useState("Welcome to Notes");
  const [noteBody, setNoteBody] = useState("A quiet place for ideas, plans, and everything you want to remember.");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!bootBusy) return;
    const timer = window.setInterval(() => {
      setBootProgress((progress) => {
        if (progress >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => { setBootBusy(false); setBootProgress(0); setScreen("login"); setWakeOnly(false); }, 250);
          return 100;
        }
        return Math.min(100, progress + 3);
      });
    }, 28);
    return () => window.clearInterval(timer);
  }, [bootBusy]);

  useEffect(() => {
    if (screen !== "desktop") return;
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === "Space") { event.preventDefault(); setSpotlight(true); }
      if (event.key === "Escape") { setSpotlight(false); setLaunchpad(false); setPanel(null); }
      if (event.key === "F11") {
        event.preventDefault();
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
      if (event.key === "F1") setBrightness((value) => Math.max(20, value - 10));
      if (event.key === "F2") setBrightness((value) => Math.min(100, value + 10));
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [screen]);

  const beginBoot = () => {
    if (wakeOnly) { setScreen("login"); setWakeOnly(false); return; }
    if (bootBusy) return;
    setShutdown(false);
    setBootProgress(0);
    setBootBusy(true);
  };

  const power = (action: "sleep" | "restart" | "shutdown") => {
    setActiveApp(null);
    setWindowMinimized(false);
    setWindowMaximized(false);
    if (action === "sleep") { setShutdown(false); setWakeOnly(true); setBootBusy(false); setScreen("boot"); }
    else if (action === "shutdown") { setShutdown(true); setWakeOnly(false); setBootBusy(false); setScreen("boot"); }
    else { setShutdown(false); setWakeOnly(false); setScreen("boot"); setBootProgress(0); setBootBusy(true); }
  };

  const openApp = (app: AppInfo) => {
    setActiveApp(app);
    setWindowMinimized(false);
    setWindowMaximized(false);
    setSpotlight(false);
    setLaunchpad(false);
    setPanel(null);
    setContextMenu((current) => ({ ...current, show: false }));
    if (!focusMode) {
      const notification = { id: `${Date.now()}-${app.id}`, title: app.name, message: `${app.name} opened`, icon: app.icon, createdAt: Date.now() };
      setNotifications((current) => [notification, ...current].slice(0, 6));
      window.dispatchEvent(new CustomEvent("island:notify", { detail: { type: "appLaunch", message: `${app.name} opened` } }));
    }
  };

  if (screen === "boot") return <BootScreen busy={bootBusy} progress={bootProgress} wakeOnly={wakeOnly} shutdown={shutdown} onStart={beginBoot} />;
  if (screen === "login") return <LoginScreen onLogin={() => setScreen("desktop")} onPower={power} />;

  return (
    <div className="os-desktop-shell" onContextMenu={(event) => { if (isMobile) return; event.preventDefault(); setContextMenu({ show: true, x: event.clientX, y: event.clientY }); }}>
      <div className="os-wallpaper" style={{ filter: `brightness(${brightness}%)` }} />
      {isMobile ? (
        <>
          {!activeApp && <MobileHome openApp={openApp} openControl={() => setPanel("control")} openNotifications={() => setPanel("notifications")} brightness={brightness} setBrightness={setBrightness} volume={volume} setVolume={setVolume} />}
          {activeApp && (activeApp.id === "notes" ? (
            <NotesWindow minimized={false} maximized={true} onClose={() => setActiveApp(null)} onMinimize={() => setActiveApp(null)} onToggleMaximize={() => {}} />
          ) : (
            <section className="os-mobile-app"><header><button onClick={() => setActiveApp(null)}>‹ Home</button><strong>{activeApp.name}</strong><span /></header><img src={activeApp.icon} alt="" /><h1>{activeApp.name}</h1><p>Explore {activeApp.name.toLowerCase()} in Adwaith’s portfolio.</p><button className="os-glass-button" onClick={() => setActiveApp(null)}>Done</button><div className="os-mobile-home-indicator" /></section>
          ))}
          {panel === "control" && <ControlCenter onClose={() => setPanel(null)} brightness={brightness} setBrightness={setBrightness} volume={volume} setVolume={setVolume} />}
          {panel === "notifications" && <NotificationCenter show notifications={notifications} focusMode={focusMode} onClose={() => setPanel(null)} onClear={() => setNotifications([])} onToggleFocus={() => setFocusMode((value) => !value)} />}
        </>
      ) : (
        <>
          <TopBar
            title={activeApp?.name ?? "Adwaith’s Portfolio"}
            brightness={brightness} setBrightness={setBrightness}
            volume={volume} setVolume={setVolume}
            wifiEnabled={wifiEnabled} toggleWifi={() => setWifiEnabled((value) => !value)}
            bluetoothEnabled={bluetoothEnabled} toggleBluetooth={() => setBluetoothEnabled((value) => !value)}
            airdropEnabled={airdropEnabled} toggleAirdrop={() => setAirdropEnabled((value) => !value)}
            focusMode={focusMode} toggleFocus={() => setFocusMode((value) => !value)}
            onOpenSpotlight={() => setSpotlight(true)} onOpenNotifications={() => setPanel("notifications")}
            onOpenAbout={() => setShowAbout(true)} onOpenApp={(id) => { const app = apps.find((item) => item.id === id); if (app) openApp(app); }}
            onPower={power} onLock={() => { setActiveApp(null); setScreen("login"); }} onForceQuit={() => setActiveApp(null)}
          />
          <DesktopWidgets />
          <DesktopIcons apps={[...apps.slice(0, 4), apps[5], apps[6]]} onOpen={(id) => { const app = apps.find((item) => item.id === id); if (app) openApp(app); }} />
          {/* <DynamicIsland currentApp={activeApp?.name} /> */}
          {activeApp && (activeApp.id === "finder" ? (
            <Finder minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ) : activeApp.id === "spotify" ? (
            <SpotifyWindow minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ) : activeApp.id === "safari" ? (
            <SafariWindow minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ) : activeApp.id === "notes" ? (
            <NotesWindow minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ) : activeApp.id === "terminal" ? (
            <TerminalWindow minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ) : (
            <AppWindow app={activeApp} minimized={windowMinimized} maximized={windowMaximized} onClose={() => { setActiveApp(null); setWindowMinimized(false); setWindowMaximized(false); }} onMinimize={() => setWindowMinimized(true)} onToggleMaximize={() => setWindowMaximized((value) => !value)} />
          ))}
          <Dock onLaunch={(id) => { const app = apps.find((item) => item.id === id); if (app && id !== "notes") { if (activeApp?.id === id && windowMinimized) setWindowMinimized(false); else openApp(app); } }} />
          {panel === "notifications" && <NotificationCenter show notifications={notifications} focusMode={focusMode} onClose={() => setPanel(null)} onClear={() => setNotifications([])} onToggleFocus={() => setFocusMode((value) => !value)} />}
          <AboutThisMacModal show={showAbout} onClose={() => setShowAbout(false)} />
          <Spotlight show={spotlight} apps={apps} onClose={() => setSpotlight(false)} onOpen={openApp} />
          {launchpad && <Launchpad apps={apps} onClose={() => setLaunchpad(false)} onOpen={(app) => { setLaunchpad(false); openApp(app); }} />}
          <ContextMenu x={contextMenu.x} y={contextMenu.y} show={contextMenu.show} onClose={() => setContextMenu((current) => ({ ...current, show: false }))} onOpenApp={(id) => { const app = apps.find((item) => item.id === id); if (app) openApp(app); }} />
        </>
      )}
    </div>
  );
}
