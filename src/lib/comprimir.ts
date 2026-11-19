/** Reduce una imagen en el navegador antes de subirla, para no llenar el almacenamiento. */

const LADO_MAX = 1600; // px del lado más largo: sobra para la web y las capturas siguen legibles
const CALIDAD = 0.82;

export interface Comprimida {
  archivo: Blob;
  ext: string;
  tipo: string;
  antes: number;
  despues: number;
}

function aBlob(canvas: HTMLCanvasElement, tipo: string, calidad: number) {
  return new Promise<Blob | null>((r) => canvas.toBlob(r, tipo, calidad));
}

export async function comprimirImagen(original: File): Promise<Comprimida> {
  const sinCambio = (): Comprimida => ({ archivo: original, ext: original.name.split(".").pop()?.toLowerCase() || "jpg", tipo: original.type, antes: original.size, despues: original.size });
  // Los GIF animados y los SVG perderían su gracia al pasarlos por un canvas.
  if (original.type === "image/gif" || original.type === "image/svg+xml") return sinCambio();

  // imageOrientation corrige las fotos de celular que vienen giradas.
  const imagen = await createImageBitmap(original, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAX / Math.max(imagen.width, imagen.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imagen.width * escala);
  canvas.height = Math.round(imagen.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) return sinCambio();
  ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
  imagen.close();

  // WebP pesa menos; si el navegador no sabe crearlo (Safari viejo), devuelve PNG y se usa JPEG.
  let blob = await aBlob(canvas, "image/webp", CALIDAD);
  let tipo = "image/webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await aBlob(canvas, "image/jpeg", CALIDAD);
    tipo = "image/jpeg";
  }
  if (!blob || blob.size >= original.size) return sinCambio();
  return { archivo: blob, ext: tipo === "image/webp" ? "webp" : "jpg", tipo, antes: original.size, despues: blob.size };
}

export const peso = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
