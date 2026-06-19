import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";

function Animals() {
  const { animals } = usePawTrack();

  return (
    <AppShell>
      <TopBar action="search" backTo="/dashboard" title="Animales" />

      <PixelButton className="full-width" to="/animals/new">
        Anadir animal
      </PixelButton>

      <section className="animal-list">
        {animals.map((animal) => (
          <Link className="animal-row" key={animal.id} to={`/animals/${animal.id}`}>
            <PetAvatar size="sm" type={animal.avatar} />
            <span className="animal-info">
              <strong>{animal.name}</strong>
              <small>
                {animal.species} - {animal.breed}
              </small>
              <small>Ultimo avistamiento</small>
              <small>{animal.lastSeenAgo}</small>
            </span>
            <Icon name="chevronRight" />
          </Link>
        ))}
      </section>
    </AppShell>
  );
}

export default Animals;
