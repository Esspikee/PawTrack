import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PhotoCapture from "../components/PhotoCapture";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";

function ReportSighting() {
  const { animalId } = useParams();
  const { addSighting, animals, animalsError, animalsLoading } = usePawTrack();
  const [selectedAnimalIdInput, setSelectedAnimalId] = useState(animalId || "");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { coordinates, locate, locating, locationError, locationHint, setCoordinates } = useGeolocation();
  const navigate = useNavigate();

  const selectedAnimalId = selectedAnimalIdInput || animals[0]?.id || "";
  const selectedAnimal = animals.find((animal) => animal.id === selectedAnimalId);

  const updateCoordinate = (event) => {
    const { name, value } = event.target;
    setCoordinates((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);

    if (!selectedAnimalId) {
      setFormError("Selecciona un animal.");
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setFormError("Necesitamos una ubicacion valida para el avistamiento.");
      return;
    }

    setSubmitting(true);
    try {
      await addSighting(selectedAnimalId, {
        latitud: latitude,
        longitud: longitude,
        descripcion: description.trim(),
        foto_url: photoUrl || null,
      });
      navigate(`/animals/${selectedAnimalId}/history`, { replace: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (animalsLoading) return <AppShell><StatusPanel message="Cargando animales..." /></AppShell>;
  if (animalsError) return <AppShell><StatusPanel message={animalsError} type="error" /></AppShell>;

  return (
    <AppShell>
      <TopBar backTo={selectedAnimal ? `/animals/${selectedAnimal.id}` : "/animals"} title="Nuevo avistamiento" />

      <form className="report-form capture-form" onSubmit={handleSubmit}>
        {formError && <p className="form-message error" role="alert">{formError}</p>}

        <label>
          Animal
          <span className="input-wrap">
            <select name="animal" onChange={(event) => setSelectedAnimalId(event.target.value)} required value={selectedAnimalId}>
              <option disabled value="">Selecciona un animal</option>
              {animals.map((animal) => <option key={animal.id} value={animal.id}>{animal.name}</option>)}
            </select>
            <Icon name="paw" size={20} />
          </span>
        </label>

        <div className="form-section-title"><Icon name="mapPin" size={20} /><span>Ubicacion actual</span></div>
        <div className="location-status">
          <span>{locating ? "Buscando..." : coordinates.latitude ? "Ubicacion lista" : "Ubicacion pendiente"}</span>
          <button className="mini-pixel-button" disabled={locating} onClick={locate} type="button">Localizar</button>
        </div>
        {locationError && <p className="form-message warning">{locationError}</p>}
        {!locationError && locationHint && !coordinates.latitude && <p className="form-message info">{locationHint}</p>}
        <details className="manual-location-fields">
          <summary>Ubicacion manual</summary>
          <div className="coordinate-grid">
            <label>Latitud<span className="input-wrap"><input name="latitude" onChange={updateCoordinate} step="any" type="number" value={coordinates.latitude} /><Icon name="mapPin" size={18} /></span></label>
            <label>Longitud<span className="input-wrap"><input name="longitude" onChange={updateCoordinate} step="any" type="number" value={coordinates.longitude} /><Icon name="mapPin" size={18} /></span></label>
          </div>
        </details>

        <label>
          Descripcion opcional
          <textarea name="description" onChange={(event) => setDescription(event.target.value)} placeholder="Describe lo que viste..." rows="4" value={description} />
        </label>

        <div className="form-section-title"><Icon name="camera" size={20} /><span>Foto opcional</span></div>
        <PhotoCapture onUploaded={setPhotoUrl} />

        <PixelButton className="full-width" disabled={submitting || animals.length === 0} type="submit">
          {submitting ? "Enviando..." : "Enviar reporte"}
        </PixelButton>
      </form>
    </AppShell>
  );
}

export default ReportSighting;
