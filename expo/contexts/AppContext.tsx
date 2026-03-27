import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { DailyEntry, UserSettings, TimeRange } from '@/types';
import { generateMockHRVData, calculateMedian, calculateAverage } from '@/utils/mockData';

const ENTRIES_KEY = 'hrv_entries';
const SETTINGS_KEY = 'hrv_settings';

const DEFAULT_SETTINGS: UserSettings = {
  defaultRange: 30,
  useMedianDailyHRV: true,
  reminderEnabled: false,
  reminderTime: '20:00',
  showSleep: true,
  showRHR: false,
  showWorkouts: false,
  hasSeenOnboarding: false,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [selectedRange, setSelectedRange] = useState<TimeRange>(30);

  const entriesQuery = useQuery({
    queryKey: ['entries'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ENTRIES_KEY);
      if (stored) {
        return JSON.parse(stored) as DailyEntry[];
      }
      const mockData = generateMockHRVData(90);
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(mockData));
      return mockData;
    },
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored) as UserSettings;
      }
      return DEFAULT_SETTINGS;
    },
  });

  const { mutate: saveEntries } = useMutation({
    mutationFn: async (entries: DailyEntry[]) => {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
      return entries;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['entries'], data);
    },
  });

  const { mutate: saveSettings } = useMutation({
    mutationFn: async (settings: UserSettings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
    },
  });

  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const settings = useMemo(() => settingsQuery.data ?? DEFAULT_SETTINGS, [settingsQuery.data]);

  const updateEntry = useCallback((updatedEntry: DailyEntry) => {
    const entryExists = entries.some(e => e.date === updatedEntry.date);
    let newEntries: DailyEntry[];
    
    if (entryExists) {
      newEntries = entries.map(e => 
        e.date === updatedEntry.date ? { ...updatedEntry, updatedAt: new Date().toISOString() } : e
      );
    } else {
      newEntries = [...entries, { ...updatedEntry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    }
    saveEntries(newEntries);
  }, [entries, saveEntries]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    saveSettings({ ...settings, ...newSettings });
  }, [settings, saveSettings]);

  const getEntryByDate = useCallback((date: string): DailyEntry | undefined => {
    return entries.find(e => e.date === date);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - selectedRange);
    
    return entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= cutoff && entryDate <= now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, selectedRange]);

  const hrvValues = useMemo(() => {
    return filteredEntries
      .filter(e => e.hrvValueMs !== null)
      .map(e => e.hrvValueMs as number);
  }, [filteredEntries]);

  const currentAverage = useMemo(() => {
    return settings.useMedianDailyHRV 
      ? calculateMedian(hrvValues) 
      : calculateAverage(hrvValues);
  }, [hrvValues, settings.useMedianDailyHRV]);

  const refreshData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['entries'] });
  }, [queryClient]);

  return {
    entries,
    filteredEntries,
    settings,
    selectedRange,
    setSelectedRange,
    updateEntry,
    updateSettings,
    getEntryByDate,
    currentAverage,
    hrvValues,
    refreshData,
    isLoading: entriesQuery.isLoading || settingsQuery.isLoading,
  };
});

export function useHRVInsights() {
  const { filteredEntries, hrvValues, settings } = useApp();

  return useMemo(() => {
    if (hrvValues.length < 3) return [];

    const insights = [];
    const validEntries = filteredEntries.filter(e => e.hrvValueMs !== null);
    
    if (validEntries.length > 0) {
      const highest = validEntries.reduce((max, e) => 
        (e.hrvValueMs ?? 0) > (max.hrvValueMs ?? 0) ? e : max
      );
      const lowest = validEntries.reduce((min, e) => 
        (e.hrvValueMs ?? Infinity) < (min.hrvValueMs ?? Infinity) ? e : min
      );

      insights.push({
        type: 'highest' as const,
        title: 'Highest HRV',
        value: `${highest.hrvValueMs} ms`,
        description: new Date(highest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trend: 'up' as const,
      });

      insights.push({
        type: 'lowest' as const,
        title: 'Lowest HRV',
        value: `${lowest.hrvValueMs} ms`,
        description: new Date(lowest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trend: 'down' as const,
      });
    }

    if (hrvValues.length >= 14) {
      const recent7 = hrvValues.slice(-7);
      const previous7 = hrvValues.slice(-14, -7);
      
      const recentAvg = settings.useMedianDailyHRV 
        ? calculateMedian(recent7) 
        : calculateAverage(recent7);
      const previousAvg = settings.useMedianDailyHRV 
        ? calculateMedian(previous7) 
        : calculateAverage(previous7);
      
      const diff = recentAvg - previousAvg;
      const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';

      insights.push({
        type: 'comparison' as const,
        title: '7-Day Trend',
        value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)} ms`,
        description: `vs previous 7 days`,
        trend: trend as 'up' | 'down' | 'neutral',
      });
    }

    const tagCounts: Record<string, { total: number; hrvSum: number; count: number }> = {};
    const overallAvg = calculateAverage(hrvValues);

    validEntries.forEach(entry => {
      entry.tags.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { total: 0, hrvSum: 0, count: 0 };
        }
        tagCounts[tag].total++;
        tagCounts[tag].hrvSum += entry.hrvValueMs ?? 0;
        tagCounts[tag].count++;
      });
    });

    Object.entries(tagCounts).forEach(([tag, data]) => {
      if (data.count >= 5) {
        const tagAvg = data.hrvSum / data.count;
        const diff = tagAvg - overallAvg;
        if (Math.abs(diff) >= 5) {
          insights.push({
            type: 'correlation' as const,
            title: tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' '),
            value: `${diff >= 0 ? '+' : ''}${diff.toFixed(0)} ms`,
            description: `avg HRV on ${data.count} days`,
            trend: (diff >= 0 ? 'up' : 'down') as 'up' | 'down',
          });
        }
      }
    });

    return insights.slice(0, 4);
  }, [filteredEntries, hrvValues, settings.useMedianDailyHRV]);
}
