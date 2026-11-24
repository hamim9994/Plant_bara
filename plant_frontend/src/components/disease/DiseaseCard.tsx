import { Link } from "react-router-dom";
import type { DiseaseEntry } from "../../lib/types";
import { cropFromClass, diseasePath, humanizeClass } from "../../lib/format";

interface DiseaseCardProps {
  disease: DiseaseEntry;
}

function cleanText(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim();
  return trimmed || fallback;
}

export function DiseaseCard({ disease }: DiseaseCardProps) {
  const cropLabel = cleanText(
    disease.crop && disease.crop.toLowerCase() !== "unknown"
      ? cropFromClass(disease.crop)
      : cropFromClass(disease.class_name),
    "Unknown crop",
  );
  const diseaseLabel = disease.is_healthy
    ? "Healthy leaf"
    : cleanText(
        disease.disease && disease.disease.toLowerCase() !== "unknown"
          ? humanizeClass(disease.disease)
          : humanizeClass(disease.class_name),
        "Field note",
      );
  const name = cleanText(disease.display_name, humanizeClass(disease.class_name));
  const symptoms = cleanText(
    disease.symptoms,
    disease.is_healthy
      ? "A reference leaf for healthy tissue."
      : "Field notes for this class are in preparation.",
  );

  return (
    <Link
      className="disease-card"
      to={diseasePath(disease.class_name)}
      aria-label={`Open ${disease.is_healthy ? "healthy leaf" : "disease"} field note: ${name}`}
    >
      <span className="disease-card__tag" aria-hidden="true">
        {disease.is_healthy ? "HEALTHY" : "FIELD NOTE"}
      </span>
      <span className="disease-card__content">
        <span className="disease-card__name">{name}</span>
        <span className="disease-card__meta">
          {cropLabel} <span className="disease-card__divider">/</span> {diseaseLabel}
        </span>
        <span className="disease-card__symptoms">{symptoms}</span>
      </span>
      <span className="disease-card__arrow" aria-hidden="true">
        ↗
      </span>
    </Link>
  );
}
