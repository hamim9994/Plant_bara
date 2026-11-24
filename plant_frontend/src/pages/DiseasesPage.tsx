import { useMemo, useState } from "react";
import { useDiseases } from "../hooks/useDiseases";
import { cropFromClass } from "../lib/format";
import { DiseaseCard } from "../components/disease/DiseaseCard";
import { DiseaseFilters } from "../components/disease/DiseaseFilters";
import { SectionHeading } from "../components/ui/SectionHeading";
import { StatusNote } from "../components/ui/StatusNote";
import "../styles/diseases.css";

type LibraryMode = "all" | "diseased" | "healthy";

export function DiseasesPage() {
  const { diseases, loading, error } = useDiseases();
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("");
  const [mode, setMode] = useState<LibraryMode>("all");

  const crops = useMemo(() => {
    const keys = new Set<string>();
    diseases.forEach((entry) => {
      const key = (entry.crop ?? "").trim();
      if (key) {
        keys.add(key);
      }
    });
    return Array.from(keys).sort((a, b) => cropFromClass(a).localeCompare(cropFromClass(b)));
  }, [diseases]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return diseases.filter((entry) => {
      if (crop && entry.crop !== crop) {
        return false;
      }
      if (mode === "healthy" && !entry.is_healthy) {
        return false;
      }
      if (mode === "diseased" && entry.is_healthy) {
        return false;
      }
      if (!needle) {
        return true;
      }

      const haystack = [
        entry.display_name ?? "",
        entry.crop ?? "",
        entry.disease ?? "",
        entry.symptoms ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [diseases, query, crop, mode]);

  return (
    <div className="library">
      <div className="library__inner">
        <SectionHeading
          eyebrow="THE LIBRARY"
          title="A field guide to every leaf."
          intro="Thirty-eight crop-health classes, from healthy foliage to the disorders that resemble it. Search the notes, narrow by crop, then open a record to read the evidence."
          align="center"
          as="h1"
        />

        <DiseaseFilters
          query={query}
          onQueryChange={setQuery}
          crop={crop}
          onCropChange={setCrop}
          onlyHealthy={mode === "healthy"}
          onOnlyHealthyChange={(value) => setMode(value ? "healthy" : "all")}
          crops={crops}
          count={filtered.length}
          mode={mode}
          onModeChange={setMode}
        />

        {loading && <StatusNote kind="loading" message="Opening the field library…" />}
        {!loading && error && <StatusNote kind="error" message={error} />}
        {!loading && !error && filtered.length === 0 && (
          <StatusNote kind="empty" message="No field notes match those filters. Try another crop or search term." />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="library__grid">
            {filtered.map((disease) => (
              <DiseaseCard disease={disease} key={disease.class_name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

