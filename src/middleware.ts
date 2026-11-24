import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Mantiene viva la sesión de la administradora en /admin.
 * Se usa middleware.ts (runtime edge) y no proxy.ts (Node): en Cloudflare/OpenNext el middleware
 * de Node es experimental y falla al leer cookies.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  const enLogin = request.nextUrl.pathname.startsWith("/admin/login");
  if (!data.user && !enLogin) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/login";
    return NextResponse.redirect(destino);
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
