import type { ReactNode } from "react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: string;
  align?: "center" | "left";
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, intro, align = "center", as = "h2" }: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
      {as === "h1" ? (
        <h1 className="section-heading__title">{title}</h1>
      ) : (
        <h2 className="section-heading__title">{title}</h2>
      )}
      {intro ? <p className="section-heading__intro">{intro}</p> : null}
    </header>
  );
}

export default SectionHeading;
