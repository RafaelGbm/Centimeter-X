import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { OptionPicker } from '../components/OptionPicker';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLocation } from '../hooks/useLocation';
import { useCamera } from '../hooks/useCamera';
import { occurrenceService } from '../services/occurrence.service';
import type { OccurrenceType } from '../types/models';
import type { ApiError } from '../services/api';
import type { AppStackParamList } from '../navigation/types';
import { occurrenceTypeLabel } from '../utils/labels';
import { colors, fontSize, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'NewOccurrence'>;

const TYPE_OPTIONS = (Object.keys(occurrenceTypeLabel) as OccurrenceType[]).map((t) => ({
  value: t,
  label: occurrenceTypeLabel[t],
}));

export function NewOccurrenceScreen({ route, navigation }: Props) {
  const { roverId } = route.params;
  const location = useLocation();
  const camera = useCamera();

  const [type, setType] = useState<OccurrenceType | null>(null);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function captureLocation() {
    const pos = await location.getCurrentPosition();
    if (pos) setCoords(pos);
  }

  async function capturePhoto() {
    const uri = await camera.takePhoto();
    if (uri) setPhotoUri(uri);
  }

  async function onSubmit() {
    const typeErr = type ? null : 'Selecione o tipo.';
    const locErr = coords ? null : 'Capture a localização.';
    const photoErr = photoUri ? null : 'Anexe uma foto.';
    setErrors({ type: typeErr, location: locErr, photo: photoErr });
    setFormError(null);
    if (typeErr || locErr || photoErr) return;

    setSaving(true);
    try {
      await occurrenceService.create({
        roverId,
        type: type as OccurrenceType,
        description: description.trim(),
        latitude: coords!.latitude,
        longitude: coords!.longitude,
        photoUri: photoUri!,
      });
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
        <OptionPicker label="Tipo de ocorrência" options={TYPE_OPTIONS} value={type} onChange={setType} error={errors.type} />

        <FormInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          placeholder="Descreva o que aconteceu (opcional)"
          multiline
          maxLength={500}
        />

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Localização (GPS)</Text>
          <Text style={styles.coords}>
            {coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : 'Não capturada'}
          </Text>
          {location.permissionDenied && (
            <Text style={styles.permission}>Permissão negada. Habilite a localização nas configurações do aparelho.</Text>
          )}
          {!!errors.location && !coords && <Text style={styles.fieldError}>{errors.location}</Text>}
          <PrimaryButton
            title={coords ? 'Atualizar localização' : 'Capturar localização'}
            variant="secondary"
            icon="navigate"
            onPress={captureLocation}
            loading={location.loading}
            style={styles.inlineBtn}
          />
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Foto (câmera)</Text>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          ) : (
            <Text style={styles.coords}>Nenhuma foto anexada</Text>
          )}
          {camera.permissionDenied && (
            <Text style={styles.permission}>Permissão negada. Habilite a câmera nas configurações do aparelho.</Text>
          )}
          {!!errors.photo && !photoUri && <Text style={styles.fieldError}>{errors.photo}</Text>}
          <PrimaryButton
            title={photoUri ? 'Tirar outra foto' : 'Abrir câmera'}
            variant="secondary"
            icon="camera"
            onPress={capturePhoto}
            loading={camera.loading}
            style={styles.inlineBtn}
          />
        </Card>

        {!!formError && <Text style={styles.formError}>{formError}</Text>}

        <PrimaryButton title="Registrar ocorrência" icon="send" onPress={onSubmit} loading={saving} style={styles.submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg },
  block: { marginBottom: spacing.md },
  blockTitle: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.xs },
  coords: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  permission: { color: colors.warning, fontSize: fontSize.xs, marginTop: spacing.xs },
  fieldError: { color: colors.danger, fontSize: fontSize.xs, marginTop: spacing.xs },
  inlineBtn: { marginTop: spacing.md, height: 44 },
  preview: { width: '100%', height: 200, borderRadius: radius.md, marginBottom: spacing.sm },
  formError: { color: colors.danger, fontSize: fontSize.sm, marginBottom: spacing.sm },
  submit: { marginTop: spacing.sm },
});
