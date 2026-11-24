/** Normalize raw class fragments: underscores to spaces, tidy parentheses. */
function tidyLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\(\s*([^)]*?)\s*\)/g, (_match: string, inner: string) => `(${inner.trim()})`)
    .replace(/\s*\(\s*/g, " (")
    .replace(/\s+/g, " ")
    .trim();
}

/** Display a 0–1 model score (or an already-scaled percentage) with one decimal. */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const scaled = Math.abs(value) <= 1 ? value * 100 : value;
  const rounded = Math.round(scaled * 10) / 10;
  return `${(Object.is(rounded, -0) ? 0 : rounded).toFixed(1)}%`;
}

/** Display a processing duration in whole milliseconds. */
export function formatMs(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${Math.round(value)} ms`;
}

/** Derive the crop label from a raw model class name. */
export function cropFromClass(className: string): string {
  const crop = className.split("___", 1)[0] ?? "";
  return tidyLabel(crop) || "Unknown";
}

/** URL-safe path for a disease detail page. */
export function diseasePath(className: string): string {
  return `/diseases/${encodeURIComponent(className)}`;
}

/** Fallback, human-readable name when the API does not supply a display name. */
export function humanizeClass(className: string): string {
  const parts = className
    .split("___")
    .map((part) => tidyLabel(part))
    .filter((part) => part.length > 0);

  return parts.length > 0 ? parts.join(" — ") : "Unknown";
}
