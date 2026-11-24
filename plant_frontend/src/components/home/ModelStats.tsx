import { useModelInfo } from "../../hooks/useModelInfo";
import { formatPercent } from "../../lib/format";
import { StatusNote } from "../../components/ui/StatusNote";

export function ModelStats() {
  const { info, loading, error } = useModelInfo();

  const stats = [
    {
      value: formatPercent(info?.test_accuracy ?? 0.9749),
      label: "VALIDATED ACCURACY",
      isText: false,
    },
    {
      value: String(info?.num_classes ?? 38),
      label: "DISEASE CLASSES",
      isText: false,
    },
    {
      value: info?.architecture ?? "MobileNetV2",
      label: "ARCHITECTURE",
      isText: true,
    },
  ];

  const sourceParts = [info?.trained_on, info?.date_trained].filter(
    (part): part is string => typeof part === "string" && part.trim().length > 0,
  );
  const isReference = !info || Boolean(error);

  return (
    <section className="home-stats" aria-label="Model reference figures">
      <div className="home-stats__inner">
        {loading && <StatusNote kind="loading" message="Reading model metadata…" />}
        {error && <StatusNote kind="error" message={error} />}

        <div className="home-stats__grid">
          {stats.map((stat) => (
            <div className="home-stats__item" key={stat.label}>
              <p className={`home-stats__value${stat.isText ? " home-stats__value--text" : ""}`}>
                {stat.value}
              </p>
              <p className="home-stats__label">{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="home-stats__source">
          {isReference
            ? "REFERENCE VALUES · LIVE MODEL METADATA UNAVAILABLE"
            : sourceParts.length > 0
              ? `SOURCE / ${sourceParts.join(" · ")}`
              : "SOURCE / TRAINED MODEL METADATA"}
        </p>
      </div>
    </section>
  );
}
