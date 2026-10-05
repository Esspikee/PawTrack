import { useTranslation } from "../i18n/useTranslation";
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
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", species: "Perro", color: "", breed: "", description: "" });
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
    if (!photoUrl) { setFormError(t("Toma una foto y espera a que termine de subir.")); return; }
    if (!validPosition(geo.coordinates)) { setFormError(t("Necesitamos una ubicacion valida para crear el pin.")); return; }
    if (!form.color.trim()) { setFormError(t("Escribe el color principal del animal.")); return; }
    if ([form.breed.trim(), form.description.trim()].filter(Boolean).join(". ").length > 255) {
      setFormError(t("La raza y la descripción deben sumar como máximo 255 caracteres.")); return;
    }
    setSubmitting(true);
    try {
      const animal = await createAnimal({ nombre: form.name.trim() || null, especie: form.species, color_principal: form.color.trim(),
        latitud: Number(geo.coordinates.latitude), longitud: Number(geo.coordinates.longitude), foto_principal: photoUrl, descripcion: [form.breed.trim(), form.description.trim()].filter(Boolean).join(". ") });
      navigate(`/animals/${animal.id}`, { replace: true });
    } catch (error) { setFormError(error.message); } finally { setSubmitting(false); }
  };
  return <AppShell><TopBar backTo="/animals" title={t("Registrar avistamiento")} />
    <CaptureHeader isNew photoReady={Boolean(photoUrl)} locationReady={validPosition(geo.coordinates)} />
    <form className="report-form capture-form redesigned-capture" onSubmit={submit}>
      {formError && <p className="form-message error" role="alert">{t(formError)}</p>}
      <PhotoCapture onUploaded={setPhotoUrl} onUploadingChange={setPhotoUploading} required />
      <LocationPicker geo={geo} showManualCoordinates={false} />
      <fieldset className="species-picker"><legend>{t("¿Qué animal es?")}</legend>{["Perro", "Gato"].map(species => <label key={species}><input type="radio" name="species" value={species} checked={form.species === species} onChange={update} /><span><Icon name="paw" size={20} />{t(species)}</span></label>)}</fieldset>
      <label className="compact-field">{t("Color principal")}<input name="color" required maxLength={50} placeholder={t("Dorado, negro, blanco...")} value={form.color} onChange={update} /></label>
      <label className="compact-field">{t("Nombre (opcional)")}<input name="name" maxLength={80} placeholder={t("¿Tiene un nombre?")} value={form.name} onChange={update} /></label>
      <label className="compact-field">{t("Raza (opcional)")}<input name="breed" maxLength={80} placeholder={t("Husky, Labrador, Criollo...")} value={form.breed} onChange={update} /></label>
      <details className="extra-details"><summary>{t("Añadir más detalles")}</summary><label>{t("Descripción (opcional)")}<textarea name="description" maxLength={form.breed.trim() ? 253 - form.breed.trim().length : 255} rows={3} placeholder={t("Collar, marcas o comportamiento...")} value={form.description} onChange={update} /></label></details>
      <PixelButton className="full-width publish-button" disabled={submitting || photoUploading} type="submit" icon={<Icon name="paw" size={23} />}>{submitting ? t("Publicando...") : photoUploading ? t("Subiendo foto...") : t("Publicar avistamiento")}</PixelButton>
    </form>
  </AppShell>;
}
