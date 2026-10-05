import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PhotoCapture from "../components/PhotoCapture";
import PixelButton from "../components/PixelButton";
import StatusPanel from "../components/StatusPanel";
import TopBar from "../components/TopBar";
import CaptureHeader from "../components/CaptureHeader";
import LocationPicker from "../components/LocationPicker";
import AnimalPhoto from "../components/AnimalPhoto";
import { usePawTrack } from "../context/usePawTrack";
import { useGeolocation } from "../hooks/useGeolocation";
import { validPosition } from "../utils/nearby";

export default function ReportSighting() {
  const { animalId } = useParams();
  const { addSighting, animals, animalsError, animalsLoading, loadAnimals } = usePawTrack();
  const [chosen, setChosen] = useState("");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const geo = useGeolocation();
  const navigate = useNavigate();
  const selectedId = chosen || animalId || "";
  const selected = animals.find(animal => animal.id === selectedId);
  const submit = async event => {
    event.preventDefault();
    if (submitting || photoUploading) return;
    setFormError("");
    if (!validPosition(geo.coordinates)) { setFormError("Necesitamos una ubicacion valida para el avistamiento."); return; }
    if (!selected) { setFormError("Selecciona el animal que viste."); return; }
    setSubmitting(true);
    try {
      await addSighting(selectedId, { latitud: Number(geo.coordinates.latitude), longitud: Number(geo.coordinates.longitude), descripcion: description.trim(), foto_url: photoUrl || null });
      navigate(`/animals/${selectedId}/history`, { replace: true });
    } catch (error) { setFormError(error.message); } finally { setSubmitting(false); }
  };
  return <AppShell><TopBar backTo={selected ? `/animals/${selected.id}` : "/animals"} title="Registrar avistamiento" />
    <CaptureHeader photoReady={Boolean(photoUrl)} locationReady={validPosition(geo.coordinates)} />
    {animalsLoading ? <StatusPanel message="Cargando animales..." /> : animalsError ? <StatusPanel type="error" message={animalsError} action={() => loadAnimals().catch(() => {})} /> : animals.length === 0 ? <section className="pixel-panel empty-discovery"><Icon name="paw" /><h2>Comienza una nueva historia</h2><p>Aún no hay animales conocidos. Registra el primero con una foto.</p><PixelButton to="/animals/new">Nuevo animal</PixelButton></section> :
    <form className="report-form capture-form redesigned-capture" onSubmit={submit}>
      {formError && <p className="form-message error" role="alert">{formError}</p>}
      <label>¿A quién viste?<select name="animal" onChange={event => setChosen(event.target.value)} value={selectedId}><option value="">Selecciona un animal</option>{animals.map(animal => <option key={animal.id} value={animal.id}>{animal.name}</option>)}</select></label>
      {selected && <div className="selected-preview pixel-panel"><AnimalPhoto animal={selected} /><span><strong>{selected.name}</strong><small>{selected.species} · {selected.color}</small></span></div>}
      <Link className="text-action" to="/animals/new">No es ninguno: registrar nuevo animal →</Link>
      <PhotoCapture onUploaded={setPhotoUrl} onUploadingChange={setPhotoUploading} />
      <LocationPicker geo={geo} />
      <label>Descripción (opcional)<textarea maxLength={255} rows={3} placeholder="¿Qué viste?" value={description} onChange={event => setDescription(event.target.value)} /></label>
      <PixelButton className="full-width publish-button" disabled={submitting || photoUploading} type="submit" icon={<Icon name="paw" size={23} />}>{submitting ? "Publicando..." : "Publicar avistamiento"}</PixelButton>
    </form>}
  </AppShell>;
}
