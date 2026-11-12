import type { MouseEvent, ReactNode } from "react";

type MenuItemProps = {
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  shortcut?: string;
  disabled?: boolean;
};

export function MenuItem({ children, onClick, shortcut, disabled = false }: MenuItemProps) {
  return (
    <li>
      <button className="mac-menu-item" onClick={onClick} disabled={disabled}>
        <span>{children}</span>
        {shortcut && <small>{shortcut}</small>}
      </button>
    </li>
  );
}

export function MenuItemGroup({ children }: { children: ReactNode }) {
  return <ul className="mac-menu-group">{children}</ul>;
}

export function MenuPopover({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`mac-menu-popover ${className}`} style={style}>{children}</div>;
}

export function MenuDivider() {
  return <div className="mac-menu-divider" role="separator" />;
}
