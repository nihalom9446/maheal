import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Header } from '../../components/ui/Header';
import { JanazahCard } from '../../components/announcements/JanazahCard';
import { AnnouncementCard } from '../../components/announcements/AnnouncementCard';
import { AnnouncementDetailModal } from '../../components/announcements/AnnouncementDetailModal';
import { AnnouncementListItem, DeathRecordListItem } from '@maheall/shared';

const CATEGORIES = [
  { key: 'ALL', label: 'All', labelMl: 'എല്ലാം' },
  { key: 'JANAZAH', label: 'Janazah', labelMl: 'മരണം' },
  { key: 'EMERGENCY', label: 'Urgent', labelMl: 'അടിയന്തരം' },
  { key: 'MADRASA', label: 'Madrasa', labelMl: 'മദ്റസ' },
  { key: 'GENERAL', label: 'General', labelMl: 'പൊതുവായത്' },
  { key: 'FINANCE', label: 'Finance', labelMl: 'സാമ്പത്തികം' },
];

const MOCK_JANAZAH_LIST: DeathRecordListItem[] = [
  {
    id: 'd1000000-0000-0000-0000-000000000001',
    mahal_id: '00000000-0000-0000-0000-000000000001',
    family_id: 'f84',
    family_number: 84,
    family_house_name: 'Al-Madina Manzil',
    family_house_name_ml: 'അൽ മദീന മൻസിൽ',
    ward_id: 'w2',
    ward_name: 'Ward 2 - Badr',
    member_id: 'm84',
    name: 'K. P. Hydrose Haji',
    name_ml: 'കെ. പി. ഹൈദ്രോസ് ഹാജി',
    age: 78,
    date_of_death: '2026-09-08',
    prayer_time: '2026-09-08T16:30:00Z',
    prayer_location: 'Mahal Juma Masjid',
    burial_location: 'Mahal Central Qabaristan',
    is_details_public: true,
    status: 'PUBLISHED',
    created_at: new Date(),
  },
  {
    id: 'd1000000-0000-0000-0000-000000000002',
    mahal_id: '00000000-0000-0000-0000-000000000001',
    family_id: 'f192',
    family_number: 192,
    family_house_name: 'Fathima Cottage',
    family_house_name_ml: 'ഫാത്തിമ കോട്ടേജ്',
    ward_id: 'w3',
    ward_name: 'Ward 3 - Uhud',
    member_id: 'm192',
    name: 'Amina Umma',
    name_ml: 'ആമിന ഉമ്മ',
    age: 82,
    date_of_death: '2026-09-04',
    prayer_time: '2026-09-04T11:00:00Z',
    prayer_location: 'Noor Juma Masjid',
    burial_location: 'Mahal Central Qabaristan',
    is_details_public: true,
    status: 'PUBLISHED',
    created_at: new Date(Date.now() - 4 * 86400000),
  },
];

