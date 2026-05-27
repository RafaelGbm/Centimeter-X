import { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { FormInput } from '../components/FormInput';
import { OptionPicker } from '../components/OptionPicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { roverService } from '../services/rover.service';
import { stationService } from '../services/station.service';
import type { BaseStation, RoverType } from '../types/models';
import type { ApiError } from '../services/api';
import type { AppStackParamList } from '../navigation/types';
import { roverTypeLabel } from '../utils/labels';
import { validateName } from '../utils/validators';
import { colors, fontSize, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'RoverForm'>;

const TYPE_OPTIONS = (Object.keys(roverTypeLabel) as RoverType[]).map((t) => ({
  value: t,
  label: roverTypeLabel[t],
}));

export function RoverFormScreen({ route, navigation }: Props) {
  const roverId = route.params?.roverId;
  const isEdit = roverId != null;

  const [name, setName] = useState('');
  const [type, setType] = useState<RoverType | null>(null);
  const [stationId, setStationId] = useState<number | null>(null);
  const [stations, setStations] = useState<BaseStation[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Editar rover' : 'Novo rover' });
  }, [navigation, isEdit]);

  useEffect(() => {
    stationService
      .list()
      .then(setStations)
      .catch((e) => setFormError((e as ApiError).message));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    roverService
      .get(roverId)
      .then((r) => {
        setName(r.name);
        setType(r.type);
        setStationId(r.baseStationId ?? null);
      })
      .catch((e) => setFormError((e as ApiError).message))
      .finally(() => setLoading(false));
  }, [isEdit, roverId]);

  async function onSubmit() {
    const nameErr = validateName(name);
    const typeErr = type ? null : 'Selecione o tipo.';
    const stationErr = stationId ? null : 'Selecione a estação-base.';
    setErrors({ name: nameErr, type: typeErr, station: stationErr });
    setFormError(null);
    if (nameErr || typeErr || stationErr) return;

    setSaving(true);
    try {
      const payload = { name: name.trim(), type: type as RoverType, baseStationId: stationId as number };
      if (isEdit) {
        await roverService.update(roverId, payload);
      } else {
        await roverService.create(payload);
      }
      navigation.goBack();
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.center} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FormInput label="Nome do rover" value={name} onChangeText={setName} error={errors.name} placeholder="Ex.: Trator 01" />

        <OptionPicker label="Tipo" options={TYPE_OPTIONS} value={type} onChange={setType} error={errors.type} />

        <OptionPicker
          label="Estação-base"
          options={stations.map((s) => ({ value: s.id, label: `${s.code} · ${s.name}` }))}
          value={stationId}
          onChange={setStationId}
          error={errors.station}
        />

        {!!formError && <Text style={styles.formError}>{formError}</Text>}

        <PrimaryButton
          title={isEdit ? 'Salvar alterações' : 'Salvar rover'}
          icon="save-outline"
          onPress={onSubmit}
          loading={saving}
          style={styles.submit}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: { padding: spacing.lg },
  formError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.md },
});
