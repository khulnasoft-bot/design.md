interface TypographyShowcaseProps {
  typography?: Record<string, unknown>;
  search: string;
}

export function TypographyShowcase({ typography, search }: TypographyShowcaseProps) {
  if (!typography || typeof typography !== 'object') {
    return <div className="empty-state">No typography defined</div>;
  }

  const filtered = Object.entries(typography).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="typography-showcase">
      {filtered.map(([name, value]) => {
        const typoValue = value as Record<string, unknown>;
        return (
          <div key={name} className="typography-item">
            <div className="typography-preview" style={typoValue as React.CSSProperties}>
              The quick brown fox jumps over the lazy dog
            </div>
            <div className="typography-details">
              <code>{name}</code>
              <pre>{JSON.stringify(typoValue, null, 2)}</pre>
            </div>
          </div>
        );
      })}
    </div>
  );
}
