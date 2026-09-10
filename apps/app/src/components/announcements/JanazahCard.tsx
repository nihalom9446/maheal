import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { DeathRecordListItem } from '@maheall/shared';
import { format } from 'date-fns';

export interface JanazahCardProps {
  item: DeathRecordListItem;
  onPress?: () => void;
}

export function JanazahCard({ item, onPress }: JanazahCardProps) {
  const deathDateStr = item.date_of_death ? String(item.date_of_death) : 'Today';
  const prayerTimeStr = item.prayer_time
    ? format(new Date(item.prayer_time), 'hh:mm a')
    : '4:30 PM';
  const prayerDateStr = item.prayer_time
    ? format(new Date(item.prayer_time), 'EEEE, d MMMM')
    : 'Today';

  const handleShareWhatsApp = async () => {
    const text = `*ഇന്നാ ലില്ലാഹി വ ഇന്നാ ഇലൈഹി റാജിഊൻ*
*മരണ വാർത്ത (JANAZAH DEMISE NOTICE)*
----------------------------------------
*പേര് / Name:* ${item.name_ml || item.name} (${item.name})
*വയസ്സ് / Age:* ${item.age ? `${item.age} Years` : '—'}
*വീട്ടുപേര് / House:* ${item.family_house_name || 'Baitul Noor'} (${item.family_house_name_ml || ''})
*വാർഡ് / Ward:* ${item.ward_name || 'Darussalam'}
----------------------------------------
*മയ്യത്ത് നിസ്കാരം / Janazah Prayer:*
• സമയം: ${prayerDateStr}, ${prayerTimeStr}
• സ്ഥലം: ${item.prayer_location || 'Mahal Juma Masjid'}

*ഖബറടക്കം / Burial (Qabaristan):*
• ${item.burial_location || 'Mahal Central Qabaristan'}
----------------------------------------
_മയ്യിത്തിന്റെ മഗ്ഫിറത്തിനും മർഹമത്തിനും വേണ്ടി പ്രാർത്ഥിക്കുക._
_Generated via MAHEALL Community OS_`;

    try {
      await Share.share({
        message: text,
        title: `Janazah Notice - ${item.name}`,
      });
    } catch {
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Urgent Islamic Banner */}
      <View style={styles.topBanner}>
        <View style={styles.badgeRow}>
          <View style={styles.urgentBadge}>
            <Ionicons name="notifications" size={12} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.urgentBadgeText}>JANAZAH NOTICE</Text>
          </View>
          <Text style={styles.deathDate}>{deathDateStr}</Text>
        </View>

        <Text style={styles.arabicDua}>إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</Text>
        <Text style={styles.duaTranslation}>"തീർച്ചയായും നാം അല്ലാഹുവിനുള്ളതാണ്, അവങ്കലേക്ക് തന്നെ മടങ്ങുന്നവരുമാണ്"</Text>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        <View style={styles.profileRow}>
          {/* Deceased Avatar Placeholder */}
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color={colors.textSecondary} />
          </View>

          <View style={styles.nameBlock}>
            <Text style={styles.nameEn}>{item.name}</Text>
            {item.name_ml ? <Text style={styles.nameMl}>{item.name_ml}</Text> : null}

            <View style={styles.metaRow}>
              {item.age ? (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>Age: {item.age}</Text>
                </View>
              ) : null}

              {item.family_house_name ? (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText} numberOfLines={1}>
                    {item.family_house_name}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Schedule Box */}
        <View style={styles.scheduleBox}>
          <View style={styles.scheduleRow}>
            <Ionicons name="time" size={16} color={colors.primaryDark} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleLabel}>Janazah Prayer (മയ്യത്ത് നിസ്കാരം):</Text>
              <Text style={styles.scheduleValue}>
                {prayerDateStr} at {prayerTimeStr}
              </Text>
              <Text style={styles.scheduleLoc}>{item.prayer_location || 'Mahal Juma Masjid'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.scheduleRow}>
            <Ionicons name="location" size={16} color={colors.emeraldDark} style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduleLabel}>Burial (ഖബറടക്കം):</Text>
              <Text style={styles.scheduleLoc}>{item.burial_location || 'Mahal Central Qabaristan'}</Text>
            </View>
          </View>
        </View>

        {/* Action Button: WhatsApp Share */}
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleShareWhatsApp}
          activeOpacity={0.8}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.shareBtnText}>Share Obituary on WhatsApp (അറിയിപ്പ് പങ്കുവെക്കുക)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    overflow: 'hidden',
    ...shadows.md,
  },
  topBanner: {
    backgroundColor: '#991b1b', // Deep urgent dark red
    padding: spacing.md,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  deathDate: {
    fontSize: 11,
    color: '#fee2e2',
    fontWeight: '500',
  },
  arabicDua: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fef3c7',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  duaTranslation: {
    fontSize: 11,
    color: '#fee2e2',
    textAlign: 'center',
    marginTop: 2,
  },
  body: {
    padding: spacing.base,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameBlock: {
    flex: 1,
  },
  nameEn: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nameMl: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  metaPill: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  metaPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scheduleBox: {
    backgroundColor: '#fff1f2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.urgent,
    marginTop: 1,
  },
  scheduleLoc: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#fecaca',
    marginVertical: spacing.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669', // WhatsApp emerald green
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
