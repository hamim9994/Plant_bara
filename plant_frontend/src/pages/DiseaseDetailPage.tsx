import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDiseaseDetail } from "../hooks/useDiseaseDetail";
import { useDiseases } from "../hooks/useDiseases";
import { IMAGES } from "../lib/assets";
import { cropFromClass, diseasePath, humanizeClass } from "../lib/format";
import { GhostButton } from "../components/ui/GhostButton";
import { InfoBlock } from "../components/ui/InfoBlock";
import { StatusNote } from "../components/ui/StatusNote";

function decodeClassName(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function cleanText(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim();
  return trimmed || fallback;
}

export function DiseaseDetailPage() {
  const params = useParams();
  const className = decodeClassName(params.className);
  const { disease, loading, error } = useDiseaseDetail(className);
  const { diseases } = useDiseases();

  const cropLabel = disease
    ? cleanText(
        disease.crop && disease.crop.toLowerCase() !== "unknown"
          ? cropFromClass(disease.crop)
          : cropFromClass(disease.class_name),
        "Unknown crop",
      )
    : "";
  const diseaseLabel = disease
    ? cleanText(
        disease.disease && disease.disease.toLowerCase() !== "unknown"
          ? humanizeClass(disease.disease)
          : humanizeClass(disease.class_name),
        "field note",
      )
    : "";

  const related = useMemo(() => {
    if (!disease) {
      return [];
    }
    const thisCrop = cropFromClass(disease.crop || disease.class_name);
    return diseases
      .filter(
        (entry) =>
          entry.class_name !== disease.class_name &&
          cropFromClass(entry.crop || entry.class_name) === thisCrop,
      )
      .slice(0, 3);
  }, [disease, diseases]);

  return (
    <div className="detail">
      <div className="detail__inner">
        {loading ? (
          <StatusNote kind="loading" message="Opening the field note…" />
        ) : error ? (
          <StatusNote kind="error" message={error} />
        ) : !disease ? (
          <StatusNote kind="empty" message="CLASS NOT FOUND" />
        ) : (
          <>
            <header className="detail__header">
              <span className="detail__tag" aria-hidden="true">
                {disease.is_healthy ? "HEALTHY" : "DISEASE DETECTED"}
              </span>
              <p className="detail__eyebrow">
                {cropLabel} <span aria-hidden="true">/</span> FIELD NOTE
              </p>
              <h1 className="detail__title">
                {cleanText(disease.display_name, humanizeClass(disease.class_name))}
              </h1>
              <p className="detail__intro">
                {disease.is_healthy
                  ? `A reference record for healthy ${cropLabel.toLowerCase()} foliage. Compare its colour, texture and growth before deciding that a leaf is diseased.`
                  : `${diseaseLabel} is a ${cropLabel.toLowerCase()} class in the Plant BARA field library. Read the symptoms below, compare them with the leaf in front of you, then choose the recorded treatment or prevention step.`}
              </p>
            </header>

            <div className="detail__blocks">
              <InfoBlock label="SYMPTOMS">
                {cleanText(
                  disease.symptoms,
                  disease.is_healthy
                    ? "No disorder symptoms are recorded for this healthy reference leaf."
                    : "Symptom notes are not yet recorded for this class.",
                )}
              </InfoBlock>
              <InfoBlock label="TREATMENT">
                {cleanText(
                  disease.treatment,
                  disease.is_healthy
                    ? "No treatment is required for a healthy leaf."
                    : "Treatment notes are not yet recorded for this class.",
                )}
              </InfoBlock>
              <InfoBlock label="PREVENTION">
                {cleanText(
                  disease.prevention,
                  disease.is_healthy
                    ? "Keep good growing records and inspect new growth regularly."
                    : "Prevention notes are not yet recorded for this class.",
                )}
              </InfoBlock>
            </div>

            <section className="detail__split">
              <div className="detail__copy">
                <p className="detail__section-label">READ THE EVIDENCE</p>
                <h2 className="detail__section-title">A closer look.</h2>
                <p className="detail__copy-text">
                  One clear photograph can bring a symptom into focus. Compare what you see with
                  this field note, then scan another leaf if the evidence is still uncertain.
                </p>
                <div className="detail__actions">
                  <GhostButton to="/diseases">BACK TO LIBRARY</GhostButton>
                  <GhostButton to="/scan">SCAN A LEAF</GhostButton>
                </div>
              </div>
              <div className="detail__photo">
                <img src={IMAGES.hero} alt="Close-up of a crop leaf in the field" />
              </div>
            </section>

            <section className="detail__related">
              <p className="detail__section-label">RELATED FIELD NOTES</p>
              {related.length > 0 ? (
                <ul className="detail__related-list">
                  {related.map((entry) => (
                    <li key={entry.class_name}>
                      <Link className="detail__related-link" to={diseasePath(entry.class_name)}>
                        <span>{cleanText(entry.display_name, humanizeClass(entry.class_name))}</span>
                        <span className="detail__related-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="detail__related-empty">
                  <p className="detail__copy-text">
                    No other notes for this crop are in the library yet.
                  </p>
                  <GhostButton to="/diseases">BROWSE THE LIBRARY</GhostButton>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

