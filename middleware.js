import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value; },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Rotas públicas
  const isPublic = ["/login", "/signup", "/auth/callback"].some(p => path.startsWith(p));

  // Sem sessão → joga pra login (exceto se já estiver em rota pública)
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Com sessão tentando acessar login/signup → manda pra dashboard
  if (user && (path === "/login" || path === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Se tem sessão, checa status do profile
  if (user && !isPublic) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", user.id)
      .single();

    // Sem profile ainda? Provavelmente o trigger ainda não rodou — manda pra pending
    if (!profile && path !== "/pending") {
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    if (profile) {
      // Não aprovado: bloqueia dashboard/admin, libera /pending
      if (profile.status !== "approved" && path !== "/pending") {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      // Aprovado tentando ver /pending → manda pra dashboard
      if (profile.status === "approved" && path === "/pending") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Não-admin tentando /admin → 404 (redireciona pra dashboard)
      if (path.startsWith("/admin") && profile.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
