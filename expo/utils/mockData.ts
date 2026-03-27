import { DailyEntry } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getRandomHRV(baseHRV: number, variance: number): number {
  const random = (Math.random() - 0.5) * 2 * variance;
  return Math.round(baseHRV + random);
}

export function generateMockHRVData(days: number = 90): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let baseHRV = 45;
  const sampleTags = [
    ['alcohol', 'late-bedtime'],
    ['heavy-lift'],
    ['hard-cardio'],
    ['rest-day', 'great-sleep'],
    ['poor-sleep', 'stressed'],
    ['sauna'],
    [],
    ['big-meal'],
    ['sick'],
    ['jet-lag', 'hotel'],
  ];
  
  const sampleNotes = [
    'Felt great today, good energy levels',
    'Rough night, couldn\'t sleep well',
    'Training was intense but felt strong',
    'Recovery day, took it easy',
    'Work stress affecting me',
    'Weekend vibes, relaxed day',
    '',
    'Early morning workout, felt sluggish',
    'Best sleep in weeks',
    'Traveling for work',
  ];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend && Math.random() > 0.7) {
      baseHRV -= 5;
    } else if (Math.random() > 0.8) {
      baseHRV += 3;
    }
    
    baseHRV = Math.max(25, Math.min(70, baseHRV));
    
    const hrvValue = Math.random() > 0.05 ? getRandomHRV(baseHRV, 8) : null;
    
    const tagIndex = Math.floor(Math.random() * sampleTags.length);
    const tags = Math.random() > 0.4 ? sampleTags[tagIndex] : [];
    
    if (tags.includes('alcohol') || tags.includes('sick')) {
      baseHRV -= 3;
    } else if (tags.includes('great-sleep') || tags.includes('rest-day')) {
      baseHRV += 2;
    }
    
    const noteIndex = Math.floor(Math.random() * sampleNotes.length);
    const note = Math.random() > 0.5 ? sampleNotes[noteIndex] : '';
    
    const entry: DailyEntry = {
      id: generateId(),
      date: formatDate(date),
      hrvValueMs: hrvValue,
      hrvSource: hrvValue ? 'Apple Watch' : null,
      note,
      tags,
      sleepHours: Math.random() > 0.3 ? Math.round((6 + Math.random() * 3) * 10) / 10 : null,
      trainingLoad: Math.random() > 0.5 ? Math.floor(Math.random() * 11) : null,
      alcohol: tags.includes('alcohol'),
      caffeineLate: tags.includes('late-caffeine'),
      illness: tags.includes('sick'),
      stress: Math.random() > 0.6 ? Math.floor(Math.random() * 11) : null,
      travel: tags.includes('jet-lag') || tags.includes('hotel'),
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
    
    entries.push(entry);
  }
  
  return entries;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
