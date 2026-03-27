import { TagPreset } from '@/types';

export const TAG_PRESETS: TagPreset[] = [
  { id: 'poor-sleep', name: 'Poor sleep', category: 'Sleep', emoji: '😴' },
  { id: 'great-sleep', name: 'Great sleep', category: 'Sleep', emoji: '🌟' },
  { id: 'late-bedtime', name: 'Late bedtime', category: 'Sleep', emoji: '🌙' },
  
  { id: 'heavy-lift', name: 'Heavy lift', category: 'Training', emoji: '🏋️' },
  { id: 'hard-cardio', name: 'Hard cardio', category: 'Training', emoji: '🏃' },
  { id: 'rest-day', name: 'Rest day', category: 'Training', emoji: '🧘' },
  { id: 'deload', name: 'Deload', category: 'Training', emoji: '📉' },
  
  { id: 'alcohol', name: 'Alcohol', category: 'Lifestyle', emoji: '🍷' },
  { id: 'late-caffeine', name: 'Late caffeine', category: 'Lifestyle', emoji: '☕' },
  { id: 'big-meal', name: 'Big meal', category: 'Lifestyle', emoji: '🍽️' },
  { id: 'sauna', name: 'Sauna', category: 'Lifestyle', emoji: '🧖' },
  
  { id: 'sick', name: 'Sick', category: 'Health', emoji: '🤒' },
  { id: 'sore', name: 'Sore', category: 'Health', emoji: '💪' },
  { id: 'stressed', name: 'Stressed', category: 'Health', emoji: '😰' },
  
  { id: 'jet-lag', name: 'Jet lag', category: 'Travel', emoji: '✈️' },
  { id: 'hotel', name: 'Hotel', category: 'Travel', emoji: '🏨' },
  { id: 'timezone-shift', name: 'Time zone shift', category: 'Travel', emoji: '🌍' },
];

export const TAG_CATEGORIES = ['Sleep', 'Training', 'Lifestyle', 'Health', 'Travel'] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Sleep: '#8B5CF6',
  Training: '#F97316',
  Lifestyle: '#EC4899',
  Health: '#10B981',
  Travel: '#3B82F6',
};
