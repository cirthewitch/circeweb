"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { comprimirImagen, peso } from "@/lib/comprimir";
import { clienteNavegador } from "@/lib/supabase/navegador";

/** Sube una imagen al bucket "media" y guarda su URL pública en un campo oculto del formulario. */
export function SubirImagen({ nombre, valor = "", carpeta, etiqueta, vertical = false }: { nombre: string; valor?: string; carpeta: string; etiqueta: string; vertical?: boolean }) {
  const [url, setUrl] = useState(valor);
  const [estado, setEstado] = useState("");

  const [info, setInfo] = useState("");

  const subir = async (archivo: File) => {
    setInfo("");
    if (!archivo.type.startsWith("image/")) return setEstado("Elige una imagen (JPG, PNG o WebP).");
    if (archivo.size > 30 * 1024 * 1024) return setEstado("La imagen pesa más de 30 MB.");
    setEstado("Optimizando…");
    let lista;
    try {
      lista = await comprimirImagen(archivo);
    } catch {
      return setEstado("No pude leer esa imagen. Prueba con una JPG o PNG.");
    }
    if (lista.despues > 2 * 1024 * 1024) return setEstado(`Aun optimizada pesa ${peso(lista.despues)}. Prueba con otra imagen.`);
    setEstado("Subiendo…");
    const ruta = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${lista.ext}`;
    const db = clienteNavegador();
    const { error } = await db.storage.from("media").upload(ruta, lista.archivo, { cacheControl: "31536000", contentType: lista.tipo });
    if (error) return setEstado("No se pudo subir: " + error.message);
    setUrl(db.storage.from("media").getPublicUrl(ruta).data.publicUrl);
    setEstado("");
    setInfo(lista.despues < lista.antes ? `Optimizada: ${peso(lista.antes)} → ${peso(lista.despues)}` : `Subida: ${peso(lista.despues)}`);
  };

  return (
    <div className="afl">
      {etiqueta}
      <input type="hidden" name={nombre} value={url} />
      <label style={{ position: "relative", minHeight: vertical ? 300 : 120, display: "grid", placeItems: "center", gap: 8, padding: 14, border: "1.5px dashed rgba(237,228,215,.18)", borderRadius: 16, background: "rgba(12,11,10,.45)", textAlign: "center", fontWeight: 400, fontSize: 13, color: "#A8A096", cursor: "pointer", overflow: "hidden" }}>
        {url ? <img src={url} alt="" style={{ maxHeight: vertical ? 300 : 160, borderRadius: 10, objectFit: "contain" }} /> : <span><strong style={{ color: "#EDE4D7" }}>Subir imagen</strong><br />Arrastra o haz clic</span>}
        <input type="file" accept="image/*" className="sr" onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
      </label>
      {estado && <span style={{ fontWeight: 400, color: estado.endsWith("…") ? "#A8A096" : "#F1C9CF" }}>{estado}</span>}
      {info && !estado && <span style={{ fontWeight: 400, color: "#9BD8B5" }}>{info}</span>}
      {url && <button type="button" className="abtn" style={{ alignSelf: "flex-start", minHeight: 32 }} onClick={() => { setUrl(""); setInfo(""); }}>Quitar imagen</button>}
    </div>
  );
}
