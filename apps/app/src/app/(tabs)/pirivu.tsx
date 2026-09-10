import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/ui/Header';
import { MonthStatusGrid } from '../../components/pirivu/MonthStatusGrid';
import { ArrearsSummaryCard } from '../../components/pirivu/ArrearsSummaryCard';
import { ReceiptModal } from '../../components/pirivu/ReceiptModal';
import { PaymentInstructionModal } from '../../components/pirivu/PaymentInstructionModal';
import { useAuth } from '../../lib/auth-context';
import { FamilyPirivuMonthStatus } from '@maheall/shared';

export default function PirivuScreen() {
  const { pirivuStatus, family, mahal, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [selectedPaidMonth, setSelectedPaidMonth] = useState<FamilyPirivuMonthStatus | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const monthlyList = pirivuStatus?.monthly_status || [];
  const unpaidCount = pirivuStatus?.unpaid_months_count || 0;
  const monthlyRate = parseFloat(pirivuStatus?.pirivu_amount || '200');
  const overdueTotal = unpaidCount * monthlyRate;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Pirivu Dues & Receipts"
        subtitle="Monthly Mahal Contribution"
        subtitleMl="മാസവരി വിഹിതം"
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
        {/* Financial Summary Card */}
        <ArrearsSummaryCard
          status={pirivuStatus}
          onPayNow={() => setIsPaymentModalVisible(true)}
        />

        {/* 12-Month Status Grid */}
        <MonthStatusGrid
          monthlyStatus={monthlyList}
          onSelectPaidMonth={(month) => setSelectedPaidMonth(month)}
          onSelectUnpaidMonth={() => setIsPaymentModalVisible(true)}
        />
      </ScrollView>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        visible={!!selectedPaidMonth}
        onClose={() => setSelectedPaidMonth(null)}
        item={selectedPaidMonth}
        familyHouseName={family?.house_name}
        familyHouseNameMl={family?.house_name_ml}
        familyNumber={family?.family_number}
        wardName={family?.ward?.name}
        headName={family?.head_member?.name}
        mahalInfo={mahal}
      />

      {/* Payment Instruction Modal */}
      <PaymentInstructionModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        unpaidAmount={overdueTotal > 0 ? overdueTotal : monthlyRate}
        familyNumber={family?.family_number}
        mahalInfo={mahal}
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
});
