import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../theme';
import { distanceKm, regionForPoints, type LatLng } from '../utils/geo';

interface Props {
  rover: LatLng & { label: string };
  baseStation: LatLng & { label: string };
}

export function PositioningMap({ rover, baseStation }: Props) {
  const baseline = distanceKm(rover, baseStation);
  const region = regionForPoints(rover, baseStation);

  return (
    <View style={styles.wrap}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={region}
        pointerEvents="none"
      >
        <Polyline
          coordinates={[rover, baseStation]}
          strokeColor={colors.accent}
          strokeWidth={2}
          lineDashPattern={[6, 6]}
        />
        <Marker coordinate={baseStation} title={baseStation.label} description="Estação-base GNSS">
          <View style={[styles.pin, styles.pinBase]}>
            <Ionicons name="radio" size={16} color={colors.bgTop} />
          </View>
        </Marker>
        <Marker coordinate={rover} title={rover.label} description="Rover (recebe a correção)">
          <View style={[styles.pin, styles.pinRover]}>
            <Ionicons name="locate" size={16} color={colors.white} />
          </View>
        </Marker>
      </MapView>

      <View style={styles.baselineTag}>
        <Ionicons name="resize" size={13} color={colors.accent} />
        <Text style={styles.baselineText}>baseline {baseline.toFixed(1)} km</Text>
      </View>

      <View style={styles.legend}>
        <Legend color={colors.accent} label="Estação-base" />
        <Legend color={colors.primary} label="Rover" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  map: { height: 200, width: '100%' },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  pinBase: { backgroundColor: colors.accent },
  pinRover: { backgroundColor: colors.primary },
  baselineTag: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  baselineText: { color: colors.text, fontSize: fontSize.xs, fontWeight: '700', marginLeft: 4 },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
});
