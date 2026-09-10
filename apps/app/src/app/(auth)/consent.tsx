import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth-context';

export default function ConsentScreen() {
  const router = useRouter();
  const { submitConsent } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAgreeAndProceed = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await submitConsent();
      router.replace('/(tabs)');
    } catch {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Privacy Notice & Consent</Text>
          <Text style={styles.titleMl}>വ്യക്തിവിവര സംരക്ഷണ സമ്മതപത്രം</Text>
          <Text style={styles.subtitle}>
            Digital Personal Data Protection Act (DPDPA 2023)
          </Text>
        </View>

        {/* Scrollable Terms Body */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.card}>
            {/* Malayalam Section */}
            <Text style={styles.sectionHeadingMl}>1. വിവര ശേഖരണത്തിന്റെ ഉദ്ദേശ്യം:</Text>
            <Text style={styles.bodyTextMl}>
              മഹല്ല് ജമാഅത്ത് ഭരണനിർവഹണം, മാസവരി വിഹിതം രേഖപ്പെടുത്തൽ, മദ്രസാ വിദ്യാർത്ഥികളുടെ വിവരങ്ങൾ, സാന്ത്വന സഹായങ്ങൾ, മരണ അറിയിപ്പുകൾ എന്നിവ കൃത്യമായി ഏകോപിപ്പിക്കുന്നതിനായി നിങ്ങളുടെയും കുടുംബാംഗങ്ങളുടെയും വ്യക്തിവിവരങ്ങൾ മഹല്ല് കമ്മിറ്റി ഡിജിറ്റലായി സൂക്ഷിക്കുന്നു.
            </Text>

            {/* English Section */}
            <Text style={styles.sectionHeading}>2. Scope of Data Collection:</Text>
            <Text style={styles.bodyText}>
              • Head of family & member names, dates of birth, blood groups, and occupations.{'\n'}
              • Monthly Pirivu financial contribution records and digital receipts.{'\n'}
              • Madrasa student enrollments, exam records, and welfare requests.
            </Text>

            <Text style={styles.sectionHeading}>3. Confidentiality & Rights:</Text>
            <Text style={styles.bodyText}>
              Your data will remain strictly confidential and will not be shared with any third-party commercial entities. You retain the full legal right under DPDPA 2023 to view, update, or seek grievance redressal directly via the Mahal Secretary.
            </Text>
          </View>

          {/* Explicit Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed ? styles.checkboxChecked : null]}>
              {agreed ? <Ionicons name="checkmark" size={16} color="#ffffff" /> : null}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the privacy policy for processing my family data pursuant to DPDPA 2023. (സമ്മതിക്കുന്നു)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            title="Agree & Continue (സമ്മതിക്കുന്നു)"
            onPress={handleAgreeAndProceed}
            disabled={!agreed}
            loading={loading}
            variant="primary"
            size="lg"
            icon={<Ionicons name="checkmark-circle" size={20} color="#ffffff" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  titleMl: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionHeadingMl: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  bodyTextMl: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
