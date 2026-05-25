import { useRef, useEffect, type RefObject } from 'react';

type EditableTag = 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  as?: EditableTag;
  multiline?: boolean;
}

export function Editable({ value, onChange, className, as: Tag = 'span', multiline = false }: EditableProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  // Cast to a concrete element so TypeScript resolves a single known prop set
  // instead of the enormous union produced by keyof JSX.IntrinsicElements.
  // At runtime the correct tag is still rendered.
  const El = Tag as 'span';

  return (
    <El
      ref={ref as RefObject<HTMLSpanElement>}
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e) => onChange(e.currentTarget.textContent?.trim() ?? '')}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { e.currentTarget.textContent = value; e.currentTarget.blur(); }
      }}
    />
  );
}
