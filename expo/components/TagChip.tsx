import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { TAG_PRESETS, CATEGORY_COLORS } from '@/constants/tags';

interface TagChipProps {
  tagId: string;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

export default function TagChip({ tagId, selected = false, onPress, compact = false }: TagChipProps) {
  const tag = TAG_PRESETS.find(t => t.id === tagId);
  if (!tag) return null;

  const categoryColor = CATEGORY_COLORS[tag.category] || Colors.textSecondary;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const content = (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        selected && { backgroundColor: categoryColor + '20', borderColor: categoryColor },
      ]}
    >
      {!compact && <Text style={styles.emoji}>{tag.emoji}</Text>}
      <Text
        style={[
          styles.text,
          compact && styles.textCompact,
          selected && { color: categoryColor },
        ]}
        numberOfLines={1}
      >
        {tag.name}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  containerCompact: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  textCompact: {
    fontSize: 12,
  },
});
