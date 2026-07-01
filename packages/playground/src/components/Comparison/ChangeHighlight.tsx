import { Plus, Minus, Edit2 } from 'lucide-react';

interface ChangeHighlightProps {
  type: 'added' | 'removed' | 'changed';
  items: string[];
  title: string;
}

export function ChangeHighlight({ type, items, title }: ChangeHighlightProps) {
  if (items.length === 0) return null;

  const iconMap = {
    added: <Plus size={14} />,
    removed: <Minus size={14} />,
    changed: <Edit2 size={14} />,
  };

  const classNameMap = {
    added: 'highlight-added',
    removed: 'highlight-removed',
    changed: 'highlight-changed',
  };

  return (
    <div className={`change-highlight ${classNameMap[type]}`}>
      <div className="highlight-header">
        {iconMap[type]}
        <span className="highlight-title">{title}</span>
        <span className="highlight-count">{items.length}</span>
      </div>
      <div className="highlight-items">
        {items.map((item) => (
          <div key={item} className="highlight-item">
            <code>{item}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
