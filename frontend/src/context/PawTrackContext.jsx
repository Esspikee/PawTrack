import { useEffect, useMemo, useState } from "react";
import { animals as initialAnimals, currentUser as initialUser } from "../data/mockData";
import { PawTrackContext } from "./usePawTrack";

const STORAGE_KEY = "pawtrack_mock_state_v2";

function readStoredState() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const avatarBySpecies = {
  gato: "cat",
  perro: "golden",
};

function createId(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PawTrackProvider({ children }) {
  const storedState = readStoredState();
  const [animals, setAnimals] = useState(storedState?.animals ?? initialAnimals);
  const [currentUser, setCurrentUser] = useState(storedState?.currentUser ?? initialUser);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        animals,
        currentUser,
      }),
    );
  }, [animals, currentUser]);

  const addAnimal = (formData) => {
    const id = createId(formData.name) || `animal-${Date.now()}`;
    const animal = {
      id,
      name: formData.name,
      species: formData.species,
      breed: formData.color,
      color: formData.color,
      lastSeen: formData.location,
      lastSeenAgo: "Ahora",
      description: formData.description,
      sightings: 1,
      avatar: avatarBySpecies[formData.species.toLowerCase()] ?? "husky",
      history: [
        {
          id: `${id}-1`,
          location: formData.location,
          date: formData.date,
          time: formData.time,
          description: formData.description,
        },
      ],
    };

    setAnimals((items) => [animal, ...items.filter((item) => item.id !== id)]);
    setCurrentUser((user) => ({
      ...user,
      animalsDiscovered: user.animalsDiscovered + 1,
      sightings: user.sightings + 1,
      points: user.points + 10,
      xp: Math.min(user.nextLevelXp, user.xp + 10),
    }));

    return animal;
  };

  const addSighting = (animalId, formData) => {
    let updatedAnimal;

    setAnimals((items) =>
      items.map((animal) => {
        if (animal.id !== animalId) {
          return animal;
        }

        updatedAnimal = {
          ...animal,
          lastSeen: formData.location,
          lastSeenAgo: "Ahora",
          sightings: animal.sightings + 1,
          history: [
            {
              id: `${animal.id}-${animal.sightings + 1}`,
              location: formData.location,
              date: formData.date,
              time: formData.time,
              description: formData.description,
            },
            ...(animal.history ?? []),
          ],
        };

        return updatedAnimal;
      }),
    );

    setCurrentUser((user) => ({
      ...user,
      sightings: user.sightings + 1,
      points: user.points + 5,
      xp: Math.min(user.nextLevelXp, user.xp + 5),
    }));

    return updatedAnimal;
  };

  const value = useMemo(
    () => ({ addAnimal, addSighting, animals, currentUser }),
    [animals, currentUser],
  );

  return <PawTrackContext.Provider value={value}>{children}</PawTrackContext.Provider>;
}
