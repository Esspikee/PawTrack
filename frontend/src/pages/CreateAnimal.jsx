import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PhotoCapture from "../components/PhotoCapture";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";

const initialForm = { name: "", species: "Perro", color: "", description: "" };

function CreateAnimal() {
  const [form, setForm] = useState(initialForm);
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const { coordinates, locate, locating, locationError, locationHint } = useGeolocation();
  const { createAnimal } = usePawTrack();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);

    if (!photoUrl) {
      setFormError("Toma una foto y espera a que termine de subir.");
      return;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      setFormError("Necesitamos una ubicacion valida para crear el pin.");
      return;
    }

    setSubmitting(true);
    try {
      const animal = await createAnimal({
        nombre: form.name.trim() || null,
        especie: form.species,
        color_principal: form.color.trim(),
        latitud: latitude,
        longitud: longitude,
        foto_principal: photoUrl,
        descripcion: form.description.trim(),
      });
      navigate(`/animals/${animal.id}`, { replace: true });
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <TopBar backTo="/animals" title="Nuevo animal" />

      <form className="report-form capture-form" onSubmit={handleSubmit}>
        {formError && <p className="form-message error" role="alert">{formError}</p>}

        <div className="form-section-title"><Icon name="camera" size={20} /><span>1. Foto</span></div>
        <PhotoCapture onUploaded={setPhotoUrl} required />

        <div className="form-section-title"><Icon name="mapPin" size={20} /><span>2. Ubicacion</span></div>
        <div className="location-status">
          <span>{locating ? "Buscando tu ubicacion..." : coordinates.latitude ? "Ubicacion lista" : "Ubicacion pendiente"}</span>
          <button className="mini-pixel-button" disabled={locating} onClick={locate} type="button">
            {locating ? "Buscando" : "Localizar"}
          </button>
        </div>
        {locationError && <p className="form-message warning">{locationError}</p>}
        {!locationError && locationHint && !coordinates.latitude && (
          <p className="form-message info">En iPhone toca Localizar para permitir el GPS.</p>
        )}
        <div className="hidden-coordinate-fields" aria-hidden="true">
          <input name="latitude" readOnly type="hidden" value={coordinates.latitude} />
          <input name="longitude" readOnly type="hidden" value={coordinates.longitude} />
        </div>

        <div className="form-section-title"><Icon name="paw" size={20} /><span>3. Datos rapidos</span></div>
        <label>
          Nombre opcional
          <span className="input-wrap">
            <input name="name" onChange={updateField} placeholder="Buddy, Luna, Max..." type="text" value={form.name} />
            <Icon name="paw" size={20} />
          </span>
        </label>

        <label>
          Especie
          <span className="input-wrap">
            <select name="species" onChange={updateField} value={form.species}><option>Perro</option><option>Gato</option></select>
            <Icon name="paw" size={20} />
          </span>
        </label>

        <label>
          Color principal
          <span className="input-wrap">
            <input name="color" onChange={updateField} placeholder="Negro, blanco, dorado..." required type="text" value={form.color} />
            <Icon name="star" size={20} />
          </span>
        </label>

        <label>
          Raza
          <span className="input-wrap">
            <input name="description" onChange={updateField} placeholder="Husky, Labrador, Criollo..." type="text" value={form.description} />
            <Icon name="book" size={20} />
          </span>
        </label>

        <PixelButton className="full-width" disabled={submitting} type="submit">
          {submitting ? "Guardando..." : "Crear pin"}
        </PixelButton>
      </form>
    </AppShell>
  );
}

export default CreateAnimal;
