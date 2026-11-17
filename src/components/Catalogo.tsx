"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { buscarItems, indiceItems } from "@/lib/catalogo";
import { NIVELES } from "@/lib/niveles";
import { BotonChat, EnlaceSeccion, EnlaceWhatsapp } from "./botones";
import { Motivo, colorMotivo } from "./Motivo";
import { useSitio } from "./proveedor";
import { REJILLA, TarjetaItem } from "./TarjetaItem";

interface Props {
  inicial: { q?: string; tipo?: string };
}

const chip = (on: boolean) =>
  on
    ? { background: "#EDE4D7", color: "#11100F", border: "1px solid #EDE4D7" }
    : { background: "rgba(237,228,215,.05)", color: "#EDE4D7", border: "1px solid rgba(237,228,215,.14)" };

function guardarUrl(p: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(p)) {
    if (v) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  }
  window.history.replaceState(window.history.state, "", url);
}

const nombreNivel = (n: string) => NIVELES.find((x) => x.id === n)?.titulo.replace(/^Rituales /, "") ?? n;

export function Catalogo({ inicial }: Props) {
  const { sitio, moneda, registrar } = useSitio();
  const [tipo, setTipo] = useState<"servicio" | "producto">(inicial.tipo === "productos" ? "producto" : "servicio");
  const [q, setQ] = useState(inicial.q ?? "");
  const [cat, setCat] = useState("todos");
  const consulta = useDeferredValue(q);

  const esServ = tipo === "servicio";
  const servicios = useMemo(() => sitio.items.filter((i) => i.tipo === "servicio"), [sitio.items]);
  const productos = useMemo(() => sitio.items.filter((i) => i.tipo === "producto"), [sitio.items]);
  const indice = useMemo(() => indiceItems(servicios, sitio.secciones), [servicios, sitio.secciones]);
  const hayQ = esServ && consulta.trim().length >= 2;
  const hallados = useMemo(() => (hayQ ? buscarItems(indice, consulta) : []), [hayQ, indice, consulta]);
  const prodVisibles = cat === "todos" ? productos : productos.filter((i) => i.seccion === cat);
  const nombreSec = new Map(sitio.secciones.map((s) => [s.id, s.corto]));

  const elegirTipo = (t: "servicio" | "producto") => {
    setTipo(t); setCat("todos");
    guardarUrl({ tipo: t === "producto" ? "productos" : "", q: t === "producto" ? "" : q });
  };

  const segmento = (on: boolean) => ({ height: 40, padding: "0 20px", border: 0, borderRadius: 999, font: "600 13px Manrope, sans-serif", cursor: "pointer", background: on ? "#EDE4D7" : "transparent", color: on ? "#11100F" : "#CFC6B9" });

  return (
    <div className="scr" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "relative", isolation: "isolate", paddingTop: "var(--nav-h)", overflow: "hidden" }}>
        <div className="aurora" aria-hidden="true" style={{ zIndex: -1, opacity: 0.7 }} />
        <div className="wrap" style={{ paddingTop: "clamp(40px, 7vw, 96px)", paddingBottom: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          <div role="tablist" aria-label="Tipo" style={{ display: "flex", padding: 4, background: "rgba(237,228,215,.06)", borderRadius: 999 }}>
            <button type="button" role="tab" aria-selected={esServ} onClick={() => elegirTipo("servicio")} style={segmento(esServ)}>Servicios</button>
            <button type="button" role="tab" aria-selected={!esServ} onClick={() => elegirTipo("producto")} style={segmento(!esServ)}>Productos</button>
          </div>
          <h1 className="h2x grad" style={{ fontSize: "clamp(48px, 7vw, 104px)" }}>{esServ ? "Elige tu camino" : "Objetos con intención"}</h1>
          <p className="lead" style={{ maxWidth: 620 }}>
            {esServ ? "Cinco secciones, cada una con su propio catálogo. O escribe lo que necesitas y te muestro los trabajos que encajan." : "Pócimas, pulseras, amuletos y cuarzos preparados por Circe."}
          </p>
          {esServ && (
            <form role="search" style={{ position: "relative", width: "min(640px, 100%)", marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); registrar("busqueda", { origen: "catalogo" }); }}>
              <label htmlFor="cq" className="sr">Buscar en el catálogo</label>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9C9A8" strokeWidth="1.6" aria-hidden="true" style={{ position: "absolute", left: 22, top: "50%", marginTop: -10 }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <input id="cq" className="srch" type="search" value={q} autoComplete="off" placeholder="¿Qué necesitas? Ej.: que regrese, dinero, mal de ojo…"
                onChange={(e) => { const v = e.target.value.slice(0, 120); setQ(v); guardarUrl({ q: v.trim() }); }} />
            </form>
          )}
        </div>
      </header>

      <div className="wrap" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        {esServ && !hayQ && (
          <div className="secs">
            {sitio.secciones.map((s) => {
              const lista = servicios.filter((x) => x.seccion === s.id);
              const usd = lista.map((x) => x.precio_usd).filter((v): v is number => Boolean(v));
              return (
                <div key={s.id} className="tile" style={{ minHeight: 230, background: `radial-gradient(90% 80% at 85% 100%, ${colorMotivo(s.motivo)}30 0%, transparent 60%), linear-gradient(160deg,#1E1518 0%,#141011 60%,#100D0D 100%)` }}>
                  <EnlaceSeccion seccion={s.id} origen="catalogo" className="cover" ariaLabel={`Ver ${s.nombre}`} />
                  <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", gap: 8, padding: "clamp(20px, 2.4vw, 30px)" }}>
                    <span className="tag" style={{ fontSize: 10 }}>{lista.length} {lista.length === 1 ? "trabajo" : "trabajos"}{usd.length ? ` · desde ${Math.min(...usd)} USD` : ""}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 3vw, 42px)", lineHeight: 1, maxWidth: "75%" }}>{s.nombre}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.5, color: "#CFC6B9", maxWidth: "70%" }}>{s.descripcion}</span>
                    <span className="lnk" style={{ marginTop: "auto", paddingTop: 12, fontSize: 14 }}>Ver catálogo</span>
                  </div>
                  <Motivo nombre={s.motivo} grosor={1.2} style={{ position: "absolute", right: "-4%", bottom: "-8%", width: "min(40%, 190px)", pointerEvents: "none", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))" }} />
                </div>
              );
            })}
          </div>
        )}

        {hayQ && (
          <>
            <span style={{ fontSize: 13, color: "#A8A096" }} aria-live="polite">
              {hallados.length} {hallados.length === 1 ? "resultado" : "resultados"} para «{consulta.trim()}» · Precios en {moneda === "cop" ? "pesos colombianos" : "dólares"}
            </span>
            {hallados.length === 0 ? (
              <div className="tile still" style={{ padding: "56px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontStyle: "italic" }}>No encontré trabajos con esas palabras.</p>
                <p style={{ margin: 0, fontSize: 15, color: "#A8A096" }}>Cuéntame tu caso y te digo qué ritual te conviene.</p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                  <BotonChat className="btng sm">Preguntarle a Circe</BotonChat>
                  <EnlaceWhatsapp texto={`Hola Circe, busco algo para: ${q}`} className="btn sm" origen="catalogo">Escribir por WhatsApp</EnlaceWhatsapp>
                </div>
              </div>
            ) : (
              <div style={REJILLA}>
                {hallados.map((s) => <TarjetaItem key={s.id} item={s} origen="catalogo" etiqueta={`${nombreSec.get(s.seccion) ?? ""} · ${nombreNivel(s.nivel)}`} />)}
              </div>
            )}
          </>
        )}

        {!esServ && (
          <>
            <div className="chips" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {[{ id: "todos", nombre: "Todos" }, ...sitio.categorias].map((g) => (
                <button key={g.id} type="button" className="chip" aria-pressed={cat === g.id} onClick={() => setCat(g.id)} style={chip(cat === g.id)}>{g.nombre}</button>
              ))}
            </div>
            <div style={REJILLA}>
              {prodVisibles.map((s) => <TarjetaItem key={s.id} item={s} origen="catalogo" etiqueta={sitio.categorias.find((c) => c.id === s.seccion)?.nombre} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
