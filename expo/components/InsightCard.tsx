import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { HRVInsight } from '@/types';

interface InsightCardProps {
  insight: HRVInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getTrendIcon = () => {
    switch (insight.trend) {
      case 'up':
        return <TrendingUp size={16} color={Colors.success} />;
      case 'down':
        return <TrendingDown size={16} color={Colors.error} />;
      default:
        return <Minus size={16} color={Colors.textTertiary} />;
    }
  };

  const getTrendColor = () => {
    switch (insight.trend) {
      case 'up':
        return Colors.success;
      case 'down':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{insight.title}</Text>
        {getTrendIcon()}
      </View>
      <Text style={[styles.value, { color: getTrendColor() }]}>{insight.value}</Text>
      <Text style={styles.description}>{insight.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
});
