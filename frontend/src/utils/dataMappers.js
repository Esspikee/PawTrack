import { assetUrl } from "../services/api";

const rankByLevel = {
  1: "Novato",
  2: "Explorador",
  3: "Veterano",
  4: "Heroe",
  5: "Leyenda",
};

const levelFloor = { 1: 0, 2: 10, 3: 50, 4: 150, 5: 500 };
const nextLevelAt = { 1: 10, 2: 50, 3: 150, 4: 500 };
const timezonePattern = /(Z|[+-]\d{2}:?\d{2})$/;

export function animalTitle(animal) {
  const species = animal?.especie ?? animal?.species ?? "Animal";
  const color = animal?.color_principal ?? animal?.color ?? "Sin color";
  return `${species} · ${color}`;
}

export function formatCoordinates(latitude, longitude) {
  if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    return "Ubicacion no disponible";
  }
  return `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
}

export function formatRelativeTime(value) {
  if (!value) return "Sin fecha";
  const timestamp = parseBackendDate(value).getTime();
  if (Number.isNaN(timestamp)) return "Sin fecha";

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const ranges = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [amount, unit] of ranges) {
    if (Math.abs(seconds) >= amount) {
      return formatter.format(Math.round(seconds / amount), unit);
    }
  }

  return formatter.format(seconds, "second");
}

export function formatDateTime(value) {
  if (!value) return { date: "Sin fecha", time: "" };
  const date = parseBackendDate(value);
  if (Number.isNaN(date.getTime())) return { date: "Sin fecha", time: "" };

  return {
    date: new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date),
    time: new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

export function parseBackendDate(value) {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(value);

  const normalized = value.includes("T") && !timezonePattern.test(value)
    ? `${value}Z`
    : value;
  return new Date(normalized);
}

export function mapSighting(raw) {
  const formatted = formatDateTime(raw.fecha_creacion);
  return {
    id: raw.id_avistamiento,
    animalId: raw.id_animal,
    userId: raw.id_usuario,
    latitude: Number(raw.latitud),
    longitude: Number(raw.longitud),
    location: formatCoordinates(raw.latitud, raw.longitud),
    description: raw.descripcion || "Sin descripcion.",
    photoPath: raw.foto_url,
    photoUrl: assetUrl(raw.foto_url),
    createdAt: raw.fecha_creacion,
    date: formatted.date,
    time: formatted.time,
    confirmations: raw.cantidad_confirmaciones ?? 0,
    raw,
  };
}

export function mapAnimal(raw) {
  const history = (raw.avistamientos ?? [])
    .map(mapSighting)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latest = history[0];
  const species = raw.especie;
  const color = raw.color_principal;

  return {
    id: raw.id_animal,
    name: animalTitle(raw),
    species,
    breed: color,
    color,
    avatar: species === "Gato" ? "cat" : "husky",
    photoPath: raw.foto_principal,
    photoUrl: assetUrl(raw.foto_principal),
    sightings: raw.total_avistamientos ?? history.length,
    confirmations: raw.cantidad_confirmaciones ?? 0,
    latitude: Number(raw.ultima_latitud),
    longitude: Number(raw.ultima_longitud),
    lastSeen: formatCoordinates(raw.ultima_latitud, raw.ultima_longitud),
    lastSeenAgo: formatRelativeTime(raw.fecha_ultimo_avistamiento),
    lastSeenAt: raw.fecha_ultimo_avistamiento,
    description: latest?.description || "Sin descripcion disponible.",
    discovererId: raw.id_descubridor,
    firstSeenAt: raw.fecha_primer_avistamiento,
    history,
    raw,
  };
}

export function mapUser(raw) {
  if (!raw) return null;
  const level = raw.nivel_actual ?? 1;
  const points = raw.puntos_totales ?? 0;
  const floor = levelFloor[level] ?? 0;
  const next = nextLevelAt[level];
  const progress = next ? Math.max(0, Math.min(100, ((points - floor) / (next - floor)) * 100)) : 100;

  return {
    id: raw.id_usuario,
    username: raw.username,
    email: raw.email,
    points,
    level,
    rank: rankByLevel[level] ?? "Explorador",
    xpProgress: progress,
    xpLabel: next ? `${points} / ${next} pts` : `${points} pts`,
    animalsDiscovered: raw.animales_descubiertos ?? 0,
    sightings: raw.avistamientos_realizados ?? 0,
    confirmations: raw.confirmaciones_realizadas ?? 0,
    raw,
  };
}
