import { BRAND, IMAGES } from "../../lib/assets";
import { GhostButton } from "../../components/ui/GhostButton";

export function Hero() {
  return (
    <section
      className="home-hero"
      style={{ backgroundImage: `url(${IMAGES.hero})` }}
      aria-label="Plant Bara field intelligence"
    >
      <div className="home-hero__inner">
        <div className="home-hero__top">
          <p className="home-hero__wordmark">{BRAND.name}</p>
          <p className="home-hero__caption">
            FIELD INTELLIGENCE / CROP HEALTH /{" "}
            <span className="home-hero__caption-tail">38 CLASSES</span>
          </p>
        </div>

        <div className="home-hero__bottom">
          <div className="home-hero__intro-block">
            <h1 className="home-hero__intro">{BRAND.tagline}</h1>
            <p className="home-hero__description">{BRAND.description}</p>
          </div>
          <GhostButton to="/scan" className="ghost-button--on-photo">
            SCAN A LEAF
          </GhostButton>
        </div>
      </div>
    </section>
  );
}
