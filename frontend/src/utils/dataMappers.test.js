import { describe, expect, it, vi } from "vitest";
import { animalTitle, formatCoordinates, formatRelativeTime, mapAnimal, mapSighting, mapUser } from "./dataMappers";

const animalResponse = {
  id_animal: "11111111-1111-1111-1111-111111111111",
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
      level: 2,
      points: 35,
      sightings: 12,
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
