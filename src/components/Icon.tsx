import type { CSSProperties } from 'react';

interface IconProps {
  name: string;
  size?: number;
}

export function Icon({ name, size = 16 }: IconProps) {
  const s: CSSProperties = { width: size, height: size, display: 'inline-block', verticalAlign: 'middle' };
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'compass':
      return <svg style={s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" {...stroke}/><path d="M11 5 L8.7 8.7 L5 11 L7.3 7.3 Z" {...stroke}/></svg>;
    case 'leaf':
      return <svg style={s} viewBox="0 0 16 16"><path d="M3 13 C 3 6, 8 3, 13 3 C 13 8, 10 13, 3 13 Z" {...stroke}/><path d="M3 13 L 9 7" {...stroke}/></svg>;
    case 'book':
      return <svg style={s} viewBox="0 0 16 16"><path d="M3 3 H 12 V 13 H 3 Z" {...stroke}/><path d="M3 3 V 13" {...stroke}/></svg>;
    case 'clock':
      return <svg style={s} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" {...stroke}/><path d="M8 5 V 8 L 10 9.5" {...stroke}/></svg>;
    case 'plus':
      return <svg style={s} viewBox="0 0 16 16"><path d="M8 4 V 12 M 4 8 H 12" {...stroke}/></svg>;
    case 'x':
      return <svg style={s} viewBox="0 0 16 16"><path d="M5 5 L 11 11 M 11 5 L 5 11" {...stroke}/></svg>;
    case 'archive':
      return <svg style={s} viewBox="0 0 16 16"><path d="M2.5 4 H 13.5 V 6 H 2.5 Z M 3.5 6 V 13 H 12.5 V 6 M 6.5 9 H 9.5" {...stroke}/></svg>;
    case 'search':
      return <svg style={s} viewBox="0 0 16 16"><circle cx="7" cy="7" r="4" {...stroke}/><path d="M 10 10 L 13 13" {...stroke}/></svg>;
    case 'feather':
      return <svg style={s} viewBox="0 0 16 16"><path d="M13 3 C 8 3, 3 8, 3 13 L 5 13 C 5 9, 9 5, 13 5 Z M 3 13 L 7 9" {...stroke}/></svg>;
    default:
      return null;
  }
}
