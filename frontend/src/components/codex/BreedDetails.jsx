import BreedSprite from "./BreedSprite";

function BreedDetails({ categoryLabel, entry }) {
  if (!entry.discovered) {
    return (
      <section className="codex-journal unknown-detail">
        <div className="breed-portrait"><BreedSprite breed={entry.breed} locked /></div>
        <span>
          <strong>Raza desconocida</strong>
          <p>Esta raza aún no ha sido descubierta.</p>
        </span>
      </section>
    );
  }

  return (
    <section className="codex-journal">
      <div className="breed-portrait"><BreedSprite breed={entry.breed} /></div>
      <span className="journal-title">
        <small>{categoryLabel}</small>
        <strong>{entry.breed.displayName}</strong>
      </span>
      <div className="journal-grid">
        <span><small>Tipo de animal</small><strong>{categoryLabel}</strong></span>
        <span><small>Primer avistamiento</small><strong>{entry.firstSightingDate}</strong></span>
        <span><small>Avistamientos totales</small><strong>{entry.totalSightings}</strong></span>
        {entry.recentLocation && <span><small>Ubicación reciente</small><strong>{entry.recentLocation}</strong></span>}
      </div>
      {entry.firstPhotoUrl && <figure className="breed-sighting-photo"><img alt={`Foto de tu primer avistamiento: ${entry.breed.displayName}`} className="journal-photo" src={entry.firstPhotoUrl} loading="lazy" /><figcaption>Tu primer avistamiento</figcaption></figure>}
      {entry.recentDescription && (
        <span className="journal-note">
          <small>Descripción reciente</small>
          <p>{entry.recentDescription}</p>
        </span>
      )}
    </section>
  );
}

export default BreedDetails;
