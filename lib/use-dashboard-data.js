"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";

// Hook que centraliza dados do dashboard
export function useDashboardData(userId, anoSel) {
  const supabase = createClient();
  const [receitas, setReceitas] = useState([]);
  const [fixas, setFixas] = useState([]);
  const [variaveis, setVariaveis] = useState([]);
  const [cartoes, setCartoes] = useState([]);
  const [pagamentos, setPagamentos] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [r, f, v, c, p] = await Promise.all([
      supabase.from("receitas").select("*").eq("ano", anoSel),
      supabase.from("despesas_fixas").select("*").eq("ativa", true),
      supabase.from("despesas_variaveis").select("*").eq("ano", anoSel),
      supabase.from("despesas_cartoes").select("*").eq("ano", anoSel),
      supabase.from("pagamentos").select("*").eq("ano", anoSel),
    ]);

    setReceitas((r.data || []).map(x => ({ id: x.id, nome: x.nome, valor: Number(x.valor), mes: x.mes, ano: x.ano })));
    setFixas((f.data || []).map(x => ({ id: x.id, nome: x.nome, valor: Number(x.valor), vencimento: x.vencimento })));
    setVariaveis((v.data || []).map(x => ({ id: x.id, nome: x.nome, valor: Number(x.valor), categoria: x.categoria, mes: x.mes, ano: x.ano, vencimento: x.vencimento })));
    setCartoes((c.data || []).map(x => ({ id: x.id, nome: x.nome, valor: Number(x.valor), mes: x.mes, ano: x.ano, vencimento: x.vencimento })));

    const pgMap = {};
    (p.data || []).forEach(pg => {
      pgMap[`${pg.tipo}|${pg.ref_id}|${pg.mes}|${pg.ano}`] = true;
    });
    setPagamentos(pgMap);
    setLoading(false);
  }, [supabase, anoSel]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // CRUD
  const addReceita = async (nome, valor, mes, ano) => {
    const { data, error } = await supabase.from("receitas").insert({ user_id: userId, nome, valor, mes, ano }).select().single();
    if (!error && data) setReceitas(s => [...s, { ...data, valor: Number(data.valor) }]);
  };
  const delReceita = async (id) => {
    await supabase.from("receitas").delete().eq("id", id);
    setReceitas(s => s.filter(x => x.id !== id));
  };

  const addFixa = async (nome, valor, vencimento) => {
    const { data, error } = await supabase.from("despesas_fixas").insert({ user_id: userId, nome, valor, vencimento, ativa: true }).select().single();
    if (!error && data) setFixas(s => [...s, { ...data, valor: Number(data.valor) }]);
  };
  const delFixa = async (id) => {
    await supabase.from("despesas_fixas").delete().eq("id", id);
    setFixas(s => s.filter(x => x.id !== id));
  };

  const addVariavel = async (nome, valor, categoria, mes, ano, vencimento) => {
    const { data, error } = await supabase.from("despesas_variaveis").insert({ user_id: userId, nome, valor, categoria, mes, ano, vencimento }).select().single();
    if (!error && data) setVariaveis(s => [...s, { ...data, valor: Number(data.valor) }]);
  };
  const delVariavel = async (id) => {
    await supabase.from("despesas_variaveis").delete().eq("id", id);
    setVariaveis(s => s.filter(x => x.id !== id));
  };

  const addCartao = async (nome, valor, mes, ano, vencimento) => {
    const { data, error } = await supabase.from("despesas_cartoes").insert({ user_id: userId, nome, valor, mes, ano, vencimento }).select().single();
    if (!error && data) setCartoes(s => [...s, { ...data, valor: Number(data.valor) }]);
  };
  const delCartao = async (id) => {
    await supabase.from("despesas_cartoes").delete().eq("id", id);
    setCartoes(s => s.filter(x => x.id !== id));
  };

  const togglePago = async (tipo, refId, mes, ano) => {
    const key = `${tipo}|${refId}|${mes}|${ano}`;
    const jaPago = !!pagamentos[key];

    if (jaPago) {
      await supabase.from("pagamentos").delete().match({ user_id: userId, tipo, ref_id: refId, mes, ano });
      setPagamentos(p => { const n = { ...p }; delete n[key]; return n; });
    } else {
      await supabase.from("pagamentos").insert({ user_id: userId, tipo, ref_id: refId, mes, ano });
      setPagamentos(p => ({ ...p, [key]: true }));
    }
  };

  return {
    loading, receitas, fixas, variaveis, cartoes, pagamentos,
    addReceita, delReceita, addFixa, delFixa,
    addVariavel, delVariavel, addCartao, delCartao,
    togglePago, refetch: fetchAll,
  };
}
