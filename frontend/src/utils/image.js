// Compresión de imágenes en el navegador antes de subirlas.
//
// Las fotos de cámara de móvil suelen pesar 5-15 MB. Para una app de
// avistamientos no necesitamos resolución de archivo: reescalamos el lado más
// largo a `maxDimension` y recodificamos como JPEG con `quality`. Un resultado
// típico queda por debajo de 1 MB sin pérdida visible en pantalla.
//
// Si algo falla (navegador sin canvas, imagen ilegible, etc.) devolvemos el
// archivo original para no bloquear al usuario; el límite de tamaño y la
// validación del servidor siguen actuando como red de seguridad.

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.8;

async function loadImageSource(file) {
  // `createImageBitmap` con `imageOrientation: "from-image"` respeta la
  // orientación EXIF (las fotos de iPhone vienen rotadas). Si no está
  // disponible, caemos a un <img>, que en navegadores modernos también
  // corrige la orientación.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Continuamos con el fallback basado en <img>.
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen."));
    };
    image.src = url;
  });
}

export async function compressImage(file, options = {}) {
  const { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = options;

  if (typeof document === "undefined" || typeof file?.type !== "string" || !file.type.startsWith("image/")) {
    return file;
  }

  let source;
  try {
    source = await loadImageSource(file);
  } catch {
    return file;
  }

  const width = source.width || source.naturalWidth;
  const height = source.height || source.naturalHeight;

  if (!width || !height) {
    source.close?.();
    return file;
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    source.close?.();
    return file;
  }

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  source.close?.();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  // Si la recodificación falló o no reduce el peso (p. ej. una imagen ya
  // diminuta), conservamos el archivo original.
  if (!blob || blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^./\\]+$/, "") || "foto";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
