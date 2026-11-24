import { useDiseases } from "../../hooks/useDiseases";
import type { DiseaseEntry } from "../../lib/types";
import { DiseaseCard } from "../disease/DiseaseCard";
import { GhostButton } from "../../components/ui/GhostButton";
import { SectionHeading } from "../../components/ui/SectionHeading";
import { StatusNote } from "../../components/ui/StatusNote";

function pickFeatured(diseases: DiseaseEntry[]): DiseaseEntry[] {
  const picked: DiseaseEntry[] = [];
  const add = (entry: DiseaseEntry | undefined): void => {
    if (!entry || picked.length >= 3) return;
    if (picked.some((current) => current.class_name === entry.class_name)) return;
    picked.push(entry);
  };

  add(diseases.find((entry) => entry.is_healthy));
  diseases.filter((entry) => !entry.is_healthy).forEach(add);
  diseases.forEach(add);

  return picked.slice(0, 3);
}

export function FeaturedDiseases() {
  const { diseases, loading, error } = useDiseases();
  const featured = pickFeatured(diseases);

  return (
    <section className="home-featured">
      <div className="home-featured__inner">
        <SectionHeading
          eyebrow="THE LIBRARY"
          title="FROM THE FIELD LIBRARY"
          intro="A working reference of crop classes — healthy leaves and the disorders that resemble them."
          align="center"
        />

        {loading && <StatusNote kind="loading" message="Opening the field library…" />}
        {error && <StatusNote kind="error" message={error} />}
        {!loading && !error && featured.length === 0 && (
          <StatusNote kind="empty" message="No field notes are available right now." />
        )}

        {featured.length > 0 && (
          <div className="home-featured__grid">
            {featured.map((disease) => (
              <DiseaseCard disease={disease} key={disease.class_name} />
            ))}
          </div>
        )}

        <div className="home-featured__action">
          <GhostButton to="/diseases">BROWSE ALL 38 CLASSES</GhostButton>
        </div>
      </div>
    </section>
  );
}
