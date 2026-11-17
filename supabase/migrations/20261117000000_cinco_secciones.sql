-- Cinco secciones, como en los catálogos de Circe:
-- Amor · Amarres · Abundancia y dinero · Limpieza y protección · Amor propio y cuidado personal.
-- Mueve los servicios de las secciones viejas sin tocar precios, textos ni fotos editados en el panel.
-- Se puede ejecutar más de una vez.
begin;

-- 1. Secciones finales
insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values ('amor', 'Amor', 'Amor', 'corazon', 'amor', 'Para atraer, endulzar, hacer que regrese o cerrar un ciclo: de lo más sencillo a lo más intenso.', array['amor', 'pareja', 'enamorar', 'novio', 'novia', 'esposo', 'esposa', 'relacion', 'ex', 'regrese', 'volver', 'infiel', 'celos', 'supremo', 'potenciado', 'fuerte', 'combinado', 'separar', 'separacion', 'corte', 'soltar', 'olvidar', 'terminar', 'alejar', 'tarot', 'lectura', 'cartas', 'consulta', 'personalizado', 'a medida', 'especial', 'unico']::text[], 0)
  on conflict (id) do update set nombre = excluded.nombre, corto = excluded.corto, palabra = excluded.palabra, descripcion = excluded.descripcion, sinonimos = excluded.sinonimos, orden = excluded.orden;
insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values ('amarres', 'Amarres', 'Amarres', 'amarre', 'una unión firme', 'Los trabajos de unión más intensos del catálogo, para casos difíciles.', array['amarre', 'amarrar', 'atar', 'unir', 'union', 'matrimonio', 'casarse']::text[], 1)
  on conflict (id) do update set nombre = excluded.nombre, corto = excluded.corto, palabra = excluded.palabra, descripcion = excluded.descripcion, sinonimos = excluded.sinonimos, orden = excluded.orden;
insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values ('abundancia', 'Abundancia y dinero', 'Abundancia', 'monedas', 'abundancia', 'Para que el dinero, los clientes y las oportunidades vuelvan a fluir.', array['dinero', 'abundancia', 'prosperidad', 'negocio', 'clientes', 'ventas', 'trabajo', 'empleo', 'suerte', 'deudas', 'ingresos']::text[], 2)
  on conflict (id) do update set nombre = excluded.nombre, corto = excluded.corto, palabra = excluded.palabra, descripcion = excluded.descripcion, sinonimos = excluded.sinonimos, orden = excluded.orden;
insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values ('limpieza', 'Limpieza y protección', 'Limpieza', 'escoba', 'limpiar y proteger tu energía', 'Para soltar cargas, envidias y bloqueos, y blindarte a ti, tu trabajo, tu familia y tus mascotas.', array['limpieza', 'limpiar', 'despojo', 'mal de ojo', 'envidia', 'brujeria', 'bloqueo', 'cargas', 'energia', 'proteccion', 'proteger', 'blindaje', 'escudo', 'familia', 'mascota', 'acoso']::text[], 3)
  on conflict (id) do update set nombre = excluded.nombre, corto = excluded.corto, palabra = excluded.palabra, descripcion = excluded.descripcion, sinonimos = excluded.sinonimos, orden = excluded.orden;
insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values ('amorpropio', 'Amor propio y cuidado personal', 'Amor propio', 'rosa', 'reencontrarte contigo', 'Rituales para tu autoestima, tu brillo y tu magnetismo personal.', array['amor propio', 'autoestima', 'belleza', 'bonita', 'atractiva', 'magnetismo', 'glow']::text[], 4)
  on conflict (id) do update set nombre = excluded.nombre, corto = excluded.corto, palabra = excluded.palabra, descripcion = excluded.descripcion, sinonimos = excluded.sinonimos, orden = excluded.orden;

-- 2. Servicios de las secciones que desaparecen
update public.items set seccion = 'amor' where tipo = 'servicio' and seccion in ('supremo', 'cortes');
update public.items set seccion = 'amor', nivel = 'Lectura' where tipo = 'servicio' and seccion = 'tarot';
update public.items set seccion = 'limpieza' where tipo = 'servicio' and seccion = 'proteccion';
update public.items set
  seccion = case nivel when 'Amor propio' then 'amorpropio' when 'Abundancia' then 'abundancia' when 'Limpieza' then 'limpieza' else 'amor' end,
  nivel = 'Vela'
where tipo = 'servicio' and seccion = 'velas';
update public.items set
  seccion = case
    when slug like '%amor-propio%' then 'amorpropio'
    when slug like '%abundancia%' then 'abundancia'
    when slug like '%limpieza%' then 'limpieza'
    else 'amor' end,
  nivel = 'VIP'
where tipo = 'servicio' and seccion = 'personalizado';

-- 3. Preguntas del chat que apuntaban a esas secciones
update public.preguntas p set aplica_a = (
  select coalesce(array_agg(distinct m), '{general}') from (
    select case a
      when 'seccion:supremo' then 'seccion:amor'
      when 'seccion:cortes' then 'seccion:amor'
      when 'seccion:tarot' then 'seccion:amor'
      when 'seccion:proteccion' then 'seccion:limpieza'
      when 'seccion:velas' then 'general'
      when 'seccion:personalizado' then 'general'
      else a end as m
    from unnest(p.aplica_a) a) t)
where p.aplica_a && array['seccion:supremo', 'seccion:cortes', 'seccion:tarot', 'seccion:proteccion', 'seccion:velas', 'seccion:personalizado'];

update public.preguntas p set acciones = (
  select coalesce(jsonb_agg(case
    when e->>'seccion' in ('supremo', 'cortes', 'tarot') then jsonb_set(e, '{seccion}', '"amor"')
    when e->>'seccion' = 'proteccion' then jsonb_set(e, '{seccion}', '"limpieza"')
    when e->>'seccion' in ('velas', 'personalizado') then e - 'seccion'
    else e end), '[]'::jsonb)
  from jsonb_array_elements(p.acciones) e)
where exists (select 1 from jsonb_array_elements(p.acciones) e where e->>'seccion' in ('supremo', 'cortes', 'tarot', 'proteccion', 'velas', 'personalizado'));

-- 4. Estadísticas: los clics viejos cuentan en su sección nueva
update public.eventos set seccion = case seccion when 'proteccion' then 'limpieza' else 'amor' end
where seccion in ('supremo', 'cortes', 'tarot', 'proteccion', 'velas', 'personalizado');

-- 5. Fuera las secciones sobrantes
delete from public.secciones where id not in ('amor', 'amarres', 'abundancia', 'limpieza', 'amorpropio');

commit;
