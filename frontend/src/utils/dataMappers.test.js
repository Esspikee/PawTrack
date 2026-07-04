import { describe, expect, it, vi } from "vitest";
import { animalTitle, formatCoordinates, formatRelativeTime, mapAchievementsResponse, mapAnimal, mapSighting, mapUser } from "./dataMappers";

const animalResponse = {
  id_animal: "11111111-1111-1111-1111-111111111111",
  nombre: null,
  especie: "Gato",
  color_principal: "Negro",
  foto_principal: "/uploads/cat.jpg",
  total_avistamientos: 2,
  ultima_latitud: 4.711,
  ultima_longitud: -74.0721,
  fecha_ultimo_avistamiento: "2026-06-20T20:00:00Z",
  cantidad_confirmaciones: 3,
  id_descubridor: "22222222-2222-2222-2222-222222222222",
  fecha_primer_avistamiento: "2026-06-19T20:00:00Z",
  avistamientos: [
    {
      id_avistamiento: "33333333-3333-3333-3333-333333333333",
      id_animal: "11111111-1111-1111-1111-111111111111",
      id_usuario: "22222222-2222-2222-2222-222222222222",
      latitud: 4.711,
      longitud: -74.0721,
      descripcion: "Cerca del parque",
      foto_url: "/uploads/cat.jpg",
      fecha_creacion: "2026-06-20T20:00:00Z",
      cantidad_confirmaciones: 3,
    },
  ],
};

describe("backend data mappers", () => {
  it("uses Especie · Color as the animal title everywhere", () => {
    expect(animalTitle(animalResponse)).toBe("Gato · Negro");
    expect(mapAnimal(animalResponse).name).toBe("Gato · Negro");
  });

  it("prefers a custom animal name when one exists", () => {
    expect(animalTitle({ ...animalResponse, nombre: "Milo" })).toBe("Milo");
    expect(mapAnimal({ ...animalResponse, nombre: "Milo" })).toMatchObject({
      customName: "Milo",
      name: "Milo",
    });
  });

  it("maps UUID, coordinates, image and sightings without mock-only fields", () => {
    const animal = mapAnimal(animalResponse);
    expect(animal.id).toBe(animalResponse.id_animal);
    expect(animal.avatar).toBe("cat");
    expect(animal.photoUrl).toBe("http://127.0.0.1:8000/uploads/cat.jpg");
    expect(animal.lastSeen).toBe("4.71100, -74.07210");
    expect(animal.sightings).toBe(2);
    expect(animal.description).toBe("Cerca del parque");
  });

  it("maps sightings and profile statistics from backend names", () => {
    const sighting = mapSighting(animalResponse.avistamientos[0]);
    const user = mapUser({
      id_usuario: "user-id",
      username: "laura",
      email: "laura@example.com",
      puntos_totales: 35,
      puntos_logros: 5,
      nivel_actual: 2,
      animales_descubiertos: 4,
      avistamientos_realizados: 12,
      confirmaciones_realizadas: 8,
    });

    expect(sighting.userId).toBe(animalResponse.avistamientos[0].id_usuario);
    expect(sighting.confirmations).toBe(3);
    expect(user).toMatchObject({
      animalsDiscovered: 4,
      confirmations: 8,
      achievementPoints: 5,
      level: 2,
      points: 35,
      sightings: 12,
    });
  });

  it("maps Patitas, categories, rarity and achievement progress", () => {
    const mapped = mapAchievementsResponse({
      patitas: 15,
      puntos_logros: 5,
      categorias: [{ id: "dog_breeds", label: "Razas de perros", icon: "paw" }],
      rarezas: [{ id: "common", label: "Comun" }],
      logros: [{
        clave: "three_huskies",
        titulo: "Llamado de manada I",
        descripcion: "Registra 3 huskies.",
        icono: "paw",
        puntos: 5,
        patitas: 5,
        objetivo: 3,
        progreso: 2,
        completado: false,
        categoria: "dog_breeds",
        categoria_titulo: "Razas de perros",
        rareza: "common",
        rareza_titulo: "Comun",
        oculto: false,
        fecha_desbloqueo: null,
      }],
    });

    expect(mapped.achievementPoints).toBe(15);
    expect(mapped.categories).toHaveLength(1);
    expect(mapped.rarities).toHaveLength(1);
    expect(mapped.achievements[0]).toMatchObject({
      category: "dog_breeds",
      categoryLabel: "Razas de perros",
      completed: false,
      current: 2,
      goal: 3,
      hidden: false,
      id: "three_huskies",
      pawPrintReward: 5,
      points: 5,
      rarity: "common",
      rarityLabel: "Comun",
      value: "2/3",
    });
    expect(mapped.achievements[0].progress).toBeCloseTo(66.66, 1);
  });

  it("maps locked hidden achievements without revealing extra fields", () => {
    const mapped = mapAchievementsResponse({
      patitas: 0,
      logros: [{
        clave: "lucky_encounter",
        titulo: "???",
        descripcion: "Logro oculto",
        icono: "lock",
        puntos: 100,
        patitas: 100,
        objetivo: 1,
        progreso: 0,
        completado: false,
        categoria: "hidden",
        categoria_titulo: "Ocultos",
        rareza: "rare",
        rareza_titulo: "Raro",
        oculto: true,
        fecha_desbloqueo: null,
      }],
    });

    expect(mapped.achievements[0]).toMatchObject({
      detail: "Logro oculto",
      hidden: true,
      label: "???",
      pawPrintReward: 100,
      progress: 0,
    });
  });

  it("formats coordinates defensively", () => {
    expect(formatCoordinates("bad", -74)).toBe("Ubicacion no disponible");
  });

  it("treats backend ISO timestamps without timezone as UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-27T18:05:47Z"));

    expect(formatRelativeTime("2026-06-27T18:05:46")).toBe(formatRelativeTime("2026-06-27T18:05:46Z"));

    vi.useRealTimers();
  });
});
