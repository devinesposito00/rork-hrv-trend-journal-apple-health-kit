import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { TimeRange } from '@/types';

interface RangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const RANGES: { value: TimeRange; label: string }[] = [
  { value: 7, label: '7D' },
  { value: 30, label: '30D' },
  { value: 90, label: '90D' },
];

export default function RangeSelector({ selectedRange, onRangeChange }: RangeSelectorProps) {
  const handlePress = (range: TimeRange) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRangeChange(range);
  };

  return (
    <View style={styles.container}>
      {RANGES.map((range) => (
        <TouchableOpacity
          key={range.value}
          style={[
            styles.button,
            selectedRange === range.value && styles.buttonActive,
          ]}
          onPress={() => handlePress(range.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.buttonText,
              selectedRange === range.value && styles.buttonTextActive,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  buttonTextActive: {
    color: Colors.primary,
  },
});