const MOCK_ANNOUNCEMENTS_LIST: AnnouncementListItem[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    mahal_id: '00000000-0000-0000-0000-000000000001',
    title: 'Monthly General Body & Madrasa Annual Day',
    title_ml: 'മഹല്ല് ജനറൽ ബോഡിയും മദ്റസാ വാർഷിക ദിനവും',
    category: 'GENERAL',
    priority: 'NORMAL',
    content:
      'The Annual General Body meeting of our Mahal will be held this Sunday after Asr prayer at the Community Hall. All family heads are requested to attend.',
    content_ml:
      'നമ്മുടെ മഹല്ല് ജനറൽ ബോഡി യോഗം ഈ വരുന്ന ഞായറാഴ്ച അസ്വർ നമസ്കാരത്തിന് ശേഷം കമ്മ്യൂണിറ്റി ഹാളിൽ വെച്ച് ചേരുന്നതാണ്. എല്ലാ കുടുംബനാഥന്മാരും കൃത്യസമയത്ത് പങ്കെടുക്കുക.',
    status: 'PUBLISHED',
    author_user_id: 'u1',
    published_at: new Date(),
    attachment_keys: ['annual_report_2026.pdf'],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    mahal_id: '00000000-0000-0000-0000-000000000001',
    title: 'Madrasa Admissions Open for Academic Year 2026-27',
    title_ml: 'പുതിയ അധ്യയന വർഷത്തെ മദ്റസ പ്രവേശനം ആരംഭിച്ചു',
    category: 'MADRASA',
    priority: 'HIGH',
    content:
      'Admissions for Class 1 to Class 10 are now open. Parents are requested to collect application forms from the Madrasa Sadar Muallim office.',
    content_ml:
      'ക്ലാസ് 1 മുതൽ 10 വരെയുള്ള പുതിയ വിദ്യാർത്ഥികളുടെ പ്രവേശനം ആരംഭിച്ചു. മദ്റസ സദർ മുഅല്ലിം ഓഫീസിൽ നിന്നും അപേക്ഷാ ഫോമുകൾ ലഭ്യമാണ്.',
    status: 'PUBLISHED',
    author_user_id: 'u1',
    published_at: new Date(Date.now() - 86400000),
    attachment_keys: [],
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000),
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    mahal_id: '00000000-0000-0000-0000-000000000001',
    title: 'Medical Relief Fund Collection for Dialysis Patients',
    title_ml: 'ഡയാലിസിസ് രോഗികൾക്കായുള്ള ചികിത്സാ സഹായ ഫണ്ട് ശേഖരണം',
    category: 'FINANCE',
    priority: 'HIGH',
    content:
      'Mahal Relief Cell invites contributions for providing subsidized monthly dialysis treatment for underprivileged patients in our Mahal.',
    content_ml:
      'നമ്മുടെ മഹല്ലിലെ നിർധനരായ രോഗികൾക്ക് സൗജന്യ ഡയാലിസിസ് നൽകുന്നതിനായി സഹായം അഭ്യർത്ഥിക്കുന്നു.',
    status: 'PUBLISHED',
    author_user_id: 'u1',
    published_at: new Date(Date.now() - 3 * 86400000),
    attachment_keys: [],
    created_at: new Date(Date.now() - 3 * 86400000),
    updated_at: new Date(Date.now() - 3 * 86400000),
  },
];

export default function AnnouncementsScreen() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementListItem | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredAnnouncements =
    activeCategory === 'ALL'
      ? MOCK_ANNOUNCEMENTS_LIST
      : MOCK_ANNOUNCEMENTS_LIST.filter((a) => a.category === activeCategory);

  const showJanazahSection = activeCategory === 'ALL' || activeCategory === 'JANAZAH';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Announcements & Janazah"
        subtitle="Mahal Public Notices"
        subtitleMl="മഹല്ല് അറിയിപ്പുകൾ"
      />

      {/* Filter Category Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.7}
              style={[
                styles.categoryChip,
                activeCategory === cat.key ? styles.categoryChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.key ? styles.categoryTextActive : null,
                ]}
              >
                {cat.label} ({cat.labelMl})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Janazah Demise Notices Section */}
        {showJanazahSection && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Janazah Demise Notices</Text>
              <Text style={styles.sectionTitleMl}>വഫാത്ത് അറിയിപ്പുകൾ</Text>
            </View>

            {MOCK_JANAZAH_LIST.map((item) => (
              <JanazahCard key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* General Announcements Section */}
        {activeCategory !== 'JANAZAH' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Mahal Notices</Text>
              <Text style={styles.sectionTitleMl}>പൊതു അറിയിപ്പുകൾ</Text>
            </View>

            {filteredAnnouncements.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                onPress={() => setSelectedAnnouncement(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <AnnouncementDetailModal
        visible={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        item={selectedAnnouncement}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs + 2,
  },
  categoryChip: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitleMl: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
