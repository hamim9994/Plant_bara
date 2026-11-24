import { Link } from "react-router-dom";
import { BRAND } from "../../lib/assets";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <p className="site-footer__name">{BRAND.name}</p>
          <p className="site-footer__tagline">{BRAND.tagline}</p>
        </div>

        <nav className="site-footer__column" aria-label="Site links">
          <h2 className="site-footer__column-title">EXPLORE</h2>
          <ul className="site-footer__list">
            <li>
              <Link className="site-footer__link" to="/scan">
                SCAN
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/diseases">
                LIBRARY
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/about">
                FIELD NOTES
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="site-footer__column" aria-label="Developer links">
          <h2 className="site-footer__column-title">DEVELOPERS</h2>
          <ul className="site-footer__list">
            <li>
              <a
                className="site-footer__link"
                href="https://plant-bara.onrender.com/docs"
                target="_blank"
                rel="noreferrer"
                aria-label="Plant BARA API documentation (opens in a new tab)"
              >
                API DOCS
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="site-footer__bottom">
        <span>
          © {currentYear} {BRAND.name}
        </span>
        <span>FIELD INTELLIGENCE FOR EVERY LEAF</span>
      </div>
    </footer>
  );
}

export default Footer;
