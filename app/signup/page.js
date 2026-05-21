"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import AuthLayout from "@/components/AuthLayout";
import { Field, PrimaryButton, ErrorMsg, SuccessMsg } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(""); setSucesso("");

    if (senha.length < 6) {
      setErro("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    if (senha !== confirmaSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    // Se o Supabase exigir confirmação por email
    if (data.user && !data.session) {
      setSucesso("Conta criada! Verifique seu email para confirmar o cadastro. Depois aguarde a aprovação do admin.");
      setLoading(false);
      return;
    }

    // Se autoconfirma (ou usuário já existe), redireciona pra pending
    router.push("/pending");
    router.refresh();
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Após o cadastro, seu acesso passa por uma rápida aprovação."
      footer={<>Já tem conta? <Link href="/login" style={{ color: "#5b9cf6", fontWeight: 600 }}>Entrar</Link></>}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome"/>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="voce@email.com"/>
        <Field label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Mínimo 6 caracteres"/>
        <Field label="Confirme a senha" type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} required placeholder="Repita a senha"/>
        <ErrorMsg>{erro}</ErrorMsg>
        <SuccessMsg>{sucesso}</SuccessMsg>
        <PrimaryButton type="submit" loading={loading}>Criar conta</PrimaryButton>
      </form>
    </AuthLayout>
  );
}
