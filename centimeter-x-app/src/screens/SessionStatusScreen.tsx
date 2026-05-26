import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { sessionService } from '../services/session.service';
import type { CorrectionSession } from '../types/models';
import type { ApiError } from '../services/api';
import type { AppStackParamList } from '../navigation/types';
import { fixStatusColor, fixStatusLabel, formatAccuracy, formatDateTime } from '../utils/labels';
import { colors, fontSize, gradients, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'SessionStatus'>;

export function SessionStatusScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<CorrectionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSession(await sessionService.get(sessionId));
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

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

  if (error || !session) {
    return (
      <Screen>
        <EmptyState title="Sessão não encontrada" message={error ?? undefined} actionLabel="Voltar" onAction={navigation.goBack} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <LinearGradient colors={gradients.precision} style={[styles.ring, shadow.glow]}>
            <View style={styles.ringInner}>
              <Text style={styles.ringValue}>{session.horizontalAccuracyCm.toFixed(1)}</Text>
              <Text style={styles.ringUnit}>cm horizontal</Text>
            </View>
          </LinearGradient>
          <Badge label={fixStatusLabel[session.fixStatus]} color={fixStatusColor[session.fixStatus]} dot />
        </View>

        <Card style={styles.block}>
          <Row label="Precisão vertical" value={formatAccuracy(session.verticalAccuracyCm)} />
          <Row label="Constelação" value={session.constellation} />
          <Row label="Satélites usados" value={String(session.satellitesUsed)} />
          <Row label="Fonte de correção" value={session.correctionSource} />
          <Row label="Estação-base" value={session.baseStationCode ?? String(session.baseStationId)} />
          <Row label="Início" value={formatDateTime(session.startedAt)} />
        </Card>

        <PrimaryButton title="Atualizar" variant="secondary" icon="refresh" onPress={load} style={styles.refresh} />
        <PrimaryButton title="Concluir" icon="checkmark-done" onPress={() => navigation.goBack()} style={styles.done} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: { padding: spacing.lg },
  heroWrap: { alignItems: 'center', paddingVertical: spacing.lg, marginBottom: spacing.md },
  ring: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ringInner: {
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: { color: colors.accent, fontSize: 52, fontWeight: '800', letterSpacing: -1 },
  ringUnit: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  block: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  rowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  refresh: { marginTop: spacing.sm },
  done: { marginTop: spacing.md },
});
