import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardSummary } from '../types/models';
import type { ApiError } from '../services/api';
import { formatAccuracy, formatDateTime } from '../utils/labels';
import { colors, fontSize, gradients, radius, shadow, spacing } from '../theme';

type IconName = keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;

export function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await dashboardService.summary());
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.center} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <EmptyState icon="cloud-offline-outline" title="Não foi possível carregar" message={error} actionLabel="Tentar novamente" onAction={load} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'operador'}</Text>
        <Text style={styles.subtitle}>Resumo da sua operação em tempo real</Text>

        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, shadow.card]}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Última precisão alcançada</Text>
              <Text style={styles.heroValue}>{formatAccuracy(data?.lastAccuracyCm)}</Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="locate" size={28} color={colors.accent} />
            </View>
          </View>
          <Text style={styles.heroFoot}>{formatDateTime(data?.lastSessionAt)}</Text>
        </LinearGradient>

        <View style={styles.grid}>
          <Metric icon="hardware-chip" label="Rovers ativos" value={`${data?.activeRovers ?? 0}/${data?.totalRovers ?? 0}`} />
          <Metric icon="radio" label="Estações online" value={`${data?.onlineBaseStations ?? 0}`} />
          <Metric icon="warning-outline" label="Ocorrências" value={`${data?.recentOccurrences ?? 0}`} tone="warning" />
          <Metric icon="trending-up" label="Sessões totais" value={`${data?.totalRovers ?? 0}`} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = 'primary',
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: 'primary' | 'warning';
}) {
  const accent = tone === 'warning' ? colors.warning : colors.primary;
  return (
    <Card style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${accent}1F` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: { padding: spacing.lg },
  greeting: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs, marginBottom: spacing.lg },
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  heroValue: { color: colors.accent, fontSize: fontSize.display, fontWeight: '800', marginTop: spacing.xs, letterSpacing: -1 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: `${colors.accent}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFoot: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metric: { width: '47%', flexGrow: 1 },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  metricValue: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800' },
  metricLabel: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 },
});
