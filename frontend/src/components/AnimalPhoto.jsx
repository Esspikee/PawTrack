import { useState } from "react";
import PetAvatar from "./PetAvatar";
export default function AnimalPhoto({ animal, className = "" }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return <div className={`animal-photo ${className}`}>
    {animal.photoUrl && animal.photoUrl !== failedUrl
      ? <img src={animal.photoUrl} alt={animal.name} onError={() => setFailedUrl(animal.photoUrl)} loading="lazy" />
      : <PetAvatar type={animal.species === "Gato" ? "cat" : "puppy"} size="lg" />}
  </div>;
}
