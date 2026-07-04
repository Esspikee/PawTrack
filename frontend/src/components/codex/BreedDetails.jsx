import Icon from "../Icon";

function BreedDetails({ categoryLabel, entry }) {
  if (!entry.discovered) {
    return (
      <section className="codex-journal unknown-detail">
        <div className="journal-photo silhouette-large"><Icon name="paw" size={44} /></div>
        <span>
          <strong>Raza desconocida</strong>
          <p>Esta raza aún no ha sido descubierta.</p>
        </span>
      </section>
    );
  }

  return (
    <section className="codex-journal">
      {entry.firstPhotoUrl ? (
        <img alt={entry.breed.displayName} className="journal-photo" src={entry.firstPhotoUrl} />
      ) : (
        <div className="journal-photo silhouette-large"><Icon name="paw" size={44} /></div>
      )}
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
