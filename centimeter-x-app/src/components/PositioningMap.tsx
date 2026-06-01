import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, radius, spacing } from '../theme';
import { distanceKm, type LatLng } from '../utils/geo';

interface Props {
  rover: LatLng & { label: string };
  baseStation: LatLng & { label: string };
}

// Mapa renderizado via Leaflet + tiles OpenStreetMap dentro de um WebView.
// Não depende do SDK do Google Maps (nem da sua chave), então funciona em
// qualquer ambiente/build standalone, inclusive onde os servidores do Google
// estão indisponíveis. Rover e estação-base aparecem com a baseline entre eles.
function buildHtml(rover: Props['rover'], baseStation: Props['baseStation']): string {
  const esc = (s: string) => s.replace(/'/g, '\\u0027').replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: ${colors.background}; }
    .leaflet-container { background: ${colors.background}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var rover = [${rover.latitude}, ${rover.longitude}];
    var base  = [${baseStation.latitude}, ${baseStation.longitude}];
    var map = L.map('map', { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.polyline([rover, base], { color: '${colors.accent}', weight: 2, dashArray: '6,6' }).addTo(map);
    L.circleMarker(base, { radius: 8, color: '#fff', weight: 2, fillColor: '${colors.accent}', fillOpacity: 1 })
      .addTo(map).bindTooltip('${esc(baseStation.label)}', { permanent: false });
    L.circleMarker(rover, { radius: 8, color: '#fff', weight: 2, fillColor: '${colors.primary}', fillOpacity: 1 })
      .addTo(map).bindTooltip('${esc(rover.label)}', { permanent: false });
    map.fitBounds([rover, base], { padding: [28, 28], maxZoom: 14 });
  </script>
</body>
</html>`;
}

export function PositioningMap({ rover, baseStation }: Props) {
  const baseline = distanceKm(rover, baseStation);
  const html = buildHtml(rover, baseStation);

  return (
    <View style={styles.wrap}>
      <WebView
        style={styles.map}
        originWhitelist={['*']}
        source={{ html }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        androidLayerType="hardware"
        pointerEvents="none"
      />

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
  map: { height: 200, width: '100%', backgroundColor: colors.background },
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
