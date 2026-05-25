import { useRef, useEffect, type RefObject, type FocusEvent, type KeyboardEvent, type JSX } from 'react';

interface EditableProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  multiline?: boolean;
}

export function Editable({ value, onChange, className, as: Tag = 'span', multiline = false }: EditableProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  return (
    <Tag
      ref={ref as RefObject<HTMLSpanElement>}
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e: FocusEvent<HTMLElement>) => onChange(e.currentTarget.textContent?.trim() ?? '')}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
        if (e.key === 'Escape') { e.currentTarget.textContent = value; e.currentTarget.blur(); }
      }}
    />
  );
}
