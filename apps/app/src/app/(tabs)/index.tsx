import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../lib/auth-context';
import { getHijriDate, formatGregorianWithMalayalam } from '../../lib/date-utils';
import { NextPrayerCountdown } from '../../components/home/NextPrayerCountdown';
import { TodayTimetableCard } from '../../components/home/TodayTimetableCard';
import { PirivuSummaryBadge } from '../../components/home/PirivuSummaryBadge';
import { UrgentBanner } from '../../components/home/UrgentBanner';
import { RecentAnnouncementsFeed } from '../../components/home/RecentAnnouncementsFeed';
import { AnnouncementDetailModal } from '../../components/announcements/AnnouncementDetailModal';
import { AnnouncementListItem, DeathRecordListItem } from '@maheall/shared';

// Fallback announcement & demise items for robust offline rendering
const MOCK_ANNOUNCEMENTS: AnnouncementListItem[] = [
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
    attachment_keys: [],
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
      'Admissions for Class 1 to Class 10 are now open. Please register at the office before 15th of this month.',
    content_ml:
      'ക്ലാസ് 1 മുതൽ 10 വരെയുള്ള പുതിയ വിദ്യാർത്ഥികളുടെ പ്രവേശനം ആരംഭിച്ചു. ഈ മാസം 15-ന് മുൻപായി ഓഫീസിൽ രജിസ്റ്റർ ചെയ്യുക.',
    status: 'PUBLISHED',
    author_user_id: 'u1',
    published_at: new Date(Date.now() - 86400000),
    attachment_keys: [],
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000),
  },
];

const MOCK_JANAZAH: DeathRecordListItem = {
  id: 'd1000000-0000-0000-0000-000000000001',
  mahal_id: '00000000-0000-0000-0000-000000000001',
  family_id: 'f1',
  family_number: 84,
  family_house_name: 'Al-Madina Manzil',
  family_house_name_ml: 'അൽ മദീന മൻസിൽ',
  ward_id: 'w1',
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
};

export default function HomeScreen() {
  const router = useRouter();
  const { mahal, pirivuStatus, refreshUserData } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementListItem | null>(null);

  const today = new Date();
  const hijri = getHijriDate(today);
  const gregorian = formatGregorianWithMalayalam(today);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Mosque Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.mosqueIcon}>
            <Ionicons name="business" size={22} color={colors.primaryDark} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.mahalName} numberOfLines={1}>
              {mahal?.name || 'Noor Juma Masjid Mahal'}
            </Text>
            <Text style={styles.mahalNameMl} numberOfLines={1}>
              {mahal?.name_ml || 'നൂർ ജുമാ മസ്ജിദ് മഹല്ല്'}
            </Text>
          </View>
        </View>

        {/* Date Display */}
        <View style={styles.dateBlock}>
          <Text style={styles.hijriText}>{hijri.formattedEn}</Text>
          <Text style={styles.gregorianText}>{gregorian.fullDateString}</Text>
        </View>
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
        {/* Next Prayer Live Countdown Widget */}
        <NextPrayerCountdown
          latitude={mahal?.latitude || undefined}
          longitude={mahal?.longitude || undefined}
        />

        {/* Urgent Janazah Banner */}
        <UrgentBanner
          janazah={MOCK_JANAZAH}
          onPress={() => router.push('/(tabs)/announcements')}
        />

        {/* Pirivu Status Badge */}
        <PirivuSummaryBadge
          status={pirivuStatus}
          onPress={() => router.push('/(tabs)/pirivu')}
        />

        {/* Today's Complete Prayer Timetable */}
        <TodayTimetableCard
          latitude={mahal?.latitude || undefined}
          longitude={mahal?.longitude || undefined}
        />

        {/* Recent Announcements Feed */}
        <RecentAnnouncementsFeed
          announcements={MOCK_ANNOUNCEMENTS}
          onSelect={(item) => setSelectedAnnouncement(item)}
          onViewAll={() => router.push('/(tabs)/announcements')}
        />
      </ScrollView>

      {/* Announcement Detail Modal */}
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
  topHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  mosqueIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  mahalName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  mahalNameMl: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 1,
  },
  dateBlock: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hijriText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldDark,
  },
  gregorianText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
});
