export function validPosition(p) {
  return Boolean(p && p.latitude !== "" && p.longitude !== "" && p.latitude != null && p.longitude != null
    && Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
    && Math.abs(Number(p.latitude)) <= 90 && Math.abs(Number(p.longitude)) <= 180);
}
export function distanceKm(a, b) {
  if (!validPosition(a) || !validPosition(b)) return null;
  const rad = value => Number(value) * Math.PI / 180;
  const h = Math.sin((rad(b.latitude) - rad(a.latitude)) / 2) ** 2
    + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin((rad(b.longitude) - rad(a.longitude)) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function distanceLabel(distance) {
  if (distance == null) return null;
  return distance < 1 ? `A ${Math.round(distance * 100) * 10} m` : `A ${distance.toFixed(1)} km`;
}
export function sortNearby(animals, position) {
  return animals.map(animal => ({ ...animal, distance: distanceKm(position, animal) }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity) || new Date(b.lastSeenAt) - new Date(a.lastSeenAt));
}
