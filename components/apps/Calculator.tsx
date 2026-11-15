"use client";

import { useRef, useState, useEffect, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { motion } from "framer-motion";

gsap.registerPlugin(useGSAP);

type CalculatorMode = "basic" | "scientific" | "programmer";

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operator: string | null;
  waitingForOperand: boolean;
  memory: number;
  history: CalculationHistory[];
}

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

const initialState: CalculatorState = {
  display: "0",
  previousValue: null,
  operator: null,
  waitingForOperand: false,
  memory: 0,
  history: [],
};

const STORAGE_KEY = "macos-portfolio-calculator";

const loadHistory = (): CalculationHistory[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history: CalculationHistory[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-100)));
};

type CalculatorWindowProps = {
  minimized: boolean;
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

export default function CalculatorWindow({
  minimized: _minimized,
  maximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: CalculatorWindowProps) {
  const windowRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    originX: number;
    originY: number;
  } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const closingRef = useRef(false);
  const minimizingRef = useRef(false);

  const [mode, setMode] = useState<CalculatorMode>("basic");
  const [state, setState] = useState<CalculatorState>(() => ({
    ...initialState,
    history: loadHistory(),
  }));
  const [showHistory, setShowHistory] = useState(false);
  const [angleMode, setAngleMode] = useState<"deg" | "rad">("deg");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (state.history.length > 0) saveHistory(state.history);
  }, [state.history]);

  useGSAP(() => {
    if (!windowRef.current) return;
    gsap.fromTo(
      windowRef.current,
      { autoAlpha: 0, scale: 0.94, y: 16 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" }
    );
  }, { scope: windowRef });

  // ── Window controls ───────────────────────────────────────────────────────
  const closeWindow = () => {
    if (!windowRef.current || closingRef.current || minimizingRef.current) return;
    closingRef.current = true;
    onClose();
  };

  const minimizeWindow = () => {
    const el = windowRef.current;
    const dock = document.querySelector<HTMLElement>('[data-app-id="calculator"]');
    if (!el || minimizingRef.current || closingRef.current) return;
    minimizingRef.current = true;

    if (!dock) {
      onMinimize();
      return;
    }

    const w = el.getBoundingClientRect();
    const d = dock.getBoundingClientRect();
    gsap.to(el, {
      autoAlpha: 0,
      scale: 0.12,
      x: d.left + d.width / 2 - (w.left + w.width / 2),
      y: d.top + d.height / 2 - (w.top + w.height / 2),
      duration: 0.3,
      ease: "power2.in",
      onComplete: onMinimize,
    });
  };

  const startDrag = (e: PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const el = windowRef.current;
    if (!el) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      originX: Number(gsap.getProperty(el, "x")),
      originY: Number(gsap.getProperty(el, "y")),
    };
  };

  const moveDrag = (e: PointerEvent<HTMLElement>) => {
    const d = dragRef.current;
    const el = windowRef.current;
    if (!d || d.pointerId !== e.pointerId || !el) return;
    gsap.set(el, {
      x: d.originX + e.clientX - d.x,
      y: d.originY + e.clientY - d.y,
    });
  };

  const endDrag = (e: PointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const startResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (maximized) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const el = windowRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    resizeRef.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      width: r.width,
      height: r.height,
    };
  };

  const moveResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    const w = Math.max(300, r.width + e.clientX - r.x);
    const h = Math.max(460, r.height + e.clientY - r.y);
    if (windowRef.current) gsap.set(windowRef.current, { width: w, height: h });
  };

  const endResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (resizeRef.current?.pointerId !== e.pointerId) return;
    resizeRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // ── Calculator logic ──────────────────────────────────────────────────────
  const formatDisplay = (value: number): string => {
    if (!isFinite(value)) return "Error";
    const str = value.toString();
    if (str.length > 12) {
      if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-6 && value !== 0)) {
        return value.toExponential(6);
      }
      return parseFloat(value.toPrecision(12)).toString();
    }
    return str;
  };

  const performCalculation = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : NaN;
      case "%": return a % b;
      case "^": return Math.pow(a, b);
      default: return b;
    }
  };

  const addToHistory = (expression: string, result: string) => {
    const now = Date.now();
    setState((prev) => ({
      ...prev,
      history: [
        ...prev.history,
        { id: `calc-${now}`, expression, result, timestamp: now },
      ].slice(-100),
    }));
  };

  const handleNumber = (num: string) => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return { ...prev, display: num === "." ? "0." : num, waitingForOperand: false };
      }
      if (num === "." && prev.display.includes(".")) return prev;
      if (prev.display === "0" && num !== ".") return { ...prev, display: num };
      if (prev.display.length >= 12 && num !== ".") return prev;
      return { ...prev, display: prev.display + num };
    });
  };

  const handleOperator = (next: string) => {
    setState((prev) => {
      const input = parseFloat(prev.display);
      if (prev.operator && !prev.waitingForOperand) {
        const result = performCalculation(prev.previousValue!, input, prev.operator);
        if (!isFinite(result)) {
          return { ...prev, display: "Error", previousValue: null, operator: null, waitingForOperand: true };
        }
        addToHistory(
          `${formatDisplay(prev.previousValue!)} ${prev.operator} ${formatDisplay(input)}`,
          formatDisplay(result)
        );
        return {
          ...prev,
          display: formatDisplay(result),
          previousValue: result,
          operator: next,
          waitingForOperand: true,
        };
      }
      return { ...prev, previousValue: input, operator: next, waitingForOperand: true };
    });
  };

  const handleEquals = () => {
    setState((prev) => {
      if (!prev.operator || prev.waitingForOperand) return prev;
      const input = parseFloat(prev.display);
      const result = performCalculation(prev.previousValue!, input, prev.operator);
      if (!isFinite(result)) {
        return { ...prev, display: "Error", previousValue: null, operator: null, waitingForOperand: true };
      }
      addToHistory(
        `${formatDisplay(prev.previousValue!)} ${prev.operator} ${formatDisplay(input)}`,
        formatDisplay(result)
      );
      return {
        ...prev,
        display: formatDisplay(result),
        previousValue: null,
        operator: null,
        waitingForOperand: true,
      };
    });
  };

  const handleAllClear = () => {
    setState((prev) => ({
      ...prev,
      display: "0",
      previousValue: null,
      operator: null,
      waitingForOperand: false,
      memory: 0,
    }));
  };

  const handleSignChange = () => {
    setState((prev) => {
      if (prev.display === "0") return prev;
      return { ...prev, display: formatDisplay(parseFloat(prev.display) * -1) };
    });
  };

  const handlePercent = () => {
    setState((prev) => ({
      ...prev,
      display: formatDisplay(parseFloat(prev.display) / 100),
    }));
  };

  const factorial = (n: number): number => {
    if (n < 0 || n !== Math.floor(n) || n > 170) return NaN;
    if (n === 0) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const handleScientific = (fn: string) => {
    setState((prev) => {
      const value = parseFloat(prev.display);
      let result: number;
      const expr = `${fn}(${formatDisplay(value)})`;

      switch (fn) {
        case "sin":
          result = angleMode === "deg" ? Math.sin((value * Math.PI) / 180) : Math.sin(value);
          break;
        case "cos":
          result = angleMode === "deg" ? Math.cos((value * Math.PI) / 180) : Math.cos(value);
          break;
        case "tan":
          result = angleMode === "deg" ? Math.tan((value * Math.PI) / 180) : Math.tan(value);
          break;
        case "sin⁻¹":
          result = angleMode === "deg" ? (Math.asin(value) * 180) / Math.PI : Math.asin(value);
          break;
        case "cos⁻¹":
          result = angleMode === "deg" ? (Math.acos(value) * 180) / Math.PI : Math.acos(value);
          break;
        case "tan⁻¹":
          result = angleMode === "deg" ? (Math.atan(value) * 180) / Math.PI : Math.atan(value);
          break;
        case "log": result = Math.log10(value); break;
        case "ln": result = Math.log(value); break;
        case "√": result = Math.sqrt(value); break;
        case "x²": result = value * value; break;
        case "x³": result = value * value * value; break;
        case "xʸ":
          return { ...prev, previousValue: value, operator: "^", waitingForOperand: true };
        case "10ˣ": result = Math.pow(10, value); break;
        case "eˣ": result = Math.exp(value); break;
        case "1/x": result = 1 / value; break;
        case "π": result = Math.PI; break;
        case "e": result = Math.E; break;
        case "x!": result = factorial(value); break;
        case "|x|": result = Math.abs(value); break;
        case "RAND": result = Math.random(); break;
        default: return prev;
      }

      if (!isFinite(result)) {
        return { ...prev, display: "Error", waitingForOperand: true };
      }
      addToHistory(expr, formatDisplay(result));
      return { ...prev, display: formatDisplay(result), waitingForOperand: true };
    });
  };

  // Memory
  const handleMemoryClear = () => setState((p) => ({ ...p, memory: 0 }));
  const handleMemoryRecall = () =>
    setState((p) => ({ ...p, display: formatDisplay(p.memory), waitingForOperand: true }));
  const handleMemoryAdd = () =>
    setState((p) => ({ ...p, memory: p.memory + parseFloat(p.display) }));
  const handleMemorySubtract = () =>
    setState((p) => ({ ...p, memory: p.memory - parseFloat(p.display) }));
  const handleMemoryStore = () =>
    setState((p) => ({ ...p, memory: parseFloat(p.display) }));

  const clearHistory = () => {
    setState((p) => ({ ...p, history: [] }));
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleHistoryResult = (result: string) => {
    setState((p) => ({ ...p, display: result, waitingForOperand: true }));
    setShowHistory(false);
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key;
      if (k >= "0" && k <= "9") handleNumber(k);
      else if (k === ".") handleNumber(".");
      else if (k === "+") handleOperator("+");
      else if (k === "-") handleOperator("-");
      else if (k === "*") handleOperator("×");
      else if (k === "/") handleOperator("÷");
      else if (k === "%") handlePercent();
      else if (k === "Enter" || k === "=") handleEquals();
      else if (k === "Escape") handleAllClear();
      else if (k === "Backspace") {
        setState((prev) => {
          if (prev.waitingForOperand || prev.display === "Error") return prev;
          return {
            ...prev,
            display: prev.display.length > 1 ? prev.display.slice(0, -1) : "0",
          };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [angleMode]);

  // ── Layout sizes ──────────────────────────────────────────────────────────
  const sizeStyle = maximized || isMobile
    ? { width: "100%", height: "100%", left: 0, top: 0, transform: "none", borderRadius: 0 }
    : {
        width: mode === "basic" ? 380 : mode === "scientific" ? 520 : 540,
        height: mode === "basic" ? 540 : 620,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };

  // ── Button style helper (real macOS colors) ───────────────────────────────
  const btn = (label: string) => {
    // Light gray function keys
    if (["AC", "C", "⌫", "±", "%", "MC", "MR", "M+", "M-", "MS", "2nd"].includes(label)) {
      return { bg: "#5c5c5e", color: "#fff", weight: 400 };
    }
    // Orange operators
    if (["÷", "×", "-", "+", "="].includes(label)) {
      return { bg: "#ff9f0a", color: "#fff", weight: 500 };
    }
    // Scientific / programmer keys
    if (
      [
        "sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "log", "ln", "√",
        "x²", "x³", "xʸ", "1/x", "10ˣ", "eˣ", "π", "e", "x!", "|x|", "RAND",
        "(", ")", "AND", "OR", "XOR", "NOT", "LSH", "RSH", "ROTR", "ROTL",
        "Hex", "Dec", "Oct", "Bin", "A", "B", "C", "D", "E", "F",
      ].includes(label)
    ) {
      return { bg: "#3a3a3c", color: "#fff", weight: 400 };
    }
    // Numbers
    return { bg: "#333335", color: "#fff", weight: 300 };
  };

  // ── Render a single button ────────────────────────────────────────────────
  const CalcBtn = ({
    label,
    span = 1,
    tall = false,
  }: {
    label: string;
    span?: number;
    tall?: boolean;
  }) => {
    const style = btn(label);

    const onClick = () => {
      if (/^[0-9A-F.]$/.test(label)) handleNumber(label);
      else if (["÷", "×", "-", "+"].includes(label)) handleOperator(label);
      else if (label === "=") handleEquals();
      else if (label === "AC" || label === "C") handleAllClear();
      else if (label === "⌫") {
        setState((prev) => {
          if (prev.waitingForOperand || prev.display === "Error") return prev;
          return {
            ...prev,
            display: prev.display.length > 1 ? prev.display.slice(0, -1) : "0",
          };
        });
      } else if (label === "±") handleSignChange();
      else if (label === "%") handlePercent();
      else if (label === "MC") handleMemoryClear();
      else if (label === "MR") handleMemoryRecall();
      else if (label === "M+") handleMemoryAdd();
      else if (label === "M-") handleMemorySubtract();
      else if (label === "MS") handleMemoryStore();
      else handleScientific(label);
    };

    return (
      <motion.button
        whileTap={{ scale: 0.93, opacity: 0.85 }}
        onClick={onClick}
        style={{
          gridColumn: `span ${span}`,
          gridRow: tall ? "span 2" : "span 1",
          height: tall ? "auto" : 56,
          minHeight: tall ? 116 : 56,
          borderRadius: tall || span > 1 ? 28 : "50%",
          border: "none",
          background: style.bg,
          color: style.color,
          fontSize: mode === "basic" ? 22 : 15,
          fontWeight: style.weight,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: span > 1 ? "flex-start" : "center",
          paddingLeft: span > 1 ? 24 : 0,
          cursor: "pointer",
          outline: "none",
          userSelect: "none",
        }}
      >
        {label}
      </motion.button>
    );
  };

  // ── Keypad layouts (stable grids) ─────────────────────────────────────────
  const BasicKeypad = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        padding: 14,
      }}
    >
      <CalcBtn label="AC" />
      <CalcBtn label="±" />
      <CalcBtn label="%" />
      <CalcBtn label="÷" />

      <CalcBtn label="7" />
      <CalcBtn label="8" />
      <CalcBtn label="9" />
      <CalcBtn label="×" />

      <CalcBtn label="4" />
      <CalcBtn label="5" />
      <CalcBtn label="6" />
      <CalcBtn label="-" />

      <CalcBtn label="1" />
      <CalcBtn label="2" />
      <CalcBtn label="3" />
      <CalcBtn label="+" />

      <CalcBtn label="0" span={2} />
      <CalcBtn label="." />
      <CalcBtn label="=" />
    </div>
  );

  const ScientificKeypad = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        padding: 12,
      }}
    >
      {/* Row 1 */}
      <CalcBtn label="(" />
      <CalcBtn label=")" />
      <CalcBtn label="mc" />
      <CalcBtn label="m+" />
      <CalcBtn label="m-" />

      {/* Row 2 */}
      <CalcBtn label="2nd" />
      <CalcBtn label="x²" />
      <CalcBtn label="x³" />
      <CalcBtn label="xʸ" />
      <CalcBtn label="÷" />

      {/* Row 3 */}
      <CalcBtn label="1/x" />
      <CalcBtn label="√" />
      <CalcBtn label="sin" />
      <CalcBtn label="cos" />
      <CalcBtn label="×" />

      {/* Row 4 */}
      <CalcBtn label="ln" />
      <CalcBtn label="log" />
      <CalcBtn label="tan" />
      <CalcBtn label="π" />
      <CalcBtn label="-" />

      {/* Row 5 */}
      <CalcBtn label="eˣ" />
      <CalcBtn label="10ˣ" />
      <CalcBtn label="x!" />
      <CalcBtn label="e" />
      <CalcBtn label="+" />

      {/* Numbers + equals */}
      <CalcBtn label="7" />
      <CalcBtn label="8" />
      <CalcBtn label="9" />
      <CalcBtn label="%" />
      <CalcBtn label="=" tall />

      <CalcBtn label="4" />
      <CalcBtn label="5" />
      <CalcBtn label="6" />
      <CalcBtn label="±" />

      <CalcBtn label="1" />
      <CalcBtn label="2" />
      <CalcBtn label="3" />
      <CalcBtn label="RAND" />

      <CalcBtn label="0" span={2} />
      <CalcBtn label="." />
      <CalcBtn label="C" />
    </div>
  );

  const ProgrammerKeypad = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        padding: 12,
      }}
    >
      <CalcBtn label="Hex" />
      <CalcBtn label="Dec" />
      <CalcBtn label="Oct" />
      <CalcBtn label="Bin" />
      <CalcBtn label="C" />

      <CalcBtn label="AND" />
      <CalcBtn label="OR" />
      <CalcBtn label="XOR" />
      <CalcBtn label="NOT" />
      <CalcBtn label="÷" />

      <CalcBtn label="LSH" />
      <CalcBtn label="RSH" />
      <CalcBtn label="ROTL" />
      <CalcBtn label="ROTR" />
      <CalcBtn label="×" />

      <CalcBtn label="A" />
      <CalcBtn label="B" />
      <CalcBtn label="C" />
      <CalcBtn label="D" />
      <CalcBtn label="-" />

      <CalcBtn label="E" />
      <CalcBtn label="F" />
      <CalcBtn label="(" />
      <CalcBtn label=")" />
      <CalcBtn label="+" />

      <CalcBtn label="7" />
      <CalcBtn label="8" />
      <CalcBtn label="9" />
      <CalcBtn label="%" />
      <CalcBtn label="=" tall />

      <CalcBtn label="4" />
      <CalcBtn label="5" />
      <CalcBtn label="6" />
      <CalcBtn label="±" />

      <CalcBtn label="1" />
      <CalcBtn label="2" />
      <CalcBtn label="3" />
      <CalcBtn label="MS" />

      <CalcBtn label="0" span={2} />
      <CalcBtn label="." />
      <CalcBtn label="MR" />
    </div>
  );

  return (
    <section
      ref={windowRef}
      style={{
        position: "fixed",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#1c1c1e",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: maximized || isMobile ? 0 : 14,
        boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
        ...sizeStyle,
      }}
      aria-label="Calculator"
    >
      {/* Titlebar */}
      <header
        style={{
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          cursor: "grab",
          userSelect: "none",
        }}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) onToggleMaximize();
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={closeWindow}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", border: "none", cursor: "pointer" }}
          />
          <button
            onClick={minimizeWindow}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", border: "none", cursor: "pointer" }}
          />
          <button
            onClick={onToggleMaximize}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", border: "none", cursor: "pointer" }}
          />
        </div>

        {/* Mode tabs */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: 2,
          }}
        >
          {/* {(["basic", "scientific", "programmer"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 500,
                borderRadius: 6,
                border: "none",
                background: mode === m ? "rgba(255,255,255,0.18)" : "transparent",
                color: mode === m ? "#fff" : "#999",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {m}
            </button>
          ))} */}
        </div>

        <div style={{ width: 52 }} />
      </header>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* History sidebar */}
        {showHistory && state.history.length > 0 && (
          <aside
            style={{
              width: isMobile ? "100%" : 170,
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              maxHeight: isMobile ? 160 : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                fontSize: 12,
                color: "#aaa",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span>History</span>
              <button
                onClick={clearHistory}
                style={{ background: "none", border: "none", color: "#777", fontSize: 11, cursor: "pointer" }}
              >
                Clear
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 6 }}>
              {state.history
                .slice()
                .reverse()
                .map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleHistoryResult(h.result)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: "none",
                      background: "transparent",
                      color: "#999",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ color: "#666" }}>{h.expression}</div>
                    <div style={{ color: "#60a5fa", marginTop: 2 }}>= {h.result}</div>
                  </button>
                ))}
            </div>
          </aside>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Display */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              padding: "18px 20px 10px",
              background: "rgba(0,0,0,0.25)",
              minHeight: 90,
            }}
          >
            <motion.div
              key={state.display}
              initial={{ opacity: 0.5, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              style={{
                width: "100%",
                textAlign: "right",
                color: "#fff",
                fontSize: state.display.length > 9 ? 34 : 52,
                fontWeight: 200,
                letterSpacing: "-1.5px",
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              }}
            >
              {state.display}
            </motion.div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                marginTop: 6,
                fontSize: 11,
                color: "#777",
              }}
            >
              {state.operator && state.previousValue !== null && (
                <span style={{ flex: 1, textAlign: "right" }}>
                  {formatDisplay(state.previousValue)} {state.operator}
                </span>
              )}
              {state.memory !== 0 && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "rgba(96,165,250,0.2)",
                    color: "#93c5fd",
                    fontSize: 10,
                  }}
                >
                  M
                </span>
              )}
              {mode === "scientific" && (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.1)",
                    color: "#bbb",
                    fontSize: 10,
                  }}
                >
                  {angleMode.toUpperCase()}
                </span>
              )}
              <button
                onClick={() => setShowHistory((v) => !v)}
                style={{
                  marginLeft: "auto",
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: "#777",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Angle toggle */}
          {mode === "scientific" && (
            <div style={{ display: "flex", gap: 6, padding: "0 14px 8px" }}>
              {(["deg", "rad"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAngleMode(a)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    fontSize: 11,
                    fontWeight: 500,
                    borderRadius: 6,
                    border: "none",
                    background: angleMode === a ? "#ff9f0a" : "rgba(255,255,255,0.08)",
                    color: "#fff",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* Keypad */}
          <div style={{ background: "#1c1c1e" }}>
            {mode === "basic" && <BasicKeypad />}
            {mode === "scientific" && <ScientificKeypad />}
            {mode === "programmer" && <ProgrammerKeypad />}
          </div>
        </div>
      </div>

      {/* Resize handle */}
      {!maximized && !isMobile && (
        <button
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            cursor: "nwse-resize",
            background: "transparent",
            border: "none",
          }}
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        />
      )}
    </section>
  );
}