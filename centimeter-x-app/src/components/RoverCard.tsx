import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Rover } from '../types/models';
import { colors, fontSize, radius, spacing } from '../theme';
import {
  formatAccuracy,
  roverStatusColor,
  roverStatusLabel,
  roverTypeIcon,
  roverTypeLabel,
} from '../utils/labels';
import { Badge } from './Badge';
import { Card } from './Card';

interface Props {
  rover: Rover;
  onPress: () => void;
}

export function RoverCard({ rover, onPress }: Props) {
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={roverTypeIcon[rover.type]} size={22} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {rover.name}
          </Text>
          <Text style={styles.type}>{roverTypeLabel[rover.type]}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View>
          <Text style={styles.accuracy}>{formatAccuracy(rover.lastAccuracyCm)}</Text>
          <Text style={styles.accuracyLabel}>última precisão</Text>
        </View>
        <Badge label={roverStatusLabel[rover.status]} color={roverStatusColor[rover.status]} dot />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: { flex: 1 },
  name: { color: colors.text, fontSize: fontSize.md, fontWeight: '700' },
  type: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accuracy: { color: colors.accent, fontSize: fontSize.lg, fontWeight: '800' },
  accuracyLabel: { color: colors.textFaint, fontSize: fontSize.xs, marginTop: 2 },
});
