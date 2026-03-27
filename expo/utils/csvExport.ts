import { DailyEntry } from '@/types';
import { Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export function generateCSV(entries: DailyEntry[]): string {
  const headers = [
    'Date',
    'HRV (ms)',
    'Tags',
    'Note',
    'Stress (0-10)',
    'Training Load (0-10)',
    'Sleep Hours',
    'Alcohol',
    'Late Caffeine',
    'Illness',
    'Travel',
  ];
  
  const rows = entries.map(entry => [
    entry.date,
    entry.hrvValueMs?.toString() ?? '',
    entry.tags.join('; '),
    `"${entry.note.replace(/"/g, '""')}"`,
    entry.stress?.toString() ?? '',
    entry.trainingLoad?.toString() ?? '',
    entry.sleepHours?.toString() ?? '',
    entry.alcohol ? 'Yes' : 'No',
    entry.caffeineLate ? 'Yes' : 'No',
    entry.illness ? 'Yes' : 'No',
    entry.travel ? 'Yes' : 'No',
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  return csvContent;
}

export async function exportAndShareCSV(entries: DailyEntry[]): Promise<void> {
  const csvContent = generateCSV(entries);
  const fileName = `hrv-trend-notes-${new Date().toISOString().split('T')[0]}.csv`;
  
  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }
  
  try {
    const file = new File(Paths.cache, fileName);
    file.create({ overwrite: true });
    file.write(csvContent);
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export HRV Data',
      });
    } else {
      await Share.share({
        message: csvContent,
        title: 'HRV Trend Notes Export',
      });
    }
  } catch (error) {
    console.log('Error exporting CSV:', error);
    await Share.share({
      message: csvContent,
      title: 'HRV Trend Notes Export',
    });
  }
}
