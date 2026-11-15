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
        <MenuItem onClick={() => run(onAbout)}>
          <div className="flex items-center gap-2">
            <Info size={14} />About This Mac
          </div>
        </MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(() => onOpenApp("system-settings"))}>
          <div className="flex items-center gap-2">
            <Settings size={14} />System Settings
          </div>
        </MenuItem>
        <MenuItem onClick={() => run(() => onOpenApp("app-store"))}>App Store…</MenuItem>
        <MenuItem disabled>Recent Items <span aria-hidden="true">›</span></MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(onForceQuit)} shortcut="⌥⌘⎋">Force Quit…</MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(() => onPower("sleep"))}>
          <div className="flex items-center gap-2">
            <Moon size={14} />Sleep
          </div>
        </MenuItem>
        <MenuItem onClick={() => run(() => onPower("restart"))}>
          <div className="flex items-center gap-2">
            <RotateCw size={14} />Restart
          </div>
        </MenuItem>
        <MenuItem onClick={() => run(() => onPower("shutdown"))}>
          <div className="flex items-center gap-2">
            <Power size={14} />Shut Down
          </div>
        </MenuItem>
      </MenuItemGroup>
      <MenuDivider />
      <MenuItemGroup>
        <MenuItem onClick={() => run(onLock)} shortcut="⌃⌘Q">
          <div className="flex items-center gap-2">
            <LockKeyhole size={14} />Lock Screen
          </div>
        </MenuItem>
        <MenuItem onClick={() => run(onLock)} shortcut="⇧⌘Q">
          <div className="flex items-center gap-2">
            <LogOut size={14} />Log Out Adwaith
          </div>
        </MenuItem>
      </MenuItemGroup>
    </MenuPopover>
  );
}
