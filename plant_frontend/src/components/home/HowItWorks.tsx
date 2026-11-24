import { IMAGES } from "../../lib/assets";
import { SectionHeading } from "../../components/ui/SectionHeading";

interface Step {
  number: string;
  title: string;
  copy: string;
  withImage?: boolean;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "CAPTURE",
    copy: "Hold the leaf in diffuse daylight and photograph the whole blade. One clear frame gives the model the detail it needs.",
  },
  {
    number: "02",
    title: "COMPARE",
    copy: "The model measures the image against 38 labelled crop-health classes, then ranks the closest candidates instead of issuing a bare verdict.",
    withImage: true,
  },
  {
    number: "03",
    title: "ACT",
    copy: "Open the field note for symptoms, treatment and prevention. Read the evidence, then take a measured next step in the crop.",
  },
];

export function HowItWorks() {
  return (
    <section className="home-how">
      <div className="home-how__inner">
        <SectionHeading
          eyebrow="FIELD METHOD / 01—03"
          title="From photograph to field note"
          intro="Three quiet steps turn a leaf in the field into evidence you can act on."
          align="center"
        />

        <ol className="home-how__list">
          {STEPS.map((step) => (
            <li
              className={`home-how__row${step.withImage ? " home-how__row--split" : ""}`}
              key={step.number}
            >
              <div className="home-how__row-copy">
                <p className="home-how__number">{step.number}</p>
                <h3 className="home-how__title">{step.title}</h3>
                <p className="home-how__body">{step.copy}</p>
              </div>
              {step.withImage && (
                <div className="home-how__media">
                  <img
                    className="home-how__image"
                    src={IMAGES.process}
                    alt="Rows of plants growing under greenhouse glass"
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
