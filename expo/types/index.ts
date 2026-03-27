export interface DailyEntry {
  id: string;
  date: string;
  hrvValueMs: number | null;
  hrvSource: string | null;
  note: string;
  tags: string[];
  sleepHours: number | null;
  trainingLoad: number | null;
  alcohol: boolean;
  caffeineLate: boolean;
  illness: boolean;
  stress: number | null;
  travel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TagPreset {
  id: string;
  name: string;
  category: 'Sleep' | 'Training' | 'Lifestyle' | 'Health' | 'Travel';
  emoji: string;
}

export interface UserSettings {
  defaultRange: 7 | 30 | 90;
  useMedianDailyHRV: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
  showSleep: boolean;
  showRHR: boolean;
  showWorkouts: boolean;
  hasSeenOnboarding: boolean;
}

export interface HRVInsight {
  type: 'highest' | 'lowest' | 'comparison' | 'correlation';
  title: string;
  value: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
}

export type TimeRange = 7 | 30 | 90;
