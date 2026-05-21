import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// Helper: valida que quem chama é admin aprovado
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.status !== "approved") {
    return { error: "Acesso negado", status: 403 };
  }

  return { user, profile };
}

// GET /api/admin/users → lista todos os usuários
export async function GET() {
  const check = await requireAdmin();
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, nome, role, status, plano, created_at, approved_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

// PATCH /api/admin/users → atualiza status/plano de um usuário
export async function PATCH(request) {
  const check = await requireAdmin();
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json();
  const { id, status, plano, role } = body;

  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  // Proteção: admin não pode mexer no próprio status/role
  if (id === check.user.id && (status || role)) {
    return NextResponse.json({ error: "Você não pode alterar seu próprio status ou role" }, { status: 400 });
  }

  const updates = {};
  if (status && ["pending","approved","rejected","suspended"].includes(status)) {
    updates.status = status;
    if (status === "approved") {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = check.user.id;
    }
  }
  if (plano && ["free","mensal","anual"].includes(plano)) updates.plano = plano;
  if (role && ["user","admin"].includes(role)) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
