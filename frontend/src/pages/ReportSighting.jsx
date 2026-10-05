import { useTranslation } from "../i18n/useTranslation";
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
  const { t, animalName } = useTranslation();
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
    if (!validPosition(geo.coordinates)) { setFormError(t("Necesitamos una ubicacion valida para el avistamiento.")); return; }
    if (!selected) { setFormError(t("Selecciona el animal que viste.")); return; }
    setSubmitting(true);
    try {
      await addSighting(selectedId, { latitud: Number(geo.coordinates.latitude), longitud: Number(geo.coordinates.longitude), descripcion: description.trim(), foto_url: photoUrl || null });
      navigate(`/animals/${selectedId}/history`, { replace: true });
    } catch (error) { setFormError(error.message); } finally { setSubmitting(false); }
  };
  return <AppShell><TopBar backTo={selected ? `/animals/${selected.id}` : "/animals"} title={t("Registrar avistamiento")} />
    <CaptureHeader photoReady={Boolean(photoUrl)} locationReady={validPosition(geo.coordinates)} />
    {animalsLoading ? <StatusPanel message={t("Cargando animales...")} /> : animalsError ? <StatusPanel type="error" message={t(animalsError)} action={() => loadAnimals().catch(() => {})} /> : animals.length === 0 ? <section className="pixel-panel empty-discovery"><Icon name="paw" /><h2>{t("Comienza una nueva historia")}</h2><p>{t("Aún no hay animales conocidos. Registra el primero con una foto.")}</p><PixelButton to="/animals/new">{t("Nuevo animal")}</PixelButton></section> :
    <form className="report-form capture-form redesigned-capture" onSubmit={submit}>
      {formError && <p className="form-message error" role="alert">{t(formError)}</p>}
      <label>{t("¿A quién viste?")}<select name="animal" onChange={event => setChosen(event.target.value)} value={selectedId}><option value="">{t("Selecciona un animal")}</option>{animals.map(animal => <option key={animal.id} value={animal.id}>{animalName(animal)}</option>)}</select></label>
      {selected && <div className="selected-preview pixel-panel"><AnimalPhoto animal={selected} /><span><strong>{animalName(selected)}</strong><small>{t(selected.species)} · {selected.color}</small></span></div>}
      <Link className="text-action" to="/animals/new">{t("No es ninguno: registrar nuevo animal →")}</Link>
      <PhotoCapture onUploaded={setPhotoUrl} onUploadingChange={setPhotoUploading} />
      <LocationPicker geo={geo} />
      <label>{t("Descripción (opcional)")}<textarea maxLength={255} rows={3} placeholder={t("¿Qué viste?")} value={description} onChange={event => setDescription(event.target.value)} /></label>
      <PixelButton className="full-width publish-button" disabled={submitting || photoUploading} type="submit" icon={<Icon name="paw" size={23} />}>{submitting ? t("Publicando...") : t("Publicar avistamiento")}</PixelButton>
    </form>}
  </AppShell>;
}
