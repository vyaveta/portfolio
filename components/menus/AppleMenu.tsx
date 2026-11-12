"use client";

import { Info, Power, RotateCw, Settings, Moon, LockKeyhole, LogOut } from "lucide-react";
import { MenuDivider, MenuItem, MenuItemGroup, MenuPopover } from "@/components/menus/base";

type AppleMenuProps = {
  onClose: () => void;
  onAbout: () => void;
  onOpenApp: (id: string) => void;
  onPower: (action: "sleep" | "restart" | "shutdown") => void;
  onLock: () => void;
  onForceQuit: () => void;
};

export default function AppleMenu({ onClose, onAbout, onOpenApp, onPower, onLock, onForceQuit }: AppleMenuProps) {
  const run = (action: () => void) => { onClose(); action(); };
  return (
    <MenuPopover className="apple-menu">
      <MenuItemGroup>
        <MenuItem onClick={() => run(onAbout)}><Info size={14} />About This Mac</MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(() => onOpenApp("system-settings"))}><Settings size={14} />System Settings…</MenuItem>
        <MenuItem onClick={() => run(() => onOpenApp("app-store"))}>App Store…</MenuItem>
        <MenuItem disabled>Recent Items <span aria-hidden="true">›</span></MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(onForceQuit)} shortcut="⌥⌘⎋">Force Quit…</MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(() => onPower("sleep"))}><Moon size={14} />Sleep</MenuItem>
        <MenuItem onClick={() => run(() => onPower("restart"))}><RotateCw size={14} />Restart…</MenuItem>
        <MenuItem onClick={() => run(() => onPower("shutdown"))}><Power size={14} />Shut Down…</MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(onLock)} shortcut="⌃⌘Q"><LockKeyhole size={14} />Lock Screen</MenuItem>
        <MenuItem onClick={() => run(onLock)} shortcut="⇧⌘Q"><LogOut size={14} />Log Out Adwaith…</MenuItem>
      </MenuItemGroup>
    </MenuPopover>
  );
}
