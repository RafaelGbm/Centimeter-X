import { StyleSheet, Text, View } from 'react-native';
import { fontSize, radius, spacing } from '../theme';

interface Props {
  label: string;
  color: string;
  dot?: boolean;
}

export function Badge({ label, color, dot }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1F`, borderColor: `${color}55` }]}>
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  text: { fontSize: fontSize.xs, fontWeight: '700', letterSpacing: 0.2 },
});
