export interface FeatureListProps {
  items: string[];
}

export function FeatureList({ items }: FeatureListProps) {
  return (
    <ul className="feature-list">
      {items.map((item, index) => (
        <li className="feature-list__item" key={`${index}-${item}`}>
          <span className="feature-list__mark" aria-hidden="true">
            √
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default FeatureList;
