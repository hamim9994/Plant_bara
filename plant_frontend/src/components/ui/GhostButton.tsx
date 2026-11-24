import "../../styles/ui.css";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

export interface GhostButtonProps {
  children: ReactNode;
  to?: string;
  href?: string;
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  arrow?: boolean;
}

export function GhostButton({
  children,
  to,
  href,
  onClick,
  type = "button",
  disabled = false,
  className,
  arrow = true,
}: GhostButtonProps) {
  const classes = ["ghost-button", className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className="ghost-button__label">{children}</span>
      {arrow ? (
        <span className="ghost-button__arrow" aria-hidden="true">
          →
        </span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} aria-disabled={disabled || undefined}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} aria-disabled={disabled || undefined}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {content}
    </button>
  );
}

export default GhostButton;
