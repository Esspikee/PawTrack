import { describe, expect, it } from "vitest";
import { DOG_BREEDS } from "../data/breeds";
import { animalMatchesBreed, buildBreedEntries, buildCodex, normalizeCodexText } from "./codex";

const animals = [
  {
    breed: "Husky",
    color: "Husky",
    customName: "Nube",
    history: [],
    id: "animal-1",
    name: "Nube",
    photoUrl: "/uploads/husky.jpg",
    species: "Perro",
  },
  {
    breed: "Labrador",
    color: "Labrador",
    customName: "Sol",
    history: [],
    id: "animal-2",
    name: "Sol",
    photoUrl: "/uploads/lab.jpg",
    species: "Perro",
  },
];

const historiesByAnimalId = {
  "animal-1": [
    {
      createdAt: "2026-07-01T10:00:00Z",
      date: "1 jul 2026",
      description: "Seen near the park",
      location: "4.71100, -74.07200",
      photoUrl: "/uploads/first-husky.jpg",
      userId: "user-1",
    },
    {
      createdAt: "2026-07-02T10:00:00Z",
      date: "2 jul 2026",
      description: "Second route",
      location: "4.71200, -74.07300",
      photoUrl: null,
      userId: "user-1",
    },
  ],
  "animal-2": [
    {
      createdAt: "2026-07-03T10:00:00Z",
      date: "3 jul 2026",
      description: "Different user found this Labrador",
      location: "4.71300, -74.07400",
      photoUrl: "/uploads/lab.jpg",
      userId: "user-2",
    },
  ],
};

describe("codex discovery engine", () => {
  it("does not discover Pug from an unrelated word containing pug", () => {
    const pug = DOG_BREEDS.find((breed) => breed.id === "pug");
    expect(animalMatchesBreed({ species: "Perro" }, { description: "Junto al gimnasio de pugilistas" }, pug)).toBe(false);
  });

  it.each(["jusky", "huskies", "siberiano"])("recognizes the same Husky alias as backend achievements: %s", (alias) => {
    const husky = DOG_BREEDS.find((breed) => breed.id === "husky");
    expect(animalMatchesBreed({ species: "Perro" }, { description: `Vi un ${alias}` }, husky)).toBe(true);
  });
  it("builds an empty initial codex before sightings load", () => {
    const codex = buildCodex();

    expect(codex.overallProgress).toMatchObject({
      discovered: 0,
      total: 22,
    });
    expect(codex.dogs).toHaveLength(11);
    expect(codex.cats).toHaveLength(11);
  });

  it("normalizes accented breed text for matching", () => {
    expect(normalizeCodexText("Pastor Alemán")).toBe("pastor aleman");
    expect(normalizeCodexText("Siamés")).toBe("siames");
  });

  it("calculates discoveries only from the current user's sightings", () => {
    const entries = buildBreedEntries({
      animals,
      breedList: DOG_BREEDS,
      currentUserId: "user-1",
      historiesByAnimalId,
    });
    const husky = entries.find((entry) => entry.id === "husky");
    const labrador = entries.find((entry) => entry.id === "labrador");

    expect(husky).toMatchObject({
      discovered: true,
      firstPhotoUrl: "/uploads/first-husky.jpg",
      firstSightingDate: "1 jul 2026",
      recentDescription: "Second route",
      recentLocation: "4.71200, -74.07300",
      totalSightings: 2,
    });
    expect(labrador).toMatchObject({
      discovered: false,
      id: "labrador",
    });
    expect(labrador.breed.displayName).toBe("Labrador");
  });

  it("builds dynamic category and overall progress", () => {
    const codex = buildCodex({
      animals,
      currentUserId: "user-1",
      historiesByAnimalId,
    });

    expect(codex.progressByType.dog).toMatchObject({
      discovered: 1,
      total: 11,
    });
    expect(codex.progressByType.cat).toMatchObject({
      discovered: 0,
      total: 11,
    });
    expect(codex.overallProgress).toMatchObject({
      discovered: 1,
      total: 22,
    });
  });
});
