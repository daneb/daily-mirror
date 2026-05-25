export type Priority = 'critical' | 'important' | 'steady';
export type Status = 'open' | 'done' | 'archived';

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  weight: 1 | 2 | 3 | 4;
  done: boolean;
  created: number;
  touched: number;
}

export interface HistoryEntry {
  id: string;
  name: string;
  completed: number;
  priority: Priority;
}

export interface Habit {
  id: string;
  name: string;
}

export type Completion = Record<string, Record<string, boolean>>;

export interface BacklogItem {
  id: string;
  text: string;
  status: Status;
  added: number;
  statusChanged?: number;
}

export interface Tweaks {
  palette: [string, string, string, string, string];
  layout: 'grid' | 'soft' | 'list';
  habitStyle: 'circle' | 'fill' | 'underline';
}
