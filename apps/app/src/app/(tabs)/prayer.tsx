import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/ui/Header';
import { PrayerScheduleList } from '../../components/prayer/PrayerScheduleList';
import { QiblaCompassCard } from '../../components/prayer/QiblaCompassCard';
import { ShafiIndicator } from '../../components/prayer/ShafiIndicator';
import { useAuth } from '../../lib/auth-context';

export default function PrayerScreen() {
  const { mahal } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Prayer Timetable"
        subtitle="Shafi'i Madhab Standard"
        subtitleMl="നിസ്കാര സമയങ്ങൾ"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shafi'i Standard Fiqh Card */}
        <ShafiIndicator />

        {/* Schedule List (Today / Weekly / Monthly) */}
        <PrayerScheduleList
          latitude={mahal?.latitude || undefined}
          longitude={mahal?.longitude || undefined}
        />

        {/* Qibla Direction Compass Card */}
        <QiblaCompassCard
          latitude={mahal?.latitude || undefined}
          longitude={mahal?.longitude || undefined}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});
