import { cropFromClass } from "../../lib/format";

export type DiseaseFilterMode = "all" | "diseased" | "healthy";

export interface DiseaseFiltersProps {
  query: string;
  onQueryChange: (v: string) => void;
  crop: string;
  onCropChange: (v: string) => void;
  onlyHealthy: boolean;
  onOnlyHealthyChange: (v: boolean) => void;
  crops: string[];
  count: number;
  mode?: DiseaseFilterMode;
  onModeChange?: (m: DiseaseFilterMode) => void;
}

const MODES: Array<{ value: DiseaseFilterMode; label: string }> = [
  { value: "all", label: "ALL" },
  { value: "diseased", label: "DISEASED" },
  { value: "healthy", label: "HEALTHY" },
];

export function DiseaseFilters({
  query,
  onQueryChange,
  crop,
  onCropChange,
  onlyHealthy,
  onOnlyHealthyChange,
  crops,
  count,
  mode,
  onModeChange,
}: DiseaseFiltersProps) {
  const activeMode: DiseaseFilterMode = mode ?? (onlyHealthy ? "healthy" : "all");

  const selectMode = (next: DiseaseFilterMode): void => {
    if (onModeChange) {
      onModeChange(next);
      return;
    }
    onOnlyHealthyChange(next === "healthy");
  };

  return (
    <div className="disease-filters">
      <div className="disease-filters__controls">
        <label className="disease-filters__search">
          <span className="disease-filters__label">SEARCH THE LIBRARY</span>
          <input
            className="disease-filters__input"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Crop, disease or symptom"
          />
        </label>

        <div className="disease-filters__segment" role="group" aria-label="Health status">
          {MODES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`disease-filters__segment-button${
                activeMode === option.value ? " is-active" : ""
              }`}
              aria-pressed={activeMode === option.value}
              onClick={() => selectMode(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="disease-filters__crops" role="group" aria-label="Filter by crop">
        <button
          type="button"
          className={`disease-filters__pill${crop === "" ? " is-active" : ""}`}
          aria-pressed={crop === ""}
          onClick={() => onCropChange("")}
        >
          ALL CROPS
        </button>
        {crops.map((key) => (
          <button
            key={key}
            type="button"
            className={`disease-filters__pill${crop === key ? " is-active" : ""}`}
            aria-pressed={crop === key}
            onClick={() => onCropChange(key)}
          >
            {cropFromClass(key)}
          </button>
        ))}
      </div>

      <p className="disease-filters__count" role="status" aria-live="polite">
        {count} {count === 1 ? "RESULT" : "RESULTS"}
      </p>
    </div>
  );
}
