"use client";

import { useEffect, useRef } from "react";
import { MenuDivider, MenuItem, MenuItemGroup, MenuPopover } from "@/components/menus/base";

type ContextMenuProps = { x: number; y: number; show: boolean; onClose: () => void; onOpenApp: (id: string) => void };

export default function ContextMenu({ x, y, show, onClose, onOpenApp }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!show) return;
    const closeOnOutside = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) onClose(); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOnOutside); window.removeEventListener("keydown", closeOnEscape); };
  }, [show, onClose]);
  if (!show) return null;
  return (
    <MenuPopover className="desktop-context-menu" style={{ left: `min(${x}px, calc(100vw - 250px))`, top: `min(${y}px, calc(100dvh - 280px))` }}>
      <div ref={ref}>
        <MenuItemGroup>
          <MenuItem disabled>New Folder</MenuItem>
          <MenuItem disabled>Get Info</MenuItem>
          <MenuItem onClick={() => { onOpenApp("system-settings"); onClose(); }}>Change Desktop Background…</MenuItem>
        </MenuItemGroup>
        <MenuDivider />
        <MenuItemGroup>
          <MenuItem disabled>Use Stacks</MenuItem>
          <MenuItem disabled>Sort By</MenuItem>
          <MenuItem disabled>Clean Up</MenuItem>
          <MenuItem disabled>Show View Options</MenuItem>
        </MenuItemGroup>
      </div>
    </MenuPopover>
  );
}
