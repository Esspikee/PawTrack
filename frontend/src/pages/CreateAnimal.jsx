import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PhotoCapture from "../components/PhotoCapture";
import PixelButton from "../components/PixelButton";
import TopBar from "../components/TopBar";
import Icon from "../components/Icon";
import CaptureHeader from "../components/CaptureHeader";
import LocationPicker from "../components/LocationPicker";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { validPosition } from "../utils/nearby";

export default function CreateAnimal() {
  const [form, setForm] = useState({ name: "", species: "Perro", color: "", description: "" });
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const geo = useGeolocation();
  const { createAnimal } = usePawTrack();
  const navigate = useNavigate();
  const update = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    if (submitting || photoUploading) return;
    setFormError("");
    if (!photoUrl) { setFormError("Toma una foto y espera a que termine de subir."); return; }
    if (!validPosition(geo.coordinates)) { setFormError("Necesitamos una ubicacion valida para crear el pin."); return; }
    if (!form.color.trim()) { setFormError("Escribe el color principal del animal."); return; }
    setSubmitting(true);
    try {
      const animal = await createAnimal({ nombre: form.name.trim() || null, especie: form.species, color_principal: form.color.trim(),
        latitud: Number(geo.coordinates.latitude), longitud: Number(geo.coordinates.longitude), foto_principal: photoUrl, descripcion: form.description.trim() });
      navigate(`/animals/${animal.id}`, { replace: true });
    } catch (error) { setFormError(error.message); } finally { setSubmitting(false); }
  };
  return <AppShell><TopBar backTo="/animals" title="Registrar avistamiento" />
    <CaptureHeader isNew photoReady={Boolean(photoUrl)} locationReady={validPosition(geo.coordinates)} />
    <form className="report-form capture-form redesigned-capture" onSubmit={submit}>
      {formError && <p className="form-message error" role="alert">{formError}</p>}
      <PhotoCapture onUploaded={setPhotoUrl} onUploadingChange={setPhotoUploading} required />
      <LocationPicker geo={geo} />
      <fieldset className="species-picker"><legend>¿Qué animal es?</legend>{["Perro", "Gato"].map(species => <label key={species}><input type="radio" name="species" value={species} checked={form.species === species} onChange={update} /><span><Icon name="paw" size={20} />{species}</span></label>)}</fieldset>
      <label className="compact-field">Color principal<input name="color" required maxLength={50} placeholder="Dorado, negro, blanco..." value={form.color} onChange={update} /></label>
      <label className="compact-field">Nombre (opcional)<input name="name" maxLength={80} placeholder="¿Tiene un nombre?" value={form.name} onChange={update} /></label>
      <details className="extra-details"><summary>Añadir más detalles</summary><label>Descripción (opcional)<textarea name="description" maxLength={255} rows={3} placeholder="Collar, marcas o comportamiento..." value={form.description} onChange={update} /></label></details>
      <PixelButton className="full-width publish-button" disabled={submitting || photoUploading} type="submit" icon={<Icon name="paw" size={23} />}>{submitting ? "Publicando..." : photoUploading ? "Subiendo foto..." : "Publicar avistamiento"}</PixelButton>
    </form>
  </AppShell>;
}
