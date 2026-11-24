import type { PredictResponse } from "../../lib/types";
import { cropFromClass, diseasePath, formatMs, formatPercent, humanizeClass } from "../../lib/format";
import { GhostButton } from "../../components/ui/GhostButton";
import { ConfidenceMeter } from "../../components/ui/ConfidenceMeter";
import { InfoBlock } from "../../components/ui/InfoBlock";

interface ResultPanelProps {
  result: PredictResponse;
}

const NO_GUIDANCE = "No guidance recorded for this class.";

function guidanceText(text: string): string {
  return text && text.trim() ? text : NO_GUIDANCE;
}

export function ResultPanel({ result }: ResultPanelProps) {
  const { prediction, alternatives, model, processing_time_ms: processingTimeMs } = result;
  const architecture =
    typeof model.architecture === "string" && model.architecture.trim()
      ? model.architecture
      : "MobileNetV2";

  return (
    <article
      className={`home-result${prediction.is_healthy ? " home-result--healthy" : ""}`}
      aria-live="polite"
    >
      <p className="home-result__tag">{prediction.is_healthy ? "HEALTHY" : "DISEASE DETECTED"}</p>

      <h2 className="home-result__title">{prediction.display_name}</h2>
      <p className="home-result__labels">
        <span>{cropFromClass(prediction.crop)}</span>
        <span aria-hidden="true"> / </span>
        <span>{humanizeClass(prediction.disease)}</span>
      </p>

      <ConfidenceMeter value={prediction.confidence} label="MODEL CONFIDENCE" />

      <div className="home-result__guidance">
        <InfoBlock label="SYMPTOMS">
          <p>{guidanceText(prediction.symptoms)}</p>
        </InfoBlock>
        <InfoBlock label="TREATMENT">
          <p>{guidanceText(prediction.treatment)}</p>
        </InfoBlock>
        <InfoBlock label="PREVENTION">
          <p>{guidanceText(prediction.prevention)}</p>
        </InfoBlock>
      </div>

      {alternatives.length > 0 && (
        <div className="home-result__alternatives">
          <p className="home-result__section-label">OTHER CANDIDATES</p>
          <ul className="home-result__alternative-list">
            {alternatives.map((item) => (
              <li className="home-result__alternative" key={item.class_name}>
                <span>{item.display_name}</span>
                <span className="home-result__confidence">{formatPercent(item.confidence)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="home-result__footer">
        <p className="home-result__meta">
          {architecture} · {formatMs(processingTimeMs)}
        </p>
        <GhostButton to={diseasePath(prediction.class_name)}>READ THE FIELD NOTE</GhostButton>
      </footer>
    </article>
  );
}
