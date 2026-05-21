import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AuthLayout from "@/components/AuthLayout";
import LogoutButton from "@/components/LogoutButton";

export default async function PendingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, nome, email")
    .eq("id", user.id)
    .single();

  if (profile?.status === "approved") redirect("/dashboard");

  const statusInfo = {
    pending: {
      icon: "⏳",
      title: "Aguardando aprovação",
      msg: "Seu cadastro foi recebido e está aguardando aprovação do administrador. Você receberá acesso assim que for liberado.",
      color: "#fbbf24",
    },
    rejected: {
      icon: "❌",
      title: "Acesso recusado",
      msg: "Seu cadastro foi recusado. Entre em contato com o administrador para mais informações.",
      color: "#f05f5f",
    },
    suspended: {
      icon: "⛔",
      title: "Acesso suspenso",
      msg: "Sua conta foi suspensa. Entre em contato com o administrador.",
      color: "#f05f5f",
    },
  };

  const info = statusInfo[profile?.status || "pending"];

  return (
    <AuthLayout
      title={info.title}
      subtitle={`Olá, ${profile?.nome || profile?.email}!`}
    >
      <div style={{
        textAlign: "center", padding: "20px 16px",
        background: `${info.color}10`, border: `1px solid ${info.color}30`,
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>{info.icon}</div>
        <div style={{ fontSize: 14, color: "#a0a0c0", lineHeight: 1.6 }}>{info.msg}</div>
      </div>
      <LogoutButton/>
    </AuthLayout>
  );
}
