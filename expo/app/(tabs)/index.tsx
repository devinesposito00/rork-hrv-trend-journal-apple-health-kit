import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Activity, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp, useHRVInsights } from '@/contexts/AppContext';
import HRVChart from '@/components/HRVChart';
import InsightCard from '@/components/InsightCard';
import RangeSelector from '@/components/RangeSelector';
import { DailyEntry } from '@/types';

export default function TrendsScreen() {
  const router = useRouter();
  const { 
    filteredEntries, 
    selectedRange, 
    setSelectedRange, 
    currentAverage, 
    settings,
    refreshData
  } = useApp();
  const insights = useHRVInsights();
  const [showRollingAvg, setShowRollingAvg] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleDataPointPress = (entry: DailyEntry) => {
    router.push({ pathname: '/day-detail', params: { date: entry.date } });
  };

  const validEntriesCount = filteredEntries.filter(e => e.hrvValueMs !== null).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Activity size={28} color={Colors.primary} />
            <Text style={styles.title}>HRV Trends</Text>
          </View>
          <RangeSelector 
            selectedRange={selectedRange} 
            onRangeChange={setSelectedRange} 
          />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryLabel}>
              {settings.useMedianDailyHRV ? 'Median' : 'Average'} HRV
            </Text>
            <View style={styles.summaryValueRow}>
              <Text style={styles.summaryValue}>
                {currentAverage > 0 ? Math.round(currentAverage) : '--'}
              </Text>
              <Text style={styles.summaryUnit}>ms</Text>
            </View>
          </View>
          <View style={styles.summaryMeta}>
            <Text style={styles.summaryMetaText}>
              {validEntriesCount} days with data
            </Text>
            <Text style={styles.summaryMetaText}>
              Last {selectedRange} days
            </Text>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Daily HRV</Text>
            <TouchableOpacity
              style={[styles.toggleButton, showRollingAvg && styles.toggleButtonActive]}
              onPress={() => setShowRollingAvg(!showRollingAvg)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleButtonText, showRollingAvg && styles.toggleButtonTextActive]}>
                7-Day Avg
              </Text>
            </TouchableOpacity>
          </View>
          <HRVChart 
            entries={filteredEntries} 
            showRollingAverage={showRollingAvg}
            onDataPointPress={handleDataPointPress}
          />
          <Text style={styles.chartHint}>Tap a point to add notes</Text>
        </View>

        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <View style={styles.insightsHeader}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.disclaimerBadge}>
                <Info size={12} color={Colors.textTertiary} />
                <Text style={styles.disclaimerText}>Wellness only</Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsScroll}
            >
              {insights.map((insight, index) => (
                <InsightCard key={`${insight.type}-${index}`} insight={insight} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Info size={14} color={Colors.textTertiary} />
          <Text style={styles.disclaimerFullText}>
            For wellness tracking only. Not medical advice.
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryMain: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  summaryValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  summaryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  summaryMetaText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  toggleButtonActive: {
    backgroundColor: Colors.chartAverage + '20',
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  toggleButtonTextActive: {
    color: Colors.chartAverage,
  },
  chartHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  insightsScroll: {
    gap: 12,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  disclaimerFullText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
