import type { ReactNode } from "react";

export interface InfoBlockProps {
  label: string;
  children: ReactNode;
}

export function InfoBlock({ label, children }: InfoBlockProps) {
  return (
    <section className="info-block">
      <h3 className="info-block__label">{label}</h3>
      <div className="info-block__content">{children}</div>
    </section>
  );
}

export default InfoBlock;
