import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Check, Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { TAG_PRESETS, TAG_CATEGORIES, CATEGORY_COLORS } from '@/constants/tags';
import { DailyEntry } from '@/types';

export default function DayDetailScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date: string }>();
  const { getEntryByDate, updateEntry } = useApp();
  
  const existingEntry = getEntryByDate(date || '');
  
  const [note, setNote] = useState(existingEntry?.note || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(existingEntry?.tags || []);
  const [stress, setStress] = useState<number | null>(existingEntry?.stress ?? null);
  const [trainingLoad, setTrainingLoad] = useState<number | null>(existingEntry?.trainingLoad ?? null);
  const [showStress, setShowStress] = useState(existingEntry?.stress !== null);
  const [showTraining, setShowTraining] = useState(existingEntry?.trainingLoad !== null);

  const hrvValue = existingEntry?.hrvValueMs;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTagToggle = (tagId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const entry: DailyEntry = {
      id: existingEntry?.id || Math.random().toString(36).substring(2, 15),
      date: date || new Date().toISOString().split('T')[0],
      hrvValueMs: existingEntry?.hrvValueMs ?? null,
      hrvSource: existingEntry?.hrvSource ?? null,
      note: note.trim(),
      tags: selectedTags,
      sleepHours: existingEntry?.sleepHours ?? null,
      trainingLoad: showTraining ? trainingLoad : null,
      alcohol: selectedTags.includes('alcohol'),
      caffeineLate: selectedTags.includes('late-caffeine'),
      illness: selectedTags.includes('sick'),
      stress: showStress ? stress : null,
      travel: selectedTags.includes('jet-lag') || selectedTags.includes('hotel'),
      createdAt: existingEntry?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    updateEntry(entry);
    navigateBack();
  };

  const handleClose = () => {
    navigateBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Day Details</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Check size={20} color={Colors.textInverse} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dateCard}>
            <Text style={styles.dateText}>{formatDate(date || '')}</Text>
            <View style={styles.hrvDisplay}>
              <Heart size={20} color={Colors.primary} />
              <Text style={styles.hrvValue}>
                {hrvValue !== null ? hrvValue : '--'}
              </Text>
              <Text style={styles.hrvUnit}>ms</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tags</Text>
            {TAG_CATEGORIES.map(category => (
              <View key={category} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: CATEGORY_COLORS[category] }]}>
                  {category}
                </Text>
                <View style={styles.tagsGrid}>
                  {TAG_PRESETS.filter(t => t.category === category).map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagButton,
                        selectedTags.includes(tag.id) && {
                          backgroundColor: CATEGORY_COLORS[category] + '20',
                          borderColor: CATEGORY_COLORS[category],
                        }
                      ]}
                      onPress={() => handleTagToggle(tag.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.tagEmoji}>{tag.emoji}</Text>
                      <Text style={[
                        styles.tagText,
                        selectedTags.includes(tag.id) && { color: CATEGORY_COLORS[category] }
                      ]}>
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Optional Metrics</Text>
            
            <View style={styles.sliderSection}>
              <TouchableOpacity
                style={styles.sliderHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowStress(!showStress);
                  if (!showStress && stress === null) setStress(5);
                }}
              >
                <Text style={styles.sliderLabel}>Stress Level</Text>
                <View style={[styles.toggleBadge, showStress && styles.toggleBadgeActive]}>
                  <Text style={[styles.toggleText, showStress && styles.toggleTextActive]}>
                    {showStress ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showStress && (
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={stress ?? 5}
                    onValueChange={setStress}
                    minimumTrackTintColor={Colors.primary}
                    maximumTrackTintColor={Colors.border}
                    thumbTintColor={Colors.primary}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Low</Text>
                    <Text style={styles.sliderValue}>{stress}</Text>
                    <Text style={styles.sliderLabelText}>High</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.sliderSection}>
              <TouchableOpacity
                style={styles.sliderHeader}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowTraining(!showTraining);
                  if (!showTraining && trainingLoad === null) setTrainingLoad(5);
                }}
              >
                <Text style={styles.sliderLabel}>Training Load</Text>
                <View style={[styles.toggleBadge, showTraining && styles.toggleBadgeActive]}>
                  <Text style={[styles.toggleText, showTraining && styles.toggleTextActive]}>
                    {showTraining ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showTraining && (
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={trainingLoad ?? 5}
                    onValueChange={setTrainingLoad}
                    minimumTrackTintColor={Colors.secondary}
                    maximumTrackTintColor={Colors.border}
                    thumbTintColor={Colors.secondary}
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabelText}>Rest</Text>
                    <Text style={styles.sliderValue}>{trainingLoad}</Text>
                    <Text style={styles.sliderLabelText}>Max</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="How did you feel today? What might explain your HRV?"
              placeholderTextColor={Colors.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{note.length}/500</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  dateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  hrvDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  hrvValue: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.primary,
  },
  hrvUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  tagEmoji: {
    fontSize: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sliderSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  toggleBadgeActive: {
    backgroundColor: Colors.primary + '20',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  sliderContainer: {
    marginTop: 14,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabelText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  noteInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
  },
});
