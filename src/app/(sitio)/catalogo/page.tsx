import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Catalogo } from "@/components/Catalogo";

export const metadata: Metadata = {
  title: "Catálogo de rituales",
  description: "Rituales de amor, amarres, abundancia y dinero, limpieza y protección, y amor propio de Circe, con precio en dólares o pesos colombianos.",
  alternates: { canonical: "/catalogo" },
};

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PaginaCatalogo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  // Enlaces viejos (/catalogo?seccion=amor) ahora van al catálogo propio de la sección.
  const seccion = uno(p.seccion);
  if (seccion && /^[a-z]+$/.test(seccion)) redirect(`/catalogo/${seccion}`);
  return <Catalogo key={`${uno(p.tipo)}|${uno(p.q)}`} inicial={{ q: uno(p.q)?.slice(0, 120), tipo: uno(p.tipo) }} />;
}
