import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Heart, 
  RefreshCw, 
  Download, 
  Bell, 
  BarChart3, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { exportAndShareCSV } from '@/utils/csvExport';
import { TimeRange } from '@/types';

export default function SettingsScreen() {
  const { settings, updateSettings, entries, refreshData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await exportAndShareCSV(entries);
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
    setIsExporting(false);
  };

  const handleToggleReminder = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      Alert.alert(
        'Enable Reminders',
        'Daily reminders require notification permissions. This is a demo - notifications work on physical devices.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: () => updateSettings({ reminderEnabled: true })
          }
        ]
      );
    } else {
      updateSettings({ reminderEnabled: false });
    }
  };

  const handleDefaultRangeChange = (range: TimeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ defaultRange: range });
  };

  const entriesWithHRV = entries.filter(e => e.hrvValueMs !== null).length;
  const entriesWithNotes = entries.filter(e => e.note.length > 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HealthKit Connection</Text>
          <View style={styles.card}>
            <View style={styles.connectionStatus}>
              <View style={styles.connectionInfo}>
                <Heart size={22} color={Colors.primary} />
                <View style={styles.connectionText}>
                  <Text style={styles.connectionTitle}>Apple Health</Text>
                  <Text style={styles.connectionSubtitle}>Demo mode - using mock data</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <CheckCircle size={14} color={Colors.success} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{entriesWithHRV}</Text>
                <Text style={styles.statLabel}>Days with HRV</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{entriesWithNotes}</Text>
                <Text style={styles.statLabel}>Days with notes</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={isRefreshing}
              activeOpacity={0.7}
            >
              <RefreshCw 
                size={18} 
                color={Colors.primary} 
                style={isRefreshing ? styles.spinning : undefined}
              />
              <Text style={styles.refreshButtonText}>
                {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HRV Calculation</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ useMedianDailyHRV: !settings.useMedianDailyHRV });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <BarChart3 size={20} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Use Median</Text>
                  <Text style={styles.settingSubtitle}>More robust than average</Text>
                </View>
              </View>
              <Switch
                value={settings.useMedianDailyHRV}
                onValueChange={(value) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateSettings({ useMedianDailyHRV: value });
                }}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.useMedianDailyHRV ? Colors.primary : Colors.surface}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Range</Text>
          <View style={styles.card}>
            {([7, 30, 90] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.rangeOption,
                  settings.defaultRange === range && styles.rangeOptionActive
                ]}
                onPress={() => handleDefaultRangeChange(range)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.rangeOptionText,
                  settings.defaultRange === range && styles.rangeOptionTextActive
                ]}>
                  {range} Days
                </Text>
                {settings.defaultRange === range && (
                  <CheckCircle size={18} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Daily Reminder</Text>
                  <Text style={styles.settingSubtitle}>8:00 PM</Text>
                </View>
              </View>
              <Switch
                value={settings.reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                thumbColor={settings.reminderEnabled ? Colors.primary : Colors.surface}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={handleExport}
              disabled={isExporting}
              activeOpacity={0.7}
            >
              <Download size={20} color={Colors.textInverse} />
              <Text style={styles.exportButtonText}>
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.exportHint}>
              Exports all your HRV data, notes, and tags
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Info size={20} color={Colors.textSecondary} />
              <View style={styles.aboutText}>
                <Text style={styles.aboutTitle}>HRV Trend Notes</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              </View>
            </View>
            <View style={styles.disclaimerBox}>
              <AlertCircle size={16} color={Colors.warning} />
              <Text style={styles.disclaimerBoxText}>
                For wellness tracking only. Not medical advice. This app does not diagnose, treat, cure, or prevent any disease.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.privacySection}>
          <Text style={styles.privacyTitle}>Privacy</Text>
          <Text style={styles.privacyText}>
            • All data stored locally on your device{'\n'}
            • No analytics, tracking, or ads{'\n'}
            • No data collected or shared{'\n'}
            • Export is user-initiated only
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionText: {
    gap: 2,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  connectionSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary + '10',
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  spinning: {
    opacity: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    gap: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  rangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rangeOptionActive: {
    backgroundColor: Colors.primary + '08',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  rangeOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  rangeOptionTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  exportHint: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 10,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  aboutText: {
    gap: 2,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  aboutVersion: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 10,
  },
  disclaimerBoxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  privacySection: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
});
