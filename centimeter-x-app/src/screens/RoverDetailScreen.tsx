import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { PositioningMap } from '../components/PositioningMap';
import { roverService } from '../services/rover.service';
import { sessionService } from '../services/session.service';
import { useLocation } from '../hooks/useLocation';
import type { Rover } from '../types/models';
import type { ApiError } from '../services/api';
import type { AppStackParamList } from '../navigation/types';
import {
  formatAccuracy,
  roverStatusColor,
  roverStatusLabel,
  roverTypeLabel,
} from '../utils/labels';
import { colors, fontSize, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'RoverDetail'>;

export function RoverDetailScreen({ route, navigation }: Props) {
  const { roverId } = route.params;
  const { getCurrentPosition } = useLocation();
  const [rover, setRover] = useState<Rover | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRover(await roverService.get(roverId));
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [roverId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('RoverForm', { roverId })} hitSlop={8} style={styles.headerBtn}>
          <Ionicons name="create-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, roverId]);

  function confirmDelete() {
    Alert.alert('Excluir rover', 'Tem certeza que deseja excluir este rover? Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await roverService.remove(roverId);
            navigation.goBack();
          } catch (e) {
            setActionError((e as ApiError).message);
          }
        },
      },
    ]);
  }

  async function startSession() {
    setStarting(true);
    setActionError(null);
    try {
      const position = await getCurrentPosition();
      const session = await sessionService.start(roverId, position ?? undefined);
      navigation.navigate('SessionStatus', { sessionId: session.id });
    } catch (e) {
      const err = e as ApiError;
      setActionError(
        err.status === 409
          ? 'Ainda não há produtos GNSS disponíveis para a estação-base. Tente em instantes.'
          : err.message,
      );
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.center} />
      </Screen>
    );
  }

  if (error || !rover) {
    return (
      <Screen>
        <EmptyState title="Rover não encontrado" message={error ?? undefined} actionLabel="Voltar" onAction={navigation.goBack} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.name}>{rover.name}</Text>
          <Badge label={roverStatusLabel[rover.status]} color={roverStatusColor[rover.status]} />
        </View>
        <Text style={styles.type}>{roverTypeLabel[rover.type]}</Text>

        <Card style={styles.block}>
          <Row label="Última precisão" value={formatAccuracy(rover.lastAccuracyCm)} highlight />
        </Card>

        {rover.baseStation && rover.latitude != null && rover.longitude != null && (
          <Card style={styles.block}>
            <Text style={styles.blockTitle}>Posicionamento</Text>
            <PositioningMap
              rover={{ latitude: rover.latitude, longitude: rover.longitude, label: rover.name }}
              baseStation={{
                latitude: rover.baseStation.latitude,
                longitude: rover.baseStation.longitude,
                label: rover.baseStation.code,
              }}
            />
            <View style={styles.spaceNote}>
              <Ionicons name="planet" size={14} color={colors.accent} />
              <Text style={styles.spaceNoteText}>
                Satélites GPS/Galileo + a estação-base ({rover.baseStation.code}) corrigem a
                posição do rover, levando o erro de metros para centímetros.
              </Text>
            </View>
          </Card>
        )}

        {rover.baseStation && (
          <Card style={styles.block}>
            <Text style={styles.blockTitle}>Estação-base</Text>
            <Row label="Código" value={rover.baseStation.code} />
            <Row label="Nome" value={rover.baseStation.name} />
            {rover.baseStation.constellations?.length ? (
              <Row label="Constelações" value={rover.baseStation.constellations.join(' + ')} />
            ) : null}
          </Card>
        )}

        {!!actionError && <Text style={styles.actionError}>{actionError}</Text>}

        <PrimaryButton title="Iniciar sessão de correção" icon="locate" onPress={startSession} loading={starting} style={styles.cta} />
        <PrimaryButton
          title="Registrar ocorrência"
          variant="secondary"
          icon="warning-outline"
          onPress={() => navigation.navigate('NewOccurrence', { roverId })}
          style={styles.secondaryCta}
        />
        <PrimaryButton title="Excluir rover" variant="danger" icon="trash-outline" onPress={confirmDelete} style={styles.deleteCta} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: { padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.text, fontSize: fontSize.xl, fontWeight: '800', flex: 1, marginRight: spacing.sm },
  type: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: spacing.xs, marginBottom: spacing.md },
  block: { marginBottom: spacing.md },
  blockTitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.sm },
  spaceNote: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.md },
  spaceNoteText: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 17, marginLeft: spacing.xs, flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { color: colors.textMuted, fontSize: fontSize.sm },
  rowValue: { color: colors.text, fontSize: fontSize.sm, fontWeight: '600' },
  rowHighlight: { color: colors.accent, fontSize: fontSize.md, fontWeight: '800' },
  actionError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  cta: { marginTop: spacing.sm },
  secondaryCta: { marginTop: spacing.md },
  deleteCta: { marginTop: spacing.md },
  headerBtn: { marginRight: spacing.md },
});
