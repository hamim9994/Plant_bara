import { usePrediction } from "../hooks/usePrediction";
import { SectionHeading } from "../components/ui/SectionHeading";
import { ScanPanel } from "../components/home/ScanPanel";
import { ResultPanel } from "../components/home/ResultPanel";

export function ScanPage() {
  const prediction = usePrediction();

  return (
    <section className="home-scan-page">
      <div className="home-scan-page__inner">
        <SectionHeading
          eyebrow="FIELD DIAGNOSTICS"
          title="Scan a leaf"
          intro="One clear photograph, one measured reading. Upload a leaf and the model will rank its closest crop-health classes."
          align="center"
          as="h1"
        />

        <div className="home-scan-page__split">
          <ScanPanel prediction={prediction} />
          <div className="home-scan-page__result">
            {prediction.result ? (
              <ResultPanel result={prediction.result} />
            ) : (
              <div className="home-scan-page__placeholder">
                <p className="home-scan-page__placeholder-label">AWAITING SPECIMEN</p>
                <p className="home-scan-page__placeholder-copy">
                  The reading will appear here — class name, confidence, and the field note
                  for symptoms, treatment and prevention. Nothing is stored; the photograph
                  is used only for this scan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
