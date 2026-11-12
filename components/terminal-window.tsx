"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { terminalFilesystem, type TerminalFile } from "@/constants/terminal";

gsap.registerPlugin(useGSAP);

type TerminalWindowProps = {
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

type Geometry = { left: number | null; top: number | null; width: number; height: number };

type ResizeDirection = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";

const WELCOME_MESSAGE = `Last login: ${new Date().toLocaleString()} on ttys000
`;

const EMOJIS = ["\\(o_o)/", "(˚Δ˚)b", "(^-^*)", "(‵′)", "\\(°ˊДˋ°)/", "(‵′)"];
const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const getEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

export default function TerminalWindow({ minimized, maximized, onClose, onMinimize, onToggleMaximize }: TerminalWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const resizeRef = useRef<{ pointerId: number; x: number; y: number; width: number; height: number; direction: ResizeDirection } | null>(null);
  const wasMinimizedRef = useRef(false);
  const dropsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const [geometry, setGeometry] = useState<Geometry>({ left: null, top: null, width: 720, height: 480 });
  const [output, setOutput] = useState<string[]>([WELCOME_MESSAGE]);
  const [currentInput, setCurrentInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cwd, setCwd] = useState<string[]>([]);
  const [showRain, setShowRain] = useState(false);
  const [rainEmoji, setRainEmoji] = useState("");
  const [inputId, setInputId] = useState(0);

  // Terminal filesystem state
  const [curChildren, setCurChildren] = useState<TerminalFile[]>(terminalFilesystem);
  const [curDirPath, setCurDirPath] = useState<string[]>([]);

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(windowRef.current, { autoAlpha: 0, scale: 0.88, y: 14 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.32, ease: "power3.out" });
  }, { scope: windowRef });

  useEffect(() => {
    const element = windowRef.current;
    if (wasMinimizedRef.current && !minimized && element) {
      gsap.set(element, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, clearProps: "clipPath,visibility,opacity" });
      gsap.fromTo(element, { autoAlpha: 0, scale: 0.9, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" });
    }
    wasMinimizedRef.current = minimized;
  }, [minimized]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [minimized, maximized, inputId]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Matrix rain animation
  useEffect(() => {
    if (!showRain) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const FONT_SIZE = 14;
    canvas.height = container.offsetHeight;
    canvas.width = container.offsetWidth;

    const columns = Math.floor(canvas.width / FONT_SIZE);
    dropsRef.current = Array(columns).fill(1);
    setRainEmoji(getEmoji());

    const rain = () => {
      if (!canvas || !showRain) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#2e9244";
      ctx.font = `${FONT_SIZE}px monospace`;

      dropsRef.current.forEach((y, x) => {
        const text = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        ctx.fillText(text, x * FONT_SIZE, y * FONT_SIZE);
      });

      dropsRef.current = dropsRef.current.map((y) => {
        if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) return 1;
        return y + 1;
      });

      animationFrameRef.current = requestAnimationFrame(rain);
    };

    rain();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [showRain]);

  const animateToDock = (complete: () => void) => {
    const element = windowRef.current;
    const icon = document.querySelector<HTMLElement>('[data-app-id="terminal"]');
    if (!element || !icon) { complete(); return; }
    const bounds = element.getBoundingClientRect();
    const iconBounds = icon.getBoundingClientRect();
    const currentX = Number(gsap.getProperty(element, "x"));
    const currentY = Number(gsap.getProperty(element, "y"));
    const dx = iconBounds.left + iconBounds.width / 2 - bounds.left - bounds.width / 2;
    const dy = iconBounds.top + iconBounds.height / 2 - bounds.top - bounds.height / 2;
    gsap.timeline({ onComplete: complete })
      .to(element, { clipPath: "polygon(0 0,100% 0,100% 72%,55% 72%,50% 100%,45% 72%,0 72%)", duration: 0.18, ease: "power2.in" })
      .to(element, { x: currentX + dx, y: currentY + dy, scaleX: 0.06, scaleY: 0.035, autoAlpha: 0, duration: 0.35, ease: "power3.in" });
  };

  const close = () => onClose();
  const minimize = () => animateToDock(onMinimize);

  const startDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (maximized || (event.target as HTMLElement).closest("button, .resize-handle")) return;
    const element = windowRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: bounds.left, top: bounds.top };
  };
  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setGeometry((current) => ({ ...current, left: drag.left + event.clientX - drag.x, top: drag.top + event.clientY - drag.y }));
  };
  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
    if (maximized) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const element = windowRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    resizeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, width: rect.width, height: rect.height, direction };
  };
  const moveResize = (event: React.PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - resize.x;
    const deltaY = event.clientY - resize.y;

    setGeometry((current) => {
      let newWidth = current.width;
      let newHeight = current.height;
      let newLeft = current.left;
      let newTop = current.top;

      const minWidth = 360;
      const minHeight = 260;

      // Handle horizontal resizing
      if (resize.direction.includes("e")) {
        newWidth = Math.max(minWidth, resize.width + deltaX);
      }
      if (resize.direction.includes("w")) {
        const proposedWidth = Math.max(minWidth, resize.width - deltaX);
        const widthDiff = current.width - proposedWidth;
        newWidth = proposedWidth;
        if (current.left !== null) {
          newLeft = current.left + widthDiff;
        }
      }

      // Handle vertical resizing
      if (resize.direction.includes("s")) {
        newHeight = Math.max(minHeight, resize.height + deltaY);
      }
      if (resize.direction.includes("n")) {
        const proposedHeight = Math.max(minHeight, resize.height - deltaY);
        const heightDiff = current.height - proposedHeight;
        newHeight = proposedHeight;
        if (current.top !== null) {
          newTop = current.top + heightDiff;
        }
      }

      return { ...current, width: newWidth, height: newHeight, left: newLeft, top: newTop };
    });
  };
  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const style = maximized
    ? undefined
    : { width: `min(${geometry.width}px, calc(100vw - 2rem))`, height: `min(${geometry.height}px, calc(100dvh - 7rem))`, left: geometry.left === null ? "50%" : `${geometry.left}px`, top: geometry.top === null ? "50%" : `${geometry.top}px`, transform: geometry.left === null ? "translate(-50%, -50%)" : "none" };

  // Terminal command functions
  const getCurDirName = () => {
    if (curDirPath.length === 0) return "~";
    return curDirPath[curDirPath.length - 1];
  };

  const getCurChildren = () => {
    let children = terminalFilesystem;
    for (const name of curDirPath) {
      const target = children.find((item) => item.title === name && item.type === "folder");
      if (!target || !target.children) return [];
      children = target.children;
    }
    return children;
  };

  const addOutput = (lines: string | string[]) => {
    const newLines = Array.isArray(lines) ? lines : [lines];
    setOutput((prev) => [...prev, ...newLines, ""]);
  };

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setInputId((prev) => prev + 1);
      return;
    }

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const [commandName, ...args] = trimmed.split(/\s+/);
    const arg = args[0];

    // Special case: rm -rf /
    if (trimmed.startsWith("rm -rf")) {
      setShowRain(true);
      addOutput([`${PROMPT}${trimmed}`, ""]);
      setCurrentInput("");
      setInputId((prev) => prev + 1);
      return;
    }

    switch (commandName) {
      case "help": {
        const helpText = `Available commands:
  help          Show this help message
  ls            List directory contents
  cd <dir>      Change directory
  cat <file>    Display file contents
  pwd           Print working directory
  clear         Clear terminal
  whoami        Display current user
  neofetch      System information
  rm -rf /      🤐 (easter egg)

Navigation:
  cd ..         Go up one directory
  cd ~          Return to home directory
  cd            Return to home directory`;
        addOutput([`${PROMPT}${trimmed}`, helpText]);
        break;
      }
      case "clear": {
        setOutput([WELCOME_MESSAGE]);
        break;
      }
      case "ls": {
        const children = getCurChildren();
        if (children.length === 0) {
          addOutput([`${PROMPT}${trimmed}`, "(empty)"]);
        } else {
          const items = children.map((item) => {
            const icon = item.type === "folder" ? "📁" : "📄";
            return `${icon}  ${item.title}`;
          });
          addOutput([`${PROMPT}${trimmed}`, ...items]);
        }
        break;
      }
      case "cd": {
        if (!arg || arg === "~" || arg === "/") {
          setCurChildren(terminalFilesystem);
          setCurDirPath([]);
          addOutput([`${PROMPT}${trimmed}`, ""]);
        } else if (arg === "..") {
          if (curDirPath.length > 0) {
            const newPath = [...curDirPath];
            newPath.pop();
            setCurDirPath(newPath);
            setCurChildren(getCurChildren());
          }
          addOutput([`${PROMPT}${trimmed}`, ""]);
        } else if (arg === ".") {
          addOutput([`${PROMPT}${trimmed}`, ""]);
        } else {
          const children = getCurChildren();
          const target = children.find((item) => item.title === arg && item.type === "folder");
          if (target && target.children) {
            setCurDirPath((prev) => [...prev, arg]);
            setCurChildren(target.children);
            addOutput([`${PROMPT}${trimmed}`, ""]);
          } else {
            addOutput([`${PROMPT}${trimmed}`, `cd: no such file or directory: ${arg}`]);
          }
        }
        break;
      }
      case "cat": {
        if (!arg) {
          addOutput([`${PROMPT}${trimmed}`, "cat: missing operand"]);
        } else {
          const children = getCurChildren();
          const file = children.find((item) => item.title === arg && item.type === "file");
          if (file) {
            addOutput([`${PROMPT}${trimmed}`, file.content || "(empty)"]);
          } else {
            addOutput([`${PROMPT}${trimmed}`, `cat: ${arg}: No such file or directory`]);
          }
        }
        break;
      }
      case "pwd": {
        const path = curDirPath.length === 0 ? "/home/adwaith" : `/home/adwaith/${curDirPath.join("/")}`;
        addOutput([`${PROMPT}${trimmed}`, path]);
        break;
      }
      case "whoami": {
        addOutput([`${PROMPT}${trimmed}`, "adwaith"]);
        break;
      }
      case "neofetch": {
        const uptime = getUptime();
        const neofetchOutput = `            .:-+o+/:\`            adwaith@macbook
         \`:+shdmNNNmy/\`         -----------------
       -/ymNMMMMMMMMMmy/-       OS: macOS Portfolio 1.0
     \`+ymNMMMMMMMMMMMMMmy+\`     Host: MacBook Pro (Simulated)
   \`/ymNMMMMMMMMMMMMMMMmy/\`   Kernel: Next.js 14 + React 18
  \`+ymNMMMMMMMMMMMMMMMMmy+\`  Uptime: ${uptime}
.symNMMMMMMMMMMMMMMMMMmys.   Shell: zsh (simulated)
/ymNMMMMMMMMMMMMMMMMMMMy/    Terminal: portfolio-terminal
+ymNMMMMMMMMMMMMMMMMMMMm+    CPU: Apple M2 (simulated)
/ymNMMMMMMMMMMMMMMMMMMMy/    Memory: 16GB (simulated)
.symNMMMMMMMMMMMMMMMMMmys.   GPU: Apple M2 (simulated)
  \`+ymNMMMMMMMMMMMMMMmy+\`   Resolution: 1920x1080
   \`/ymNMMMMMMMMMMMMMmy/\`    DE: Portfolio Desktop
     \`+ymNMMMMMMMMMmy+\`       WM: Custom React WM
       \`-/ymNMMMmy/-          Theme: macOS Tahoe
          \`/ymmy/\`            Icons: SF Symbols
            \`:/:\`             Font: SF Pro / Roboto Mono`;
        addOutput([`${PROMPT}${trimmed}`, neofetchOutput]);
        break;
      }
      case "date": {
        addOutput([`${PROMPT}${trimmed}`, new Date().toString()]);
        break;
      }
      case "echo": {
        addOutput([`${PROMPT}${trimmed}`, args.join(" ")]);
        break;
      }
      case "history": {
        const hist = history.map((h, i) => `  ${i + 1}  ${h}`).join("\n");
        addOutput([`${PROMPT}${trimmed}`, hist || "(empty)"]);
        break;
      }
      default: {
        addOutput([`${PROMPT}${trimmed}`, `zsh: command not found: ${commandName}`]);
      }
    }

    setCurrentInput("");
    setInputId((prev) => prev + 1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      executeCommand(currentInput);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    } else if (event.key === "Tab") {
      event.preventDefault();
      const input = currentInput.trim();
      if (input === "") return;

      const parts = input.split(" ");
      const cmd = parts[0];
      const arg = parts[1];

      let completed = input;

      if (!arg) {
        // Complete command
        const commands = ["help", "ls", "cd", "cat", "clear", "pwd", "whoami", "neofetch", "date", "echo", "history"];
        const match = commands.find((c) => c.startsWith(cmd));
        if (match) completed = match + " ";
      } else if (cmd === "cd" || cmd === "cat") {
        // Complete file/folder name
        const children = getCurChildren();
        const type = cmd === "cd" ? "folder" : "file";
        const match = children.find((item) => item.type === type && item.title.startsWith(arg));
        if (match) completed = `${cmd} ${match.title}`;
      }

      if (completed !== input) {
        setCurrentInput(completed);
      }
    } else if (event.key === "c" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      setCurrentInput("");
      addOutput([`${PROMPT}${currentInput}`, "^C"]);
      setInputId((prev) => prev + 1);
    }
  };

  const handleClick = () => {
    if (showRain) {
      setShowRain(false);
      return;
    }
    inputRef.current?.focus();
  };

  const getUptime = () => {
    const start = new Date("2025-01-01").getTime();
    const now = Date.now();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const PROMPT = `adwaith@macbook ${getCurDirName()} % `;

  return (
    <section
      ref={windowRef}
      className={`app-window${maximized ? " is-maximized" : ""}${minimized ? " is-minimized" : ""}`}
      style={style}
      aria-label="Terminal window"
      onClick={handleClick}
    >
      <header className="app-window-titlebar" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={(event) => { if (!(event.target as HTMLElement).closest("button, .resize-handle")) onToggleMaximize(); }}>
        <div className="app-window-controls">
          <button className="red" onClick={close} aria-label="Close" title="Close"><X size={8} /></button>
          <button className="yellow" onClick={minimize} aria-label="Minimize" title="Minimize"><Minimize2 size={8} /></button>
          <button className="green" onClick={onToggleMaximize} aria-label={maximized ? "Restore" : "Full screen"} title={maximized ? "Restore" : "Full screen"}><Maximize2 size={8} /></button>
        </div>
        <strong>Terminal</strong>
        <span className="app-window-spacer" />
      </header>
      <div className="terminal-window-body" ref={terminalRef}>
        {showRain && (
          <div className="terminal-rain-overlay" onClick={() => setShowRain(false)}>
            <canvas ref={canvasRef} className="terminal-rain-canvas" />
            <div className="terminal-rain-message">
              <div className="terminal-rain-emoji">{rainEmoji}</div>
              <div className="terminal-rain-text">HOW DARE YOU!</div>
              <div className="terminal-rain-hint">Click to go back</div>
            </div>
          </div>
        )}
        <div className="terminal-output" ref={outputRef}>
          {output.map((line, index) => (
            <div key={index} className="terminal-line">
              <span className="terminal-text">{line}</span>
            </div>
          ))}
        </div>
        <div className="terminal-input-line">
          <span className="terminal-prompt">{PROMPT}</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="Terminal command input"
            id={`terminal-input-${inputId}`}
          />
          <span className="terminal-cursor" aria-hidden="true">█</span>
        </div>
      </div>
      {!maximized && (
        <>
          {/* Corner resize handles */}
          <div className="resize-handle nw" onPointerDown={(e) => startResize(e, "nw")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize northwest" />
          <div className="resize-handle ne" onPointerDown={(e) => startResize(e, "ne")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize northeast" />
          <div className="resize-handle sw" onPointerDown={(e) => startResize(e, "sw")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize southwest" />
          <div className="resize-handle se" onPointerDown={(e) => startResize(e, "se")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize southeast" />
          {/* Edge resize handles */}
          <div className="resize-handle n" onPointerDown={(e) => startResize(e, "n")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize north" />
          <div className="resize-handle s" onPointerDown={(e) => startResize(e, "s")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize south" />
          <div className="resize-handle e" onPointerDown={(e) => startResize(e, "e")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize east" />
          <div className="resize-handle w" onPointerDown={(e) => startResize(e, "w")} onPointerMove={moveResize} onPointerUp={endResize} onPointerCancel={endResize} aria-label="Resize west" />
        </>
      )}
    </section>
  );
}