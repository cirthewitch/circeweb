"use client";

import Link from "next/link";
import { precio } from "@/lib/precios";
import type { Item } from "@/lib/tipos";
import { BotonSolicitar } from "./botones";
import { Motivo } from "./Motivo";
import { useSitio } from "./proveedor";

/** Tarjeta de un servicio o producto, igual en el catálogo general y en el de cada sección. */
export function TarjetaItem({ item: s, origen, etiqueta }: { item: Item; origen: string; etiqueta?: string }) {
  const { moneda } = useSitio();
  const esServ = s.tipo === "servicio";
  return (
    <div className="tile" style={{ display: "flex", flexDirection: "column", borderRadius: 24 }}>
      {esServ && <Link href={`/servicio/${s.slug}`} className="cover" aria-label={s.nombre} />}
      <div className="art" style={{ aspectRatio: "1 / 1" }}>
        <div className="glow" />
        {s.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imagen_url} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Motivo nombre={s.motivo} grosor={1.4} style={{ width: "54%" }} />
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: "0 clamp(14px, 1.6vw, 20px) clamp(14px, 1.6vw, 20px)" }}>
        {etiqueta && <span className="tag" style={{ fontSize: 10 }}>{etiqueta}</span>}
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 1.9vw, 26px)", lineHeight: 1.05 }}>{s.nombre}</span>
        <span className="clampd" style={{ fontSize: 13, lineHeight: 1.5, color: "#A8A096" }}>{s.descripcion}</span>
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="price" style={{ fontSize: 14, color: "#D9C9A8" }}>{precio(s, moneda)}</span>
          <BotonSolicitar item={s} origen={origen} className="btn sm above" />
        </div>
      </div>
    </div>
  );
}

export const REJILLA = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, calc(50% - 6px)), 1fr))", gap: "clamp(10px, 1.6vw, 18px)" } as const;
