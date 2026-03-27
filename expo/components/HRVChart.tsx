import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Colors from '@/constants/colors';
import { DailyEntry } from '@/types';

interface HRVChartProps {
  entries: DailyEntry[];
  showRollingAverage?: boolean;
  onDataPointPress?: (entry: DailyEntry) => void;
}

const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 40 };

export default function HRVChart({ entries, showRollingAverage = false, onDataPointPress }: HRVChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;
  const innerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const chartData = useMemo(() => {
    const validEntries = entries.filter(e => e.hrvValueMs !== null);
    if (validEntries.length === 0) return { points: [], min: 0, max: 100, avgPoints: [] };

    const values = validEntries.map(e => e.hrvValueMs as number);
    const min = Math.max(0, Math.min(...values) - 10);
    const max = Math.max(...values) + 10;

    const points = validEntries.map((entry, index) => {
      const x = CHART_PADDING.left + (index / Math.max(validEntries.length - 1, 1)) * innerWidth;
      const y = CHART_PADDING.top + innerHeight - ((entry.hrvValueMs! - min) / (max - min)) * innerHeight;
      return { x, y, entry };
    });

    let avgPoints: { x: number; y: number }[] = [];
    if (showRollingAverage && validEntries.length >= 7) {
      avgPoints = validEntries.map((_, index) => {
        const start = Math.max(0, index - 6);
        const slice = values.slice(start, index + 1);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        const x = CHART_PADDING.left + (index / Math.max(validEntries.length - 1, 1)) * innerWidth;
        const y = CHART_PADDING.top + innerHeight - ((avg - min) / (max - min)) * innerHeight;
        return { x, y };
      });
    }

    return { points, min, max, avgPoints };
  }, [entries, innerWidth, innerHeight, showRollingAverage]);

  const createPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    return points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  };

  const createAreaPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    const linePath = createPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const bottomY = CHART_PADDING.top + innerHeight;
    return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  };

  const yAxisLabels = useMemo(() => {
    const { min, max } = chartData;
    const range = max - min;
    const step = Math.ceil(range / 4 / 5) * 5;
    const labels = [];
    for (let v = Math.ceil(min / step) * step; v <= max; v += step) {
      const y = CHART_PADDING.top + innerHeight - ((v - min) / (max - min)) * innerHeight;
      labels.push({ value: v, y });
    }
    return labels;
  }, [chartData, innerHeight]);

  if (entries.length === 0 || chartData.points.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyText}>No HRV data available</Text>
        <Text style={styles.emptySubtext}>Wear your Apple Watch to track HRV</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {yAxisLabels.map((label, i) => (
          <Line
            key={`grid-${i}`}
            x1={CHART_PADDING.left}
            y1={label.y}
            x2={chartWidth - CHART_PADDING.right}
            y2={label.y}
            stroke={Colors.chartGrid}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        <Path
          d={createAreaPath(chartData.points)}
          fill="url(#areaGradient)"
        />

        <Path
          d={createPath(chartData.points)}
          stroke={Colors.chartLine}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showRollingAverage && chartData.avgPoints.length > 0 && (
          <Path
            d={createPath(chartData.avgPoints)}
            stroke={Colors.chartAverage}
            strokeWidth={2}
            fill="none"
            strokeDasharray="6,4"
            strokeLinecap="round"
          />
        )}

        {chartData.points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={Colors.surface}
            stroke={Colors.chartLine}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View style={styles.yAxisContainer}>
        {yAxisLabels.map((label, i) => (
          <Text
            key={`label-${i}`}
            style={[styles.yAxisLabel, { top: label.y - 8 }]}
          >
            {label.value}
          </Text>
        ))}
      </View>

      <View style={styles.touchLayer}>
        {chartData.points.map((point, index) => (
          <TouchableOpacity
            key={`touch-${index}`}
            style={[
              styles.touchTarget,
              {
                left: point.x - 20,
                top: point.y - 20,
              },
            ]}
            onPress={() => onDataPointPress?.(point.entry)}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  yAxisContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: CHART_PADDING.left,
  },
  yAxisLabel: {
    position: 'absolute',
    left: 4,
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  touchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchTarget: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
});
