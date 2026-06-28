import { useEffect, useId, useState } from "react";
import { api } from "../services/api";
import Icon from "./Icon";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function PhotoCapture({ onUploaded, required = false }) {
  const inputId = useId();
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");

  useEffect(() => () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
  }, [preview]);

  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    onUploaded("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Usa una imagen JPEG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("La foto debe pesar 5 MB o menos.");
      event.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setFilename(file.name);
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      onUploaded(result.url);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-capture">
      {preview && <img alt="Vista previa de la foto" className="photo-preview" src={preview} />}
      <label className="capture-control" htmlFor={inputId}>
        <Icon name="camera" size={22} />
        <span>{uploading ? "Subiendo foto..." : preview ? "Cambiar foto" : "Tomar o elegir foto"}</span>
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
      {error && <p className="form-message error">{error}</p>}
    </div>
  );
}

export default PhotoCapture;
