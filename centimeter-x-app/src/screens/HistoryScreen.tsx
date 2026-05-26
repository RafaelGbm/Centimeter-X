import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { sessionService } from '../services/session.service';
import { occurrenceService } from '../services/occurrence.service';
import type { CorrectionSession, Occurrence } from '../types/models';
import type { ApiError } from '../services/api';
import {
  fixStatusColor,
  fixStatusLabel,
  formatAccuracy,
  formatDateTime,
  occurrenceTypeIcon,
  occurrenceTypeLabel,
} from '../utils/labels';
import { colors, fontSize, radius, spacing } from '../theme';

type Tab = 'sessions' | 'occurrences';

export function HistoryScreen() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [sessions, setSessions] = useState<CorrectionSession[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, o] = await Promise.all([
        sessionService.list({ size: 50 }),
        occurrenceService.list({ size: 50 }),
      ]);
      setSessions(s.content);
      setOccurrences(o.content);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen padded={false}>
      <View style={styles.tabs}>
        <TabButton label="Sessões" active={tab === 'sessions'} onPress={() => setTab('sessions')} />
        <TabButton label="Ocorrências" active={tab === 'occurrences'} onPress={() => setTab('occurrences')} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : error ? (
        <EmptyState title="Erro ao carregar" message={error} actionLabel="Tentar novamente" onAction={load} />
      ) : tab === 'sessions' ? (
        <FlatList
          data={sessions}
          keyExtractor={(item) => `s-${item.id}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="Sem sessões ainda" message="Inicie uma sessão de correção em um rover." />}
          renderItem={({ item }) => (
            <Card style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.accuracy}>{formatAccuracy(item.horizontalAccuracyCm)}</Text>
                <Badge label={fixStatusLabel[item.fixStatus]} color={fixStatusColor[item.fixStatus]} />
              </View>
              <Text style={styles.meta}>{item.constellation} · {item.correctionSource}</Text>
              <Text style={styles.date}>{formatDateTime(item.startedAt)}</Text>
            </Card>
          )}
        />
      ) : (
        <FlatList
          data={occurrences}
          keyExtractor={(item) => `o-${item.id}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState title="Sem ocorrências" message="Registre uma ocorrência de campo em um rover." />}
          renderItem={({ item }) => (
            <Card style={styles.item}>
              <View style={styles.occHeader}>
                <View style={styles.occIcon}>
                  <Ionicons name={occurrenceTypeIcon[item.type]} size={18} color={colors.warning} />
                </View>
                <Text style={styles.occType}>{occurrenceTypeLabel[item.type]}</Text>
              </View>
              {!!item.description && <Text style={styles.meta}>{item.description}</Text>}
              <Text style={styles.meta}>{item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</Text>
              <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: fontSize.sm },
  tabTextActive: { color: colors.white },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  item: { marginBottom: spacing.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accuracy: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  occHeader: { flexDirection: 'row', alignItems: 'center' },
  occIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: `${colors.warning}1F`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  occType: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs },
  date: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.xs },
});
