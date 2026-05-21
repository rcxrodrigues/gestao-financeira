"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import AuthLayout from "@/components/AuthLayout";
import { Field, PrimaryButton, ErrorMsg } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(""); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthLayout
      title="Entrar"
      subtitle="Acesse seu painel financeiro pessoal"
      footer={<>Ainda não tem conta? <Link href="/signup" style={{ color: "#5b9cf6", fontWeight: 600 }}>Cadastre-se</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder="voce@email.com"/>
        <Field label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="••••••••"/>
        <ErrorMsg>{erro}</ErrorMsg>
        <PrimaryButton type="submit" loading={loading}>Entrar</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
