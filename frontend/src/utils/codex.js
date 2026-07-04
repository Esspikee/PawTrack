import { BREEDS, CAT_BREEDS, DOG_BREEDS } from "../data/breeds";
import { parseBackendDate } from "./dataMappers";

const typeToSpecies = {
  cat: "Gato",
  dog: "Perro",
};

export function normalizeCodexText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function textMatchesBreed(value, breed) {
  const normalizedValue = normalizeCodexText(value);
  if (!normalizedValue) return false;

  const breedName = normalizeCodexText(breed.displayName);
  const breedId = normalizeCodexText(breed.id);
  return normalizedValue.split(" ").includes(breedName)
    || normalizedValue.includes(breedName)
    || normalizedValue.split(" ").includes(breedId)
    || normalizedValue.includes(breedId);
}

export function animalMatchesBreed(animal, sighting, breed) {
  if (animal.species !== typeToSpecies[breed.animalType]) return false;

  const searchableFields = [
    animal.breed,
    animal.color,
    animal.customName,
    animal.name,
    animal.raw?.color_principal,
    animal.raw?.nombre,
    sighting?.description,
    sighting?.raw?.descripcion,
  ];

  return searchableFields.some((field) => textMatchesBreed(field, breed));
}

function sortSightingsByDate(sightings, direction = "asc") {
  return [...sightings].sort((a, b) => {
    const first = parseBackendDate(a.sighting.createdAt).getTime();
    const second = parseBackendDate(b.sighting.createdAt).getTime();
    return direction === "asc" ? first - second : second - first;
  });
}

export function buildBreedEntries({
  animals = [],
  breedList = [],
  currentUserId,
  historiesByAnimalId = {},
} = {}) {
  return breedList.map((breed) => {
    const matches = [];

    for (const animal of animals) {
      const history = historiesByAnimalId[animal.id] ?? animal.history ?? [];
      for (const sighting of history) {
        if (sighting.userId !== currentUserId) continue;
        if (animalMatchesBreed(animal, sighting, breed)) {
          matches.push({ animal, sighting });
        }
      }
    }

    if (matches.length === 0) {
      return {
        animalType: breed.animalType,
        breed,
        discovered: false,
        id: breed.id,
      };
    }

    const first = sortSightingsByDate(matches, "asc")[0];
    const recent = sortSightingsByDate(matches, "desc")[0];

    return {
      animalType: breed.animalType,
      breed,
      discovered: true,
      firstPhotoUrl: first.sighting.photoUrl || first.animal.photoUrl,
      firstSightingAt: first.sighting.createdAt,
      firstSightingDate: first.sighting.date,
      id: breed.id,
      recentDescription: recent.sighting.description,
      recentLocation: recent.sighting.location,
      totalSightings: matches.length,
    };
  });
}

export function getProgress(entries) {
  const discovered = entries.filter((entry) => entry.discovered).length;
  const total = entries.length;
  return {
    discovered,
    percent: total > 0 ? Math.round((discovered / total) * 100) : 0,
    total,
  };
}

export function buildCodex({ animals = [], currentUserId, historiesByAnimalId = {} } = {}) {
  const dogs = buildBreedEntries({
    animals,
    breedList: DOG_BREEDS,
    currentUserId,
    historiesByAnimalId,
  });
  const cats = buildBreedEntries({
    animals,
    breedList: CAT_BREEDS,
    currentUserId,
    historiesByAnimalId,
  });
  const all = [...dogs, ...cats];

  return {
    all,
    cats,
    dogs,
    overallProgress: getProgress(all),
    progressByType: {
      cat: getProgress(cats),
      dog: getProgress(dogs),
    },
  };
}

export function getBreedListByCategory(category) {
  if (category === "dogs") return DOG_BREEDS;
  if (category === "cats") return CAT_BREEDS;
  return [];
}

export function getBreedByCategoryAndId(category, breedId) {
  return getBreedListByCategory(category).find((breed) => breed.id === breedId) ?? null;
}

export function getEntriesByCategory(codex, category) {
  if (category === "dogs") return codex.dogs;
  if (category === "cats") return codex.cats;
  return [];
}

export function getCategoryCopy(category) {
  if (category === "dogs") {
    return {
      animalTypeLabel: "Perro",
      label: "Perros",
      title: "Perros",
    };
  }

  return {
    animalTypeLabel: "Gato",
    label: "Gatos",
    title: "Gatos",
  };
}

export function findBreedEntry(codex, category, breedId) {
  return getEntriesByCategory(codex, category).find((entry) => entry.id === breedId) ?? null;
}

export { BREEDS, CAT_BREEDS, DOG_BREEDS };
