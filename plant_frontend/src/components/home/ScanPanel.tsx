import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { GhostButton } from "../../components/ui/GhostButton";
import { StatusNote } from "../../components/ui/StatusNote";
import { usePrediction } from "../../hooks/usePrediction";

interface ScanPanelProps {
  prediction?: ReturnType<typeof usePrediction>;
}

const ALLOWED_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
];
const MAX_BYTES = 10 * 1024 * 1024;
const TOP_K_OPTIONS = [1, 3, 5, 10];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG, WEBP or BMP leaf image.";
  }
  if (file.size > MAX_BYTES) {
    return "That image is over 10 MiB. Choose a smaller leaf photograph.";
  }
  return null;
}

export function ScanPanel({ prediction }: ScanPanelProps = {}) {
  // Always call the hook to keep hook ordering stable; ScanPage supplies its
  // shared instance, while the unused local instance is harmless there.
  const localPrediction = usePrediction();
  const active = prediction ?? localPrediction;
  const { loading, error, previewUrl, select, submit, reset } = active;

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [topK, setTopK] = useState(3);

  const displayedError = validationError ?? error;

  function acceptFile(candidate: File | undefined): void {
    if (!candidate) return;
    const problem = validateFile(candidate);
    if (problem) {
      setValidationError(problem);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setValidationError(null);
    setFile(candidate);
    select(candidate);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    acceptFile(event.target.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  function handleReset(): void {
    reset();
    setFile(null);
    setValidationError(null);
    setTopK(3);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSubmit(): void {
    if (!file || loading) return;
    void submit(file, topK);
  }

  return (
    <div className="home-scan">
      <p className="home-scan__instructions">
        Photograph one leaf in even light, then upload the image. The model compares its
        visual signature against 38 crop-health classes and returns a ranked reading in
        seconds.
      </p>

      <div
        className={`home-scan__dropzone${dragging ? " home-scan__dropzone--active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          id="home-scan-file"
          ref={inputRef}
          className="home-scan__file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp"
          onChange={handleInputChange}
        />
        <p className="home-scan__drop-hint">DROP A LEAF IMAGE OR</p>
        <label className="home-scan__pick" htmlFor="home-scan-file">
          CHOOSE A LEAF IMAGE
        </label>
        <p className="home-scan__file-rules">JPG, PNG, WEBP OR BMP · MAX 10 MiB</p>
      </div>

      {file && (
        <div className="home-scan__selected">
          {previewUrl && (
            <img className="home-scan__preview" src={previewUrl} alt="Selected leaf preview" />
          )}
          <div className="home-scan__file-meta">
            <p className="home-scan__filename">{file.name}</p>
            <p className="home-scan__filesize">{formatSize(file.size)}</p>
          </div>
        </div>
      )}

      <div className="home-scan__controls">
        <label className="home-scan__topk" htmlFor="home-scan-topk">
          <span className="home-scan__field-label">ALTERNATIVES TO SHOW</span>
          <select
            id="home-scan-topk"
            className="home-scan__select"
            value={topK}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => setTopK(Number(event.target.value))}
          >
            {TOP_K_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="home-scan__actions">
          <GhostButton type="button" onClick={handleSubmit} disabled={loading || !file}>
            ANALYZE LEAF
          </GhostButton>
          <GhostButton type="button" onClick={handleReset} disabled={loading}>
            RESET
          </GhostButton>
        </div>
      </div>

      {loading && (
        <StatusNote kind="loading" message="Reading the leaf — model inference in progress…" />
      )}
      {!loading && displayedError && <StatusNote kind="error" message={displayedError} />}
    </div>
  );
}
