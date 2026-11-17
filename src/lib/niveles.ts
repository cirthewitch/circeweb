import type { Item } from "./tipos";

/** Cómo se agrupan los servicios dentro de cada sección, en orden de lectura. */
export const NIVELES: { id: string; titulo: string; texto: string }[] = [
  { id: "Lectura", titulo: "Antes de empezar", texto: "Una lectura para entender tu caso y elegir bien el trabajo." },
  { id: "Sencillo", titulo: "Rituales sencillos", texto: "Para empezar: trabajos puntuales y suaves." },
  { id: "Supremo", titulo: "Rituales supremos", texto: "Más fuerza: trabajos combinados para casos que piden más." },
  { id: "Amarre", titulo: "Amarres", texto: "Los trabajos de unión más intensos, para casos difíciles." },
  { id: "VIP", titulo: "VIP y a tu medida", texto: "El nivel más alto, o un ritual diseñado solo para tu situación." },
  { id: "Vela", titulo: "Velas para potenciar", texto: "Se suman a cualquier ritual para acelerarlo y reforzarlo." },
];

/** Separa los servicios por nivel; lo que no tenga un nivel conocido va al final. */
export function porNivel(items: Item[]) {
  const grupos = NIVELES.map((n) => ({ ...n, items: items.filter((i) => i.nivel === n.id) }));
  const otros = items.filter((i) => !NIVELES.some((n) => n.id === i.nivel));
  if (otros.length) grupos.push({ id: "Otros", titulo: "Otros trabajos", texto: "", items: otros });
  return grupos.filter((g) => g.items.length > 0);
}
