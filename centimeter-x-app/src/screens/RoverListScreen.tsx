import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Screen } from '../components/Screen';
import { RoverCard } from '../components/RoverCard';
import { EmptyState } from '../components/EmptyState';
import { FormInput } from '../components/FormInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { roverService } from '../services/rover.service';
import type { Rover } from '../types/models';
import type { ApiError } from '../services/api';
import type { AppStackParamList, MainTabParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Rovers'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function RoverListScreen({ navigation }: Props) {
  const [rovers, setRovers] = useState<Rover[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (query?: string) => {
    setError(null);
    try {
      const page = await roverService.list({ search: query || undefined, size: 50 });
      setRovers(page.content);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(search);
    }, [load]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Screen padded={false}>
      <View style={styles.headerArea}>
        <FormInput
          label="Buscar rover"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load(search)}
          returnKeyType="search"
          placeholder="Nome do dispositivo"
        />
        <PrimaryButton title="Novo rover" icon="add" onPress={() => navigation.navigate('RoverForm')} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.center} />
      ) : error ? (
        <EmptyState title="Erro ao carregar" message={error} actionLabel="Tentar novamente" onAction={() => load(search)} />
      ) : rovers.length === 0 ? (
        <EmptyState
          title="Nenhum rover encontrado"
          message="Cadastre seu primeiro dispositivo para iniciar sessões de correção."
          actionLabel="Cadastrar rover"
          onAction={() => navigation.navigate('RoverForm')}
        />
      ) : (
        <FlatList
          data={rovers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RoverCard rover={item} onPress={() => navigation.navigate('RoverDetail', { roverId: item.id })} />
          )}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(search);
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerArea: { padding: spacing.lg, paddingBottom: spacing.sm },
  center: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
});
