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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Header } from '../../components/ui/Header';
import { FamilyInfoCard } from '../../components/profile/FamilyInfoCard';
import { MemberListItemCard } from '../../components/profile/MemberListItemCard';
import { DpdpaGrievanceCard } from '../../components/profile/DpdpaGrievanceCard';
import { LogoutModal } from '../../components/profile/LogoutModal';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth-context';

export default function ProfileScreen() {
  const { family, mahal, logout, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setIsLogoutModalVisible(false);
    }
  };

  const members = family?.members || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Family Profile & Settings"
        subtitle="Mahal Household Directory"
        subtitleMl="കുടുംബ വിവരങ്ങൾ"
      />

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
        {/* Household Info Card */}
        <FamilyInfoCard family={family} />

        {/* Registered Members Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Registered Members</Text>
              <Text style={styles.sectionTitleMl}>രജിസ്റ്റർ ചെയ്ത കുടുംബാംഗങ്ങൾ</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{members.length} Members</Text>
            </View>
          </View>

          <View style={styles.membersList}>
            {members.map((member) => (
              <MemberListItemCard key={member.id} member={member} />
            ))}
          </View>
        </View>

        {/* DPDPA & Secretary Grievance Card */}
        <DpdpaGrievanceCard mahalInfo={mahal} />

        {/* App Info & Diagnostics */}
        <View style={styles.appInfoCard}>
          <View style={styles.appInfoRow}>
            <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.appInfoLabel}>MAHEALL Mobile v1.0.0 (Production Build)</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Ionicons name="cloud-done-outline" size={16} color={colors.paid} />
            <Text style={styles.appInfoLabel}>Offline Shafi'i Prayer Engine Active</Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Sign Out (ലോഗ് ഔട്ട് ചെയ്യുക)"
            onPress={() => setIsLogoutModalVisible(true)}
            variant="danger"
            icon={<Ionicons name="log-out-outline" size={18} color="#ffffff" />}
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
      />
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
  section: {
    marginVertical: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
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
  countBadge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  membersList: {
    paddingHorizontal: spacing.base,
  },
  appInfoCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  appInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: spacing.base,
    marginTop: spacing.md,
    marginBottom: spacing.base,
  },
});
