import "../../styles/layout.css";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useHealth } from "../../hooks/useHealth";
import type { HealthResponse } from "../../lib/types";
import { BRAND } from "../../lib/assets";
import { GhostButton } from "../ui/GhostButton";

const NAV_ITEMS = [
  { label: "SCAN", to: "/scan" },
  { label: "LIBRARY", to: "/diseases" },
  { label: "FIELD NOTES", to: "/about" },
] as const;

function isModelLive(health: HealthResponse | null): boolean {
  return health?.model_loaded === true;
}

export function Header() {
  const location = useLocation();
  const { health } = useHealth();
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 24);
  const live = isModelLive(health);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [location.pathname]);

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <div className="site-header__inner">
        <nav className="site-header__nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="site-header__link"
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/" className="site-header__brand" aria-label={`${BRAND.name} — home`}>
          {BRAND.short}
        </Link>

        <div className="site-header__actions">
          <span
            className={`site-header__status ${live ? "site-header__status--live" : "site-header__status--offline"}`}
            role="status"
            aria-label={live ? "Model status: live" : "Model status: offline"}
          >
            <span className="site-header__status-dot" aria-hidden="true" />
            <span className="site-header__status-text">{live ? "LIVE" : "OFFLINE"}</span>
          </span>

          <Link to="/diseases" className="site-header__search" aria-label="Search the disease library">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
          </Link>

          <span className="site-header__cta">
            <GhostButton to="/scan">SCAN A LEAF</GhostButton>
          </span>
        </div>
      </div>
    </header>
  );
}

export default Header;
