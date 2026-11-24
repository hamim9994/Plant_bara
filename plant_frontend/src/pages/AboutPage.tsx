import { useModelInfo } from "../hooks/useModelInfo";
import { BRAND, IMAGES } from "../lib/assets";
import { formatPercent } from "../lib/format";
import { FeatureList } from "../components/ui/FeatureList";
import { GhostButton } from "../components/ui/GhostButton";
import { SectionHeading } from "../components/ui/SectionHeading";
import { StatusNote } from "../components/ui/StatusNote";

function displayValue(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return "—";
}

export function AboutPage() {
  const { info, loading, error } = useModelInfo();

  const stats = [
    {
      label: "TEST ACCURACY",
      value: typeof info?.test_accuracy === "number" ? formatPercent(info.test_accuracy) : "—",
    },
    { label: "CLASSES", value: displayValue(info?.num_classes) },
    { label: "ARCHITECTURE", value: displayValue(info?.architecture) },
    { label: "TRAINED ON", value: displayValue(info?.trained_on) },
    { label: "DATE TRAINED", value: displayValue(info?.date_trained) },
    { label: "TENSORFLOW", value: displayValue(info?.tf_version) },
  ];

  return (
    <div className="about">
      <section
        className="about-band"
        style={{ backgroundImage: `url("${IMAGES.about}")` }}
        aria-label="Field notes"
      >
        <div className="about-band__inner">
          <p className="about-band__wordmark">FIELD NOTES</p>
        </div>
      </section>

      <div className="about__inner">
        <div className="about__editorial">
          <SectionHeading
            eyebrow="ABOUT PLANT BARA"
            title="Evidence before action."
            intro="An apothecary of crop health, built around one leaf and one careful reading."
            align="center"
            as="h1"
          />
          <div className="about__mission">
            <p>{BRAND.description}</p>
            <p>
              Photograph a leaf, read the evidence in front of you, then act. Plant BARA keeps the
              field note close to the photograph: symptoms, treatment and prevention are set out in
              plain language so that a reading becomes a decision you can explain. {BRAND.tagline}
            </p>
          </div>
        </div>

        <section className="about__method">
          <div className="about__method-intro">
            <p className="about__section-label">THE METHOD</p>
            <h2 className="about__section-title">Four quiet steps.</h2>
          </div>
          <FeatureList
            items={[
              "CAPTURE — photograph one leaf in even light, with the whole blade in frame.",
              "COMPARE — read the field note and match it against the visible symptoms.",
              "ACT — choose the recorded treatment or prevention step when the evidence agrees.",
              "RECHECK — photograph the same plant again and watch for change.",
            ]}
          />
        </section>

        {loading && <StatusNote kind="loading" message="Reading the model record…" />}
        {!loading && error && <StatusNote kind="error" message={error} />}

        <section className="about__stats" aria-label="Model information">
          {stats.map((stat) => (
            <div className="about__stat" key={stat.label}>
              <p className="about__stat-label">{stat.label}</p>
              <p className="about__stat-value">{stat.value}</p>
            </div>
          ))}
        </section>

        <div className="about__cta">
          <GhostButton to="/scan">SCAN A LEAF</GhostButton>
        </div>
      </div>
    </div>
  );
}

