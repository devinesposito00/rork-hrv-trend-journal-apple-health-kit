import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Search, Filter, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import TagChip from '@/components/TagChip';
import { TAG_PRESETS } from '@/constants/tags';
import { DailyEntry } from '@/types';

export default function LogScreen() {
  const router = useRouter();
  const { entries, currentAverage } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showLowHRV, setShowLowHRV] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const sortedEntries = useMemo(() => {
    let filtered = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.note.toLowerCase().includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedTagFilter) {
      filtered = filtered.filter(e => e.tags.includes(selectedTagFilter));
    }

    if (showLowHRV && currentAverage > 0) {
      filtered = filtered.filter(e => 
        e.hrvValueMs !== null && e.hrvValueMs < currentAverage
      );
    }

    return filtered;
  }, [entries, searchQuery, selectedTagFilter, showLowHRV, currentAverage]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === todayStr);

  const handleAddToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/day-detail', params: { date: todayStr } });
  };

  const handleEntryPress = (entry: DailyEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/day-detail', params: { date: entry.date } });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';

    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getHRVColor = (hrv: number | null) => {
    if (hrv === null) return Colors.textTertiary;
    if (hrv >= currentAverage * 1.1) return Colors.hrvHigh;
    if (hrv <= currentAverage * 0.9) return Colors.hrvLow;
    return Colors.hrvMedium;
  };

  const renderEntry = ({ item }: { item: DailyEntry }) => (
    <TouchableOpacity 
      style={styles.entryCard} 
      onPress={() => handleEntryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.entryLeft}>
        <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
        {item.note ? (
          <Text style={styles.entryNote} numberOfLines={1}>{item.note}</Text>
        ) : (
          <Text style={styles.entryNoNote}>No note added</Text>
        )}
        {item.tags.length > 0 && (
          <View style={styles.entryTags}>
            {item.tags.slice(0, 3).map(tagId => (
              <TagChip key={tagId} tagId={tagId} compact />
            ))}
            {item.tags.length > 3 && (
              <View style={styles.moreTagsBadge}>
                <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <View style={styles.entryRight}>
        <Text style={[styles.entryHRV, { color: getHRVColor(item.hrvValueMs) }]}>
          {item.hrvValueMs !== null ? item.hrvValueMs : '--'}
        </Text>
        <Text style={styles.entryHRVUnit}>ms</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Log</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Filter size={20} color={showFilters ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes or tags..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterChip, showLowHRV && styles.filterChipActive]}
            onPress={() => setShowLowHRV(!showLowHRV)}
          >
            <Text style={[styles.filterChipText, showLowHRV && styles.filterChipTextActive]}>
              Low HRV Days
            </Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TAG_PRESETS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedTagFilter === item.id && styles.filterChipActive
                ]}
                onPress={() => setSelectedTagFilter(
                  selectedTagFilter === item.id ? null : item.id
                )}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedTagFilter === item.id && styles.filterChipTextActive
                ]}>
                  {item.emoji} {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.tagFilters}
          />
        </View>
      )}

      <TouchableOpacity 
        style={styles.addTodayButton} 
        onPress={handleAddToday}
        activeOpacity={0.8}
      >
        <Plus size={22} color={Colors.textInverse} />
        <Text style={styles.addTodayText}>
          {todayEntry?.note || todayEntry?.tags.length 
            ? "Edit Today's Note" 
            : "Add Today's Note"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={sortedEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No entries found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedTagFilter 
                ? 'Try adjusting your filters'
                : 'Start by adding a note for today'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  filterButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersContainer: {
    paddingBottom: 12,
  },
  tagFilters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginRight: 8,
    marginBottom: 8,
    marginLeft: 16,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '20',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
  },
  addTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addTodayText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  entryLeft: {
    flex: 1,
    marginRight: 12,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  entryNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  entryNoNote: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  moreTagsBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  moreTagsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  entryRight: {
    alignItems: 'flex-end',
  },
  entryHRV: {
    fontSize: 28,
    fontWeight: '700',
  },
  entryHRVUnit: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
});
