import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { sendOtpSchema } from '@maheall/shared';
import { useAuth } from '../../lib/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();

  const [rawPhone, setRawPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setError(null);
    const cleaned = rawPhone.trim().replace(/\D/g, '');
    let formattedPhone = rawPhone.trim();

    if (!formattedPhone.startsWith('+91')) {
      if (cleaned.length === 10) {
        formattedPhone = `+91${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        formattedPhone = `+${cleaned}`;
      }
    }

    const validation = sendOtpSchema.safeParse({ phone: formattedPhone });
    if (!validation.success) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    try {
      await sendOtp(formattedPhone);
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: formattedPhone },
      });
    } catch {
      setError('Failed to send OTP. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={40} color={colors.primary} />
            </View>
            <Text style={styles.brandTitle}>MAHEALL</Text>
            <Text style={styles.brandSubtitle}>മഹല്ല് ഡിജിറ്റൽ പ്ലാറ്റ്‌ഫോം</Text>
            <Text style={styles.brandDesc}>
              Official Member Operating System for Kerala Muslim Mahals
            </Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Member Sign In</Text>
            <Text style={styles.cardSubtitle}>
              ലോഗിൻ ചെയ്യുന്നതിനായി മൊബൈൽ നമ്പർ നൽകുക
            </Text>

            <Input
              label="Registered Mobile Number"
              labelMl="മൊബൈൽ നമ്പർ"
              placeholder="98470 12345"
              keyboardType="phone-pad"
              maxLength={14}
              value={rawPhone}
              onChangeText={(text) => {
                setRawPhone(text);
                if (error) setError(null);
              }}
              error={error || undefined}
              prefix={
                <View style={styles.prefixBox}>
                  <Text style={styles.prefixText}>🇮🇳 +91</Text>
                </View>
              }
              containerStyle={{ marginTop: spacing.md }}
            />

            <Button
              title="Get OTP • ഒ.ടി.പി അയക്കുക"
              onPress={handleSendOtp}
              loading={loading}
              variant="primary"
              size="lg"
              icon={<Ionicons name="arrow-forward" size={18} color="#ffffff" />}
              style={{ marginTop: spacing.sm }}
            />

            {/* Quick Helper */}
            <View style={styles.helpBox}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.helpText}>
                Secure passwordless login via SMS OTP verification. Only registered Mahal members can access their family record.
              </Text>
            </View>
          </View>

          {/* Footer Assistance */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Number not registered with Mahal?
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerLink}>
                Contact Mahal Secretary Office / ഓഫീസ് ബന്ധപ്പെടുക
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  brandDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  prefixBox: {
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  helpText: {
    flex: 1,
    fontSize: 11,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
});
