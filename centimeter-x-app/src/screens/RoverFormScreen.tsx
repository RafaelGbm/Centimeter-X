import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
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

export function RoverFormScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<RoverType | null>(null);
  const [stationId, setStationId] = useState<number | null>(null);
  const [stations, setStations] = useState<BaseStation[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    stationService
      .list()
      .then(setStations)
      .catch((e) => setFormError((e as ApiError).message));
  }, []);

  async function onSubmit() {
    const nameErr = validateName(name);
    const typeErr = type ? null : 'Selecione o tipo.';
    const stationErr = stationId ? null : 'Selecione a estação-base.';
    setErrors({ name: nameErr, type: typeErr, station: stationErr });
    setFormError(null);
    if (nameErr || typeErr || stationErr) return;

    setSaving(true);
    try {
      await roverService.create({ name: name.trim(), type: type as RoverType, baseStationId: stationId as number });
      navigation.goBack();
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
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

        <PrimaryButton title="Salvar rover" icon="save-outline" onPress={onSubmit} loading={saving} style={styles.submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  formError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.md },
});
