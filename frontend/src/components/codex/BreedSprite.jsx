import { useState } from "react";
import { BREEDS } from "../../data/breeds";
import Icon from "../Icon";

const knownBreeds = new Set(BREEDS.map(breed => breed.id));

export default function BreedSprite({ breed, locked = false, className = "" }) {
  const [failedSource, setFailedSource] = useState("");
  const src = knownBreeds.has(breed.id) ? `/images/breeds/${breed.id}.webp` : "";
  return <span className={`breed-sprite ${locked ? "is-locked" : ""} ${className}`}>
    {src && failedSource !== src ? <img src={src} alt={`Ilustración pixel art: ${breed.displayName}`} width={128} height={128} loading="lazy" decoding="async" onError={() => setFailedSource(src)} /> : <Icon name="paw" size={32} />}
  </span>;
}
