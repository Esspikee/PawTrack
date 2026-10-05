import { useTranslation } from "../i18n/useTranslation";
import { useEffect, useId, useState } from "react";
import { api } from "../services/api";
import { compressImage } from "../utils/image";
import Icon from "./Icon";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function PhotoCapture({ onUploaded, onUploadingChange, required = false }) {
  const { t } = useTranslation();
  const inputId = useId();
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  const selectFile = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");
    setPreview("");
    setFilename("");
    onUploaded("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t("Usa una imagen JPEG, PNG o WEBP."));
      input.value = "";
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);

    try {
      let upload;
      try {
        upload = await compressImage(file, { maxDimension: 1600, quality: 0.8 });
      } catch {
        upload = file;
      }
      if (upload.size > MAX_FILE_SIZE) {
        throw new Error(t("La foto debe pesar 10 MB o menos."));
      }
      setPreview(URL.createObjectURL(upload));
      setFilename(file.name);
      const result = await api.uploadImage(upload);
      onUploaded(result.url);
    } catch (uploadError) {
      setError(uploadError.message);
      input.value = "";
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  };

  return (
    <div className="photo-capture">
      {preview && <img alt={t("Vista previa de la foto")} className="photo-preview" src={preview} />}
      <label className="capture-control" htmlFor={inputId}>
        <Icon name="camera" size={22} />
        <span>{uploading ? t("Subiendo foto...") : preview ? t("Cambiar foto") : required ? t("Tomar o elegir foto") : t("Añadir foto (opcional)")}</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          disabled={uploading}
          id={inputId}
          onChange={selectFile}
          required={required}
          type="file"
        />
      </label>
      {filename && <small className="capture-filename">{filename}</small>}
      {error && <p className="form-message error">{t(error)}</p>}
    </div>
  );
}

export default PhotoCapture;
