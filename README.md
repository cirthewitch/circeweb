# Circe Witch

Web de Circe: catálogo de rituales con búsqueda inteligente, chatbot sin IA, solicitudes por WhatsApp y panel de administración.

- **Next.js 16** (App Router) + **Supabase** (base de datos, inicio de sesión de la admin e imágenes).
- Sin cuentas para clientes: el formulario arma el mensaje y lo abre en WhatsApp; se guarda una copia para el panel.
- Sin variables de Supabase la web funciona en **modo demo** con los datos de `src/data/`.

## Puesta en marcha

1. **Supabase** (proyecto nuevo):
   1. SQL Editor → pega y ejecuta `supabase/migrations/20261101000000_esquema_inicial.sql`.
   1. SQL Editor → pega y ejecuta `supabase/migrations/20261117000000_cinco_secciones.sql` (deja las 5 secciones del catálogo).
   2. SQL Editor → pega y ejecuta `supabase/seed.sql` (secciones, 88 servicios, productos, preguntas del chatbot y textos).
   3. Authentication → Users → *Add user* con el correo y contraseña de la administradora.
   4. SQL Editor → `insert into public.admins (user_id) select id from auth.users where email = 'CORREO-DE-LA-ADMIN';`
2. **Local**: `cp .env.example .env.local`, completa las dos claves de Supabase y ejecuta `npm install` y `npm run dev`.
3. **Cloudflare**: ver «Despliegue en Cloudflare Workers» más abajo.
4. En Supabase → Authentication → URL Configuration, pon la URL del sitio.

## Dónde se edita cada cosa (panel `/admin`)

| Sección | Qué hace |
|---|---|
| Resumen | Visitas, clics en «Solicitar» por lugar de la web, servicios más pedidos, solicitudes por día y clics por sección (7 o 30 días). |
| Solicitudes | Copias de los formularios enviados; se marcan como atendidas. |
| Catálogo | Servicios y productos: sección, nivel, precios USD/COP, «incluye», palabras clave, foto, visible y destacado. |
| Chatbot | Respuestas por servicio, sección o generales, y la bandeja de preguntas que el chat no supo responder. |
| Testimonios | Capturas de WhatsApp ancladas a un servicio (con confirmación de permiso). |
| Contenido | WhatsApp, redes, textos del inicio, biografía, fotos de Circe y el aviso de «Agenda llena». |

## Estructura

```
src/app/(sitio)/        páginas públicas: inicio, catálogo, servicio/[slug], testimonios
src/app/admin/          panel (login, resumen, solicitudes, catálogo, chatbot, testimonios, contenido)
src/app/api/            solicitud, evento (clics) y pregunta (sin respuesta): solo insertan
src/components/         hero, catálogo, chatbot, formulario de solicitud, navegación…
src/lib/                datos, búsqueda sin IA, motor del chat, precios, Supabase
src/data/               datos iniciales (también usados en modo demo)
supabase/               esquema con seguridad por filas y datos iniciales
```

`npm run seed:sql` regenera `supabase/seed.sql` a partir de `src/data/`.

## Despliegue en Cloudflare Workers

Se usa el adaptador [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) (`wrangler.jsonc` y `open-next.config.ts`).
Sin R2: las páginas se guardan en KV (`NEXT_INC_CACHE_KV`) y las marcas de «Actualizar la web» en D1 (`NEXT_TAG_CACHE_D1`).

1. `npx wrangler login`
2. `npx wrangler kv namespace create NEXT_INC_CACHE_KV` y `npx wrangler d1 create circe-witch-cache`; copia los dos `id` en `wrangler.jsonc`.
3. Crea `.env.production` con las tres variables `NEXT_PUBLIC_*` (se incrustan al compilar; `NEXT_PUBLIC_SITE_URL` = dominio final).
4. `npm run deploy` (compila, llena la caché y publica). `npm run preview` lo prueba en local con el entorno de Workers.
5. Workers → `circeweb` → Settings → Domains & Routes → *Custom domain* (el dominio debe usar los nameservers de Cloudflare).
6. Supabase → Authentication → URL Configuration: pon el dominio final.
