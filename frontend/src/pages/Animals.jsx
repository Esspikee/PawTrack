import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AnimalMap from "../components/AnimalMap";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Animals() {
  const { animals, animalsError, animalsLoading, loadAnimals } = usePawTrack();
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredAnimals = useMemo(() => {
    if (!normalizedSearch) return animals;
    return animals.filter((animal) => [
      animal.name,
      animal.species,
      animal.color,
      animal.lastSeen,
      animal.description,
    ].some((value) => value?.toLowerCase().includes(normalizedSearch)));
  }, [animals, normalizedSearch]);

  return (
    <AppShell>
      <TopBar action="search" backTo="/dashboard" onAction={() => searchRef.current?.focus()} title="Mapa y animales" />

      <PixelButton className="full-width" to="/animals/new">
        Anadir animal
      </PixelButton>

      {animalsLoading && <StatusPanel message="Cargando animales del vecindario..." />}
      {!animalsLoading && animalsError && (
        <StatusPanel action={() => loadAnimals().catch(() => {})} message={animalsError} type="error" />
      )}

      {!animalsLoading && !animalsError && (
        <>
          <label className="search-panel">
            <Icon name="search" size={18} />
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por color, especie o zona"
              ref={searchRef}
              type="search"
              value={searchTerm}
            />
          </label>

          <AnimalMap animals={filteredAnimals} />
          <div className="section-label">
            <span>Catalogo</span>
            <small>{filteredAnimals.length} de {animals.length} animales</small>
          </div>

          {filteredAnimals.length === 0 ? (
            <StatusPanel message={animals.length === 0 ? "Aun no hay animales. Se la primera persona en registrar uno." : "No encontramos animales con esa busqueda."} />
          ) : (
            <section className="animal-list">
              {filteredAnimals.map((animal) => (
                <Link className="animal-row" key={animal.id} to={`/animals/${animal.id}`}>
                  {animal.photoUrl ? (
                    <img alt="" className="animal-thumbnail" src={animal.photoUrl} />
                  ) : (
                    <PetAvatar size="sm" type={animal.avatar} />
                  )}
                  <span className="animal-info">
                    <strong>{animal.name}</strong>
                    <small>{animal.sightings} avistamientos · {animal.confirmations} confirmaciones</small>
                    <small>{animal.lastSeen}</small>
                    <small>{animal.lastSeenAgo}</small>
                  </span>
                  <Icon name="chevronRight" />
                </Link>
              ))}
            </section>
          )}
        </>
      )}
    </AppShell>
  );
}

export default Animals;
