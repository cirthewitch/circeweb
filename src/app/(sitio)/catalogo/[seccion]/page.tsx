import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BotonChat, EnlaceWhatsapp } from "@/components/botones";
import { Motivo } from "@/components/Motivo";
import { REJILLA, TarjetaItem } from "@/components/TarjetaItem";
import { obtenerSitio } from "@/lib/datos";
import { porNivel } from "@/lib/niveles";

type Props = { params: Promise<{ seccion: string }> };

export async function generateStaticParams() {
  const { secciones } = await obtenerSitio();
  return secciones.map((s) => ({ seccion: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params;
  const { secciones } = await obtenerSitio();
  const s = secciones.find((x) => x.id === seccion);
  if (!s) return {};
  return { title: `Rituales de ${s.nombre.toLowerCase()}`, description: s.descripcion, alternates: { canonical: `/catalogo/${s.id}` } };
}

/** Secciones que se unieron a otras: sus enlaces viejos siguen funcionando. */
const ANTIGUAS: Record<string, string> = {
  supremo: "/catalogo/amor",
  cortes: "/catalogo/amor",
  tarot: "/catalogo/amor",
  proteccion: "/catalogo/limpieza",
  velas: "/catalogo",
  personalizado: "/catalogo",
};

const anclaDe =(id: string) => id.toLowerCase();

export default async function CatalogoSeccion({ params }: Props) {
  const { seccion } = await params;
  const { secciones, items } = await obtenerSitio();
  const s = secciones.find((x) => x.id === seccion);
  if (!s) {
    if (seccion in ANTIGUAS) redirect(ANTIGUAS[seccion]);
    notFound();
  }
  const servicios = items.filter((i) => i.tipo === "servicio" && i.seccion === s.id);
  const grupos = porNivel(servicios);
  const usd = servicios.map((x) => x.precio_usd).filter((v): v is number => Boolean(v));

  return (
    <div className="scr" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "relative", isolation: "isolate", paddingTop: "var(--nav-h)", overflow: "hidden" }}>
        <div className="aurora" aria-hidden="true" style={{ zIndex: -1, opacity: 0.7 }} />
        <Motivo nombre={s.motivo} grosor={1} style={{ position: "absolute", right: "-6%", top: "12%", width: "min(42vw, 360px)", opacity: 0.22, zIndex: -1, pointerEvents: "none" }} />
        <div className="wrap" style={{ paddingTop: "clamp(28px, 5vw, 64px)", paddingBottom: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
          <nav aria-label="Ruta" style={{ fontSize: 13, color: "#A8A096", display: "flex", gap: 8 }}>
            <Link href="/catalogo" style={{ color: "#A8A096", textDecoration: "none" }}>Catálogo</Link><span aria-hidden="true">›</span><span style={{ color: "#EDE4D7" }}>{s.corto}</span>
          </nav>
          <h1 className="h2x grad" style={{ fontSize: "clamp(46px, 7vw, 100px)" }}>{s.nombre}</h1>
          <p className="lead" style={{ maxWidth: 620 }}>{s.descripcion}</p>
          <span style={{ fontSize: 13, color: "#A8A096" }}>
            {servicios.length} {servicios.length === 1 ? "trabajo" : "trabajos"}{usd.length ? ` · desde ${Math.min(...usd)} USD` : ""}
          </span>
          {grupos.length > 1 && (
            <nav aria-label="Niveles" className="chips" style={{ display: "flex", gap: 8, overflowX: "auto", maxWidth: "100%", paddingTop: 4 }}>
              {grupos.map((g) => (
                <a key={g.id} href={`#${anclaDe(g.id)}`} className="chip" style={{ background: "rgba(237,228,215,.05)", color: "#EDE4D7", border: "1px solid rgba(237,228,215,.14)", textDecoration: "none" }}>
                  {g.titulo} <span style={{ color: "#A8A096" }}>· {g.items.length}</span>
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <div className="wrap" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: "clamp(48px, 6vw, 80px)" }}>
        {grupos.map((g) => (
          <section key={g.id} id={anclaDe(g.id)} aria-labelledby={`t-${anclaDe(g.id)}`} style={{ display: "flex", flexDirection: "column", gap: 18, scrollMarginTop: "calc(var(--nav-h) + 16px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 14, borderBottom: "1px solid rgba(237,228,215,.09)" }}>
              <h2 id={`t-${anclaDe(g.id)}`} style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(32px, 3.6vw, 48px)", lineHeight: 1 }}>
                {g.titulo} <span style={{ fontSize: "0.5em", color: "#A8A096", fontFamily: "Manrope, sans-serif", fontWeight: 500 }}>{g.items.length}</span>
              </h2>
              {g.texto && <p style={{ margin: 0, fontSize: 15, color: "#A8A096" }}>{g.texto}</p>}
            </div>
            <div style={REJILLA}>
              {g.items.map((i) => <TarjetaItem key={i.id} item={i} origen={`catalogo-${s.id}`} />)}
            </div>
          </section>
        ))}

        <section className="tile still" style={{ padding: "clamp(32px, 5vw, 56px) 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
          <div className="glow" aria-hidden="true" />
          <p className="above" style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 38px)", fontStyle: "italic" }}>¿No sabes cuál elegir?</p>
          <p className="above" style={{ margin: 0, fontSize: 15, color: "#A8A096", maxWidth: 460 }}>Cuéntame tu caso y te digo qué trabajo te conviene.</p>
          <div className="above" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <BotonChat ctx={{ seccion: s.id }} className="btng sm">Preguntarle a Circe</BotonChat>
            <EnlaceWhatsapp texto={`Hola Circe, quiero ayuda con un trabajo de ${s.nombre.toLowerCase()}.`} className="btn sm" origen={`catalogo-${s.id}`}>Escribir por WhatsApp</EnlaceWhatsapp>
          </div>
        </section>

        <nav aria-label="Otras secciones" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <span className="tag">Otras secciones</span>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {secciones.filter((x) => x.id !== s.id).map((x) => (
              <Link key={x.id} href={`/catalogo/${x.id}`} className="btng sm">{x.nombre}</Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
