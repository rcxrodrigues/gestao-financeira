import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  console.log("\n🔍 MIDDLEWARE DEBUG ─────────────────────");
  console.log("Path:", path);
  console.log("User ID:", user?.id || "❌ Nenhum");
  console.log("User Email:", user?.email || "❌ Nenhum");

  const isPublic = ["/login", "/signup", "/auth/callback"].some(p => path.startsWith(p));

  if (!user && !isPublic) {
    console.log("→ Sem user, redirecionando pra /login");
    console.log("─────────────────────────────────────\n");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (path === "/login" || path === "/signup")) {
    console.log("→ User logado tentando /login ou /signup, redirecionando pra /dashboard");
    console.log("─────────────────────────────────────\n");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && !isPublic) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", user.id)
      .single();

    console.log("Profile lido do banco:", profile);
    console.log("Erro na query:", error?.message || "nenhum");

    if (!profile && path !== "/pending") {
      console.log("→ Profile não encontrado, redirecionando pra /pending");
      console.log("─────────────────────────────────────\n");
      return NextResponse.redirect(new URL("/pending", request.url));
    }

    if (profile) {
      if (profile.status !== "approved" && path !== "/pending") {
        console.log(`→ Status é "${profile.status}" (não approved), redirecionando pra /pending`);
        console.log("─────────────────────────────────────\n");
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      if (profile.status === "approved" && path === "/pending") {
        console.log("→ User approved tentando /pending, redirecionando pra /dashboard");
        console.log("─────────────────────────────────────\n");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (path.startsWith("/admin") && profile.role !== "admin") {
        console.log("→ Não-admin tentando /admin, redirecionando pra /dashboard");
        console.log("─────────────────────────────────────\n");
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  console.log("→ Passou normal, continuando pra:", path);
  console.log("─────────────────────────────────────\n");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};