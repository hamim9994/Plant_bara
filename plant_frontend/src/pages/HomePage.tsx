import "../styles/home.css";
import { Hero } from "../components/home/Hero";
import { ModelStats } from "../components/home/ModelStats";
import { ScanPanel } from "../components/home/ScanPanel";
import { HowItWorks } from "../components/home/HowItWorks";
import { FeaturedDiseases } from "../components/home/FeaturedDiseases";
import { FeatureList } from "../components/ui/FeatureList";
import { SectionHeading } from "../components/ui/SectionHeading";

export function HomePage() {
  return (
    <>
      <Hero />
      <ModelStats />

      <section className="home-scan-section">
        <div className="home-scan-section__inner">
          <div className="home-scan-section__intro">
            <SectionHeading
              eyebrow="ONE LEAF / ONE READING"
              title="Put a leaf under the lens"
              intro="Upload a clear photograph of a single leaf. The scan returns a ranked reading, with field notes for the crop, the symptoms and the next intervention."
              align="left"
            />
            <FeatureList
              items={[
                "One leaf photograph is enough to begin.",
                "Ranked alternatives, not an opaque verdict.",
                "Symptoms, treatment and prevention in plain language.",
              ]}
            />
          </div>
          <ScanPanel />
        </div>
      </section>

      <HowItWorks />
      <FeaturedDiseases />
    </>
  );
}
