import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadows } from '../../theme/spacing';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { verifyOtpSchema } from '@maheall/shared';
import { useAuth } from '../../lib/auth-context';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone || '+919847123456';

  const { verifyOtp, sendOtp } = useAuth();

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async () => {
    setError(null);
    const cleanedOtp = otp.trim();

    const validation = verifyOtpSchema.safeParse({ phone, otp: cleanedOtp });
    if (!validation.success) {
      setError('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    setLoading(true);
    try {
      const success = await verifyOtp(phone, cleanedOtp);
      if (success) {
        // Navigation is handled reactively by _layout.tsx based on consent state
      } else {
        setError('Invalid or expired OTP. Please try again.');
      }
    } catch {
      setError('Authentication failed. Please verify the code and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setResending(true);
    setError(null);
    try {
      await sendOtp(phone);
      setTimer(60);
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbox-ellipses-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Enter 6-Digit OTP</Text>
            <Text style={styles.titleMl}>ഒ.ടി.പി നമ്പർ നൽകുക</Text>
            <Text style={styles.phoneLabel}>
              Sent to <Text style={styles.phoneText}>{phone}</Text>
            </Text>
          </View>

          {/* Verification Card */}
          <View style={styles.card}>
            <Input
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (error) setError(null);
              }}
              error={error || undefined}
              inputStyle={styles.otpInput}
              containerStyle={{ marginBottom: spacing.lg }}
            />

            <Button
              title="Verify & Continue • ലോഗിൻ ചെയ്യുക"
              onPress={handleVerify}
              loading={loading}
              variant="primary"
              size="lg"
            />

            {/* Timer & Resend */}
            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>
                  Resend OTP in <Text style={styles.timerBold}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resending}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendLink}>
                    {resending ? 'Sending...' : 'Resend OTP (വീണ്ടും അയക്കുക)'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
    padding: spacing.xl,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.base,
    left: spacing.xl,
    padding: spacing.xs,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  titleMl: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
    marginTop: 2,
  },
  phoneLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  phoneText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  otpInput: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: colors.textPrimary,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  timerText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  timerBold: {
    fontWeight: '700',
    color: colors.primary,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
