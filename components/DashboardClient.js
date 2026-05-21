"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useDashboardData } from "@/lib/use-dashboard-data";
import LogoutButton from "@/components/LogoutButton";

const C = {
  bg: "#07070e", card: "#16161f", border: "#ffffff0f",
  text: "#f0f0fa", textMuted: "#7878a0", textSub: "#a0a0c0",
  green: "#22d98a", greenDim: "#22d98a22",
  blue: "#5b9cf6", blueDim: "#5b9cf622",
  purple: "#a78bfa", purpleDim: "#a78bfa22",
  red: "#f05f5f", redDim: "#f05f5f22",
  amber: "#fbbf24", amberDim: "#fbbf2422",
  cyan: "#22d3ee",
};

const MONTHS_LABELS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const CURRENT_YEAR = new Date().getFullYear();

const brl = (v) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const brlCompact = (v) => {
  if (Math.abs(v) >= 1000) return `R$ ${(v/1000).toFixed(1).replace(".",",")}k`;
  return brl(v);
};
const pct = (v) => `${(v||0).toFixed(1)}%`;
const fmtDia = (d) => (d && d>=1 && d<=31) ? `Dia ${String(d).padStart(2,"0")}` : "—";

const statusVencimento = (dia, mes, ano, pago) => {
  if (pago) return { txt:"Pago", color:C.green, paid:true };
  if (!dia) return null;
  const hoje = new Date();
  const venc = new Date(ano, mes, dia);
  const diff = Math.ceil((venc - hoje) / (1000*60*60*24));
  if (diff < 0) return { txt:`Venc. ${Math.abs(diff)}d`, color:C.red };
  if (diff === 0) return { txt:"Hoje", color:C.amber };
  if (diff <= 7) return { txt:`Em ${diff}d`, color:C.amber };
  return { txt:`Em ${diff}d`, color:C.textMuted };
};

const styles = `
  .dash-root { min-height: 100vh; background: #07070e; padding: 0 0 80px; }

  /* HEADER mobile-first */
  .dash-header {
    background: linear-gradient(180deg, #13131e 0%, #0c0c14 100%);
    border-bottom: 1px solid #ffffff0f;
    padding: 12px 14px 10px;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px);
  }
  .dash-logo { display:flex; align-items:center; gap:8px; min-width: 0; }
  .dash-logo-icon {
    width:32px; height:32px; border-radius:9px;
    background: linear-gradient(135deg, #22d98a, #5b9cf6);
    display:flex; align-items:center; justify-content:center; font-size:16px;
    flex-shrink: 0;
  }
  .dash-logo-text { font-size:14px; font-weight:700; letter-spacing:-0.3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .dash-logo-sub { font-size:9px; color:#7878a0; letter-spacing:0.5px; text-transform:uppercase; }
  .user-area { display:flex; align-items:center; gap:6px; flex-shrink: 0; }
  .user-name { display: none; font-size:11px; color:#a0a0c0; }
  .admin-link {
    padding:5px 9px; border-radius:7px; background:#a78bfa18;
    border:1px solid #a78bfa40; color:#a78bfa; font-size:10px; font-weight:600;
    white-space: nowrap;
  }

  /* TABS - scroll horizontal em mobile */
  .dash-tabs-wrap {
    border-bottom: 1px solid #ffffff0f;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .dash-tabs-wrap::-webkit-scrollbar { display: none; }
  .dash-tabs {
    display: flex; gap: 2px;
    padding: 8px 12px;
    min-width: min-content;
  }
  .dash-tab {
    padding:8px 14px; border-radius:8px; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500;
    color:#7878a0; background:transparent; transition:all .2s; white-space:nowrap;
    min-height: 36px;
  }
  .dash-tab.active { background:#16161f; color:#f0f0fa; box-shadow:0 2px 8px #00000040; }

  /* PERIOD BAR */
  .period-bar {
    padding: 10px 14px;
    display: flex; flex-direction: column; gap: 8px;
    border-bottom: 1px solid #ffffff0f;
    background: #0a0a12;
  }
  .period-row1 {
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
  }
  .period-label {
    font-size:10px; color:#7878a0; letter-spacing:0.5px;
    text-transform:uppercase; font-weight:600; white-space:nowrap;
  }
  .year-select {
    background:#0d0d18; border:1px solid #ffffff18; border-radius:8px;
    color:#f0f0fa; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
    padding:7px 10px; outline:none; cursor:pointer; min-height: 36px;
  }
  .view-toggle { display:flex; gap:2px; background:#0e0e18; border-radius:8px; padding:3px; }
  .view-btn {
    padding:6px 14px; border-radius:6px; border:none; font-size:12px; font-weight:500;
    font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .18s;
    color:#7878a0; background:transparent; min-height: 32px;
  }
  .view-btn.active { background:#16161f; color:#f0f0fa; }

  /* Mês selector - scroll horizontal */
  .period-months-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -14px;
    padding: 0 14px;
  }
  .period-months-wrap::-webkit-scrollbar { display: none; }
  .period-btns {
    display:flex; gap:5px;
    min-width: min-content;
  }
  .period-btn {
    padding:7px 12px; border-radius:8px; border:1px solid #ffffff0f;
    background:transparent; color:#7878a0; font-size:12px; font-weight:500;
    font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .18s;
    min-height: 36px; min-width: 46px;
  }
  .period-btn.active { background:#5b9cf618; border-color:#5b9cf660; color:#5b9cf6; font-weight:600; }

  /* CONTENT */
  .dash-content { padding: 14px; display: flex; flex-direction: column; gap: 14px; }

  /* KPI GRID - 2 colunas em mobile */
  .kpi-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .kpi-card {
    background:#16161f; border:1px solid #ffffff0f; border-radius:12px;
    padding:14px 14px; transition:all .22s; position:relative; overflow:hidden;
    cursor:pointer; text-align:left;
    -webkit-tap-highlight-color: transparent;
  }
  .kpi-card::before { content:''; position:absolute; inset:0; border-radius:12px; opacity:0; transition:opacity .22s; pointer-events:none; }
  .kpi-card:active { transform: scale(0.98); }
  .kpi-card.green::before  { background:linear-gradient(135deg,#22d98a25,transparent); opacity:1; }
  .kpi-card.blue::before   { background:linear-gradient(135deg,#5b9cf625,transparent); opacity:1; }
  .kpi-card.purple::before { background:linear-gradient(135deg,#a78bfa25,transparent); opacity:1; }
  .kpi-card.red::before    { background:linear-gradient(135deg,#f05f5f25,transparent); opacity:1; }
  .kpi-card.amber::before  { background:linear-gradient(135deg,#fbbf2425,transparent); opacity:1; }
  .kpi-card.cyan::before   { background:linear-gradient(135deg,#22d3ee25,transparent); opacity:1; }
  .kpi-label { font-size:9px; font-weight:600; color:#7878a0; letter-spacing:0.5px; text-transform:uppercase; margin-bottom:6px; }
  .kpi-value { font-size:17px; font-weight:700; font-family:'DM Mono',monospace; letter-spacing:-0.4px; line-height:1.1; word-break: break-all; }
  .kpi-value.green { color:#22d98a; } .kpi-value.blue { color:#5b9cf6; }
  .kpi-value.purple{ color:#a78bfa; } .kpi-value.red  { color:#f05f5f; }
  .kpi-value.amber { color:#fbbf24; }
  .kpi-delta { display:flex; align-items:center; gap:3px; margin-top:5px; font-size:10px; font-weight:500; }
  .kpi-delta.up { color:#22d98a; } .kpi-delta.down { color:#f05f5f; } .kpi-delta.neutral { color:#7878a0; }
  .kpi-sub { font-size:9px; color:#7878a0; margin-top:3px; }

  /* CHARTS - 1 coluna em mobile */
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .chart-card {
    background:#16161f; border:1px solid #ffffff0f; border-radius:12px;
    padding: 14px 12px 10px;
  }
  .chart-title { font-size:13px; font-weight:600; color:#f0f0fa; margin-bottom:3px; }
  .chart-insight { font-size:10px; color:#7878a0; margin-bottom:12px; }

  /* SECTION CARDS */
  .section-card { background:#16161f; border:1px solid #ffffff0f; border-radius:12px; padding:16px 14px; }
  .section-title { font-size:14px; font-weight:700; color:#f0f0fa; margin-bottom:12px; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .section-title span.bar { width:4px; height:16px; border-radius:2px; display:inline-block; flex-shrink:0; }
  .section-title small { font-size:11px; font-weight:500; color:#7878a0; letter-spacing:0.3px; flex-basis: 100%; margin-top: 3px; }

  /* FORMS - stack em mobile, com targets toque-friendly */
  .form-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
  .form-row.two-cols { grid-template-columns: 1fr 1fr; }
  .form-field { display:flex; flex-direction:column; gap:5px; }
  .form-label { font-size:10px; font-weight:600; color:#7878a0; letter-spacing:0.5px; text-transform:uppercase; }
  .form-input, .form-select {
    background:#0d0d18; border:1px solid #ffffff15; border-radius:9px;
    color:#f0f0fa; font-family:'DM Sans',sans-serif; font-size:15px; padding:11px 13px;
    outline:none; transition:border-color .18s; min-height: 44px;
    -webkit-appearance: none;
  }
  .form-input:focus, .form-select:focus { border-color:#5b9cf680; }
  .form-select option { background:#1a1a2e; }
  .btn-add {
    padding: 12px 18px;
    border-radius: 10px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #5b9cf6, #a78bfa);
    color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
    transition: opacity .18s; white-space: nowrap;
    min-height: 44px; width: 100%;
  }
  .btn-add:active { opacity: .8; }
  .btn-add.green { background: linear-gradient(135deg, #22d98a, #22d3ee); }

  /* CARDS (substituem tabelas em mobile) */
  .item-list { display: flex; flex-direction: column; gap: 8px; }
  .item-card {
    background: #0e0e18; border: 1px solid #ffffff0a; border-radius: 10px;
    padding: 12px 12px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .item-card.paid { opacity: 0.55; }
  .item-card.paid .item-name { text-decoration: line-through; text-decoration-color: #7878a080; }
  .item-row1 { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .item-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
  .item-name { font-size: 14px; font-weight: 600; color: #f0f0fa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .item-value { font-size: 15px; font-weight: 700; font-family: 'DM Mono', monospace; white-space: nowrap; }
  .item-meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: #7878a0; align-items: center; }
  .item-meta strong { color: #a0a0c0; font-weight: 500; }
  .pay-check {
    display:inline-flex; align-items:center; justify-content:center;
    width:28px; height:28px; border-radius:7px; cursor:pointer;
    border:1.5px solid #ffffff20; background:#0d0d18;
    transition:all .15s; flex-shrink:0;
    -webkit-tap-highlight-color: transparent;
  }
  .pay-check:active { transform: scale(0.92); }
  .pay-check.checked { background:#22d98a; border-color:#22d98a; }
  .pay-check.checked::after { content:'✓'; color:#0a0a0f; font-weight:800; font-size:16px; line-height:1; }
  .venc-pill { display:inline-block; padding:2px 7px; border-radius:5px; font-size:10px; font-weight:600; }
  .btn-del {
    padding:5px 10px; border-radius:6px; border:1px solid #f05f5f30;
    background:#f05f5f15; color:#f05f5f; font-size:11px; cursor:pointer;
    min-height: 30px;
  }
  .btn-del:active { background:#f05f5f30; }

  /* SUMMARY BOX */
  .summary-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 10px;
    background:#0e0e18; border-radius:10px; margin-bottom:12px;
  }
  .summary-item { font-size:11px; color:#7878a0; }
  .summary-item strong { display: block; font-size: 14px; margin-top: 2px; font-family: 'DM Mono', monospace; }

  /* DETAIL CARDS */
  .detail-stats { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 14px; }
  .detail-stat {
    background:#0e0e18; border-radius:10px; padding:10px 14px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .detail-stat-label { font-size:10px; color:#7878a0; text-transform:uppercase; letter-spacing:0.5px; }
  .detail-stat-value { font-size:17px; font-weight:700; font-family:"DM Mono",monospace; }
  .detail-section-title {
    font-size:12px; font-weight:600; margin-bottom:10px;
    display:flex; align-items:center; gap:8px; justify-content:space-between;
  }
  .detail-grid { display: flex; flex-direction: column; gap: 18px; }
  .pay-counter { font-size:10px; color:#7878a0; }

  /* POUPANÇA */
  .savings-grid { display:grid; grid-template-columns:1fr; gap:10px; }
  .savings-block { background:#0e0e18; border-radius:11px; padding:14px; border:1px solid #ffffff0f; }
  .savings-block-label { font-size:11px; font-weight:600; color:#7878a0; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }
  .savings-slider { width:100%; cursor:pointer; margin:10px 0 4px; height: 30px; }
  .savings-value { font-size:22px; font-weight:700; font-family:'DM Mono',monospace; }
  .savings-bar-bg { height:6px; border-radius:3px; background:#ffffff0d; overflow:hidden; margin-top:6px; }
  .savings-bar-fill { height:100%; border-radius:3px; transition:width .4s; }
  .indicator { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; }
  .indicator.green { background:#22d98a22; color:#22d98a; }
  .indicator.amber { background:#fbbf2422; color:#fbbf24; }
  .indicator.red   { background:#f05f5f22; color:#f05f5f; }
  .compare-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  .empty-state { text-align: center; padding: 24px 12px; color: #7878a0; font-size: 13px; }
  .dash-footer { text-align:center; padding:22px 14px; color:#7878a0; font-size:11px; }
  .loading-screen { display:flex; align-items:center; justify-content:center; min-height:60vh; color:#7878a0; font-size:14px; }
  .anchor { scroll-margin-top:160px; }

  /* DESKTOP - apenas 768px+ */
  @media (min-width: 768px) {
    .dash-header { padding: 18px 24px 16px; }
    .dash-logo-icon { width: 36px; height: 36px; }
    .dash-logo-text { font-size: 16px; }
    .dash-logo-sub { font-size: 10px; }
    .user-name { display: inline; font-size: 12px; }
    .dash-tabs-wrap { overflow: visible; }
    .dash-tabs { padding: 8px 24px; flex-wrap: wrap; }
    .period-bar { flex-direction: row; align-items: center; flex-wrap: wrap; padding: 14px 24px; }
    .period-months-wrap { margin: 0; padding: 0; flex: 1; }
    .period-btns { flex-wrap: wrap; }
    .dash-content { padding: 20px 24px; gap: 20px; }
    .kpi-grid { grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; }
    .kpi-card { padding: 16px 18px; }
    .kpi-value { font-size: 20px; }
    .kpi-label { font-size: 10px; }
    .charts-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
    .charts-grid .span2 { grid-column: span 2; }
    .chart-card { padding: 18px 18px 14px; }
    .section-card { padding: 20px; }
    .form-row { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
    .form-row.two-cols { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
    .btn-add { width: auto; }
    .summary-box { display: flex; gap: 18px; padding: 12px 14px; }
    .summary-item strong { display: inline; font-size: inherit; margin-top: 0; }
    .detail-stats { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .savings-grid { grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .compare-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#1c1c2a",border:"1px solid #ffffff14",borderRadius:9,padding:"9px 13px",fontSize:12}}>
      {label && <div style={{color:"#7878a0",marginBottom:5,fontWeight:600}}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{color:p.color,marginBottom:2}}>{p.name}: <strong>{brl(p.value)}</strong></div>
      ))}
    </div>
  );
};

// Componente de card de item (mobile-first - substitui tabelas)
function ItemCard({ children, paid, onTogglePay, value, valueColor, deleteAction }) {
  return (
    <div className={`item-card ${paid ? "paid" : ""}`}>
      <div className="item-row1">
        <div className="item-left">
          {onTogglePay && (
            <button className={`pay-check ${paid ? "checked" : ""}`} onClick={onTogglePay} aria-label={paid?"Desmarcar":"Marcar como pago"}/>
          )}
          <div style={{minWidth:0,flex:1}}>{children}</div>
        </div>
        <div className="item-value" style={{color: valueColor}}>{brl(value)}</div>
      </div>
      {deleteAction}
    </div>
  );
}

export default function DashboardClient({ userId, profile }) {
  const [view, setView] = useState("micro");  // mobile padrão: mensal
  const [mesSel, setMesSel] = useState(new Date().getMonth());
  const [anoSel, setAnoSel] = useState(CURRENT_YEAR);
  const [aba, setAba] = useState("dashboard");

  const dd = useDashboardData(userId, anoSel);
  const { receitas, fixas, variaveis, cartoes, pagamentos, loading } = dd;

  const [ruleNec, setRuleNec] = useState(50);
  const [ruleDes, setRuleDes] = useState(30);
  const rulePou = Math.max(0, 100 - ruleNec - ruleDes);

  const [rNome, setRNome] = useState(""); const [rValor, setRValor] = useState("");
  const [fNome, setFNome] = useState(""); const [fValor, setFValor] = useState(""); const [fVenc, setFVenc] = useState("");
  const [vNome, setVNome] = useState(""); const [vValor, setVValor] = useState(""); const [vCat, setVCat] = useState("Alimentação"); const [vVenc, setVVenc] = useState("");
  const [cNome, setCNome] = useState(""); const [cValor, setCValor] = useState(""); const [cVenc, setCVenc] = useState("");

  const anosDisponiveis = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
  const totalFixas = fixas.reduce((a, f) => a + f.valor, 0);

  const monthData = (m) => {
    const receita = receitas.filter(r => r.mes === m && r.ano === anoSel).reduce((a, r) => a + r.valor, 0);
    const varTot = variaveis.filter(v => v.mes === m && v.ano === anoSel).reduce((a, v) => a + v.valor, 0);
    const cartTot = cartoes.filter(c => c.mes === m && c.ano === anoSel).reduce((a, c) => a + c.valor, 0);
    const despesa = totalFixas + varTot + cartTot;
    return { receita, fixasTot: totalFixas, varTot, cartTot, despesa, saldo: receita - despesa };
  };

  const macroData = MONTHS_LABELS.map((label, m) => {
    const d = monthData(m);
    return { label, ...d, poupanca: d.receita > 0 ? (d.saldo / d.receita) * 100 : 0 };
  });

  const currentM = view === "micro" ? mesSel : 11;
  const curr = monthData(currentM);
  const prev = monthData(Math.max(0, currentM - 1));
  const poupancaReal = curr.receita > 0 ? (curr.saldo / curr.receita) * 100 : 0;
  const pctFixas = curr.receita > 0 ? (totalFixas / curr.receita) * 100 : 0;

  const delta = (c, p) => {
    if (!p) return { pct: 0, dir: "neutral" };
    const pp = ((c - p) / Math.abs(p)) * 100;
    return { pct: Math.abs(pp).toFixed(1), dir: pp > 0 ? "up" : pp < 0 ? "down" : "neutral" };
  };

  const donutFixas = view === "macro" ? totalFixas * 12 : totalFixas;
  const donutCart = view === "macro"
    ? cartoes.filter(c => c.ano === anoSel).reduce((a,c) => a + c.valor, 0)
    : curr.cartTot;
  const donutVar = view === "macro"
    ? variaveis.filter(v => v.ano === anoSel).reduce((a,v) => a + v.valor, 0)
    : curr.varTot;
  const donutData = [
    { name:"Fixas", value:donutFixas, color:C.blue },
    { name:"Cartões", value:donutCart, color:C.purple },
    { name:"Variáveis", value:donutVar, color:C.amber },
  ].filter(d => d.value > 0);

  const catMap = {};
  const rangeVars = view === "micro" ? variaveis.filter(v => v.mes===mesSel && v.ano===anoSel) : variaveis.filter(v => v.ano===anoSel);
  const rangeCards = view === "micro" ? cartoes.filter(c => c.mes===mesSel && c.ano===anoSel) : cartoes.filter(c => c.ano===anoSel);
  rangeVars.forEach(v => { catMap[v.nome] = (catMap[v.nome]||0) + v.valor; });
  rangeCards.forEach(c => { catMap[c.nome] = (catMap[c.nome]||0) + c.valor; });
  fixas.forEach(f => { catMap[f.nome] = (catMap[f.nome]||0) + (view==="micro" ? f.valor : f.valor*12); });
  const topCats = Object.entries(catMap).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,8);

  const sugPou = (curr.receita * rulePou) / 100;
  const savingsStatus = poupancaReal >= rulePou ? "green" : poupancaReal >= rulePou * 0.6 ? "amber" : "red";

  const isPago = (tipo, id, mes, ano) => !!pagamentos[`${tipo}|${id}|${mes}|${ano}`];

  const goTo = (abaTarget, mesTarget = null) => {
    if (mesTarget !== null) { setMesSel(mesTarget); setView("micro"); }
    setAba(abaTarget);
    setTimeout(() => {
      const el = document.getElementById(`section-${abaTarget}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const DeltaBadge = ({ c: cv, p: pv }) => {
    const d = delta(cv, pv);
    return <div className={`kpi-delta ${d.dir}`}>{d.dir==="up"?"↑":d.dir==="down"?"↓":"–"} {d.pct}%</div>;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="dash-root">
          <div className="loading-screen">Carregando seus dados...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">

        <header className="dash-header">
          <div className="dash-logo">
            <div className="dash-logo-icon">💰</div>
            <div style={{minWidth:0}}>
              <div className="dash-logo-text">Dashboard Financeiro</div>
              <div className="dash-logo-sub">Pessoal · {anoSel}</div>
            </div>
          </div>
          <div className="user-area">
            <span className="user-name">Olá, {profile.nome || profile.email.split("@")[0]}</span>
            {profile.role === "admin" && <Link href="/admin" className="admin-link">👑 Admin</Link>}
            <LogoutButton compact/>
          </div>
        </header>

        <div className="dash-tabs-wrap">
          <div className="dash-tabs">
            {[
              ["dashboard","📊 Overview"],
              ["receitas","💵 Receitas"],
              ["fixas","📌 Fixas"],
              ["variaveis","🔄 Variáveis"],
              ["cartoes","💳 Cartões"],
              ["detalhes","🧾 Detalhes"],
              ["poupanca","🎯 Poupança"]
            ].map(([k,l])=>(
              <button key={k} className={`dash-tab ${aba===k?"active":""}`} onClick={()=>setAba(k)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="period-bar">
          <div className="period-row1">
            <span className="period-label">Período</span>
            <select className="year-select" value={anoSel} onChange={e=>setAnoSel(parseInt(e.target.value))}>
              {anosDisponiveis.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <div className="view-toggle">
              <button className={`view-btn ${view==="micro"?"active":""}`} onClick={()=>setView("micro")}>Mensal</button>
              <button className={`view-btn ${view==="macro"?"active":""}`} onClick={()=>setView("macro")}>Anual</button>
            </div>
          </div>
          <div className="period-months-wrap">
            <div className="period-btns">
              {MONTHS_LABELS.map((m,i)=>(
                <button key={i} className={`period-btn ${view==="micro"&&mesSel===i?"active":""}`}
                  onClick={()=>{ setMesSel(i); setView("micro"); }}>{m}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-content">

          {aba === "dashboard" && <>
            <div className="kpi-grid">
              <button className="kpi-card green" onClick={()=>goTo("receitas", currentM)}>
                <div className="kpi-label">Receita</div>
                <div className="kpi-value green">{brl(curr.receita)}</div>
                <DeltaBadge c={curr.receita} p={prev.receita}/>
              </button>
              <button className="kpi-card red" onClick={()=>goTo("detalhes", currentM)}>
                <div className="kpi-label">Despesa</div>
                <div className="kpi-value red">{brl(curr.despesa)}</div>
                <DeltaBadge c={curr.despesa} p={prev.despesa}/>
              </button>
              <button className="kpi-card cyan" onClick={()=>goTo("detalhes", currentM)}>
                <div className="kpi-label">Saldo</div>
                <div className={`kpi-value ${curr.saldo>=0?"green":"red"}`}>{brl(curr.saldo)}</div>
                <DeltaBadge c={curr.saldo} p={prev.saldo}/>
              </button>
              <button className="kpi-card purple" onClick={()=>goTo("poupanca")}>
                <div className="kpi-label">Poupança</div>
                <div className={`kpi-value ${poupancaReal>=20?"green":poupancaReal>=10?"amber":"red"}`}>{pct(poupancaReal)}</div>
                <div className="kpi-sub">Meta: {pct(rulePou)}</div>
              </button>
              <button className="kpi-card amber" onClick={()=>goTo("fixas")}>
                <div className="kpi-label">Fixas</div>
                <div className="kpi-value amber">{brl(totalFixas)}</div>
                <div className="kpi-sub">{pct(pctFixas)} renda</div>
              </button>
              <button className="kpi-card blue" onClick={()=>goTo("cartoes", currentM)}>
                <div className="kpi-label">Cartões</div>
                <div className="kpi-value blue">{brl(curr.cartTot)}</div>
                <DeltaBadge c={curr.cartTot} p={prev.cartTot}/>
              </button>
            </div>

            <div className="charts-grid">
              <div className="chart-card span2">
                <div className="chart-title">Receita × Despesa × Saldo</div>
                <div className="chart-insight">Visão anual {anoSel}</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={macroData} barGap={1} barCategoryGap="18%" margin={{left:-15,right:5,top:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08"/>
                    <XAxis dataKey="label" tick={{fill:"#7878a0",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#7878a0",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#7878a0"}}/>
                    <Bar dataKey="receita" name="Receita" fill={C.green} radius={[3,3,0,0]} opacity={.85}/>
                    <Bar dataKey="despesa" name="Despesa" fill={C.red} radius={[3,3,0,0]} opacity={.85}/>
                    <Bar dataKey="saldo" name="Saldo" fill={C.blue} radius={[3,3,0,0]} opacity={.85}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">Distribuição das Saídas</div>
                <div className="chart-insight">{view==="macro" ? `Ano ${anoSel}` : `${MONTHS_LABELS[currentM]}/${anoSel}`}</div>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" nameKey="name" paddingAngle={3}>
                      {donutData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip formatter={(v)=>brl(v)}/>
                    <Legend wrapperStyle={{fontSize:11,color:"#7878a0"}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-title">Top Categorias</div>
                <div className="chart-insight">Onde mais sai dinheiro</div>
                <ResponsiveContainer width="100%" height={Math.max(180, topCats.length * 28)}>
                  <BarChart data={topCats} layout="vertical" margin={{left:0,right:5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false}/>
                    <XAxis type="number" tick={{fill:"#7878a0",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                    <YAxis type="category" dataKey="name" tick={{fill:"#a0a0c0",fontSize:11}} axisLine={false} tickLine={false} width={75}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Bar dataKey="value" name="Valor" fill={C.purple} radius={[0,4,4,0]} opacity={.85}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card span2">
                <div className="chart-title">Taxa de Poupança (%)</div>
                <div className="chart-insight">Percentual mensal poupado sobre a receita</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={macroData} margin={{left:-15,right:5,top:5}}>
                    <defs>
                      <linearGradient id="poupGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.green} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={C.green} stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08"/>
                    <XAxis dataKey="label" tick={{fill:"#7878a0",fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:"#7878a0",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`${v.toFixed(0)}%`}/>
                    <Tooltip formatter={v=>[`${v.toFixed(1)}%`,"Poupança"]}/>
                    <Area type="monotone" dataKey="poupanca" name="Poupança %" stroke={C.green} strokeWidth={2.5} fill="url(#poupGrad)" dot={{fill:C.green,r:3}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>}

          {/* RECEITAS */}
          {aba === "receitas" && (
            <div id="section-receitas" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.green}}/> Receitas
                <small>{MONTHS_LABELS[mesSel]}/{anoSel}</small>
              </div>
              <div className="form-row two-cols">
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Nome</label>
                  <input className="form-input" value={rNome} onChange={e=>setRNome(e.target.value)} placeholder="Ex: Salário"/>
                </div>
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Valor (R$)</label>
                  <input className="form-input" type="number" inputMode="decimal" value={rValor} onChange={e=>setRValor(e.target.value)} placeholder="0.00"/>
                </div>
                <button className="btn-add green" style={{gridColumn:"1 / -1"}} onClick={async()=>{
                  if(!rNome||!rValor)return;
                  await dd.addReceita(rNome, parseFloat(rValor), mesSel, anoSel);
                  setRNome(""); setRValor("");
                }}>+ Adicionar em {MONTHS_LABELS[mesSel]}</button>
              </div>
              <div className="summary-box">
                <div className="summary-item">Mês <strong style={{color:C.green}}>{brl(receitas.filter(r=>r.mes===mesSel&&r.ano===anoSel).reduce((a,r)=>a+r.valor,0))}</strong></div>
                <div className="summary-item">Anual <strong style={{color:C.cyan}}>{brl(receitas.filter(r=>r.ano===anoSel).reduce((a,r)=>a+r.valor,0))}</strong></div>
              </div>
              <div className="item-list">
                {receitas.filter(r=>r.mes===mesSel&&r.ano===anoSel).map(r=>(
                  <ItemCard key={r.id} value={r.valor} valueColor={C.green} deleteAction={
                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                      <button className="btn-del" onClick={()=>dd.delReceita(r.id)}>Excluir</button>
                    </div>
                  }>
                    <div className="item-name">{r.nome}</div>
                    <div className="item-meta"><span>{MONTHS_LABELS[r.mes]}/{r.ano}</span></div>
                  </ItemCard>
                ))}
                {receitas.filter(r=>r.mes===mesSel&&r.ano===anoSel).length===0&&
                  <div className="empty-state">Nenhuma receita em {MONTHS_LABELS[mesSel]}/{anoSel}</div>
                }
              </div>
            </div>
          )}

          {/* FIXAS */}
          {aba === "fixas" && (
            <div id="section-fixas" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.blue}}/> Fixas
                <small>vencimentos {MONTHS_LABELS[mesSel]}/{anoSel}</small>
              </div>
              <div className="form-row two-cols">
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Nome</label>
                  <input className="form-input" value={fNome} onChange={e=>setFNome(e.target.value)} placeholder="Ex: Aluguel"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Valor (R$)</label>
                  <input className="form-input" type="number" inputMode="decimal" value={fValor} onChange={e=>setFValor(e.target.value)} placeholder="0.00"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Dia venc.</label>
                  <input className="form-input" type="number" inputMode="numeric" min={1} max={31} value={fVenc} onChange={e=>setFVenc(e.target.value)} placeholder="10"/>
                </div>
                <button className="btn-add" style={{gridColumn:"1 / -1"}} onClick={async()=>{
                  if(!fNome||!fValor)return;
                  await dd.addFixa(fNome, parseFloat(fValor), fVenc?parseInt(fVenc):null);
                  setFNome(""); setFValor(""); setFVenc("");
                }}>+ Adicionar</button>
              </div>
              <div className="summary-box">
                <div className="summary-item">Mensal <strong style={{color:C.blue}}>{brl(totalFixas)}</strong></div>
                <div className="summary-item">% renda <strong style={{color:pctFixas>50?C.red:C.amber}}>{pct(pctFixas)}</strong></div>
                <div className="summary-item" style={{gridColumn:"1 / -1"}}>Anual <strong style={{color:C.purple}}>{brl(totalFixas*12)}</strong></div>
              </div>
              <div className="item-list">
                {fixas.map(f=>{
                  const pago = isPago("fixa", f.id, mesSel, anoSel);
                  const st = statusVencimento(f.vencimento, mesSel, anoSel, pago);
                  return (
                    <ItemCard key={f.id} paid={pago} value={f.valor} valueColor={C.red}
                      onTogglePay={()=>dd.togglePago("fixa", f.id, mesSel, anoSel)}
                      deleteAction={
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          <button className="btn-del" onClick={()=>dd.delFixa(f.id)}>Excluir</button>
                        </div>
                      }>
                      <div className="item-name">{f.nome}</div>
                      <div className="item-meta">
                        <span>{fmtDia(f.vencimento)}</span>
                        {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                        <span>{pct(curr.receita>0?(f.valor/curr.receita)*100:0)} renda</span>
                      </div>
                    </ItemCard>
                  );
                })}
                {fixas.length===0&&<div className="empty-state">Nenhuma despesa fixa cadastrada</div>}
              </div>
            </div>
          )}

          {/* VARIÁVEIS */}
          {aba === "variaveis" && (
            <div id="section-variaveis" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.amber}}/> Variáveis
                <small>{MONTHS_LABELS[mesSel]}/{anoSel}</small>
              </div>
              <div className="form-row two-cols">
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Nome</label>
                  <input className="form-input" value={vNome} onChange={e=>setVNome(e.target.value)} placeholder="Ex: Mercado"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Valor (R$)</label>
                  <input className="form-input" type="number" inputMode="decimal" value={vValor} onChange={e=>setVValor(e.target.value)} placeholder="0.00"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Dia venc.</label>
                  <input className="form-input" type="number" inputMode="numeric" min={1} max={31} value={vVenc} onChange={e=>setVVenc(e.target.value)} placeholder="Opc."/>
                </div>
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Categoria</label>
                  <select className="form-select" value={vCat} onChange={e=>setVCat(e.target.value)}>
                    {["Alimentação","Compras Online","Transferências","Serviços","Casa","Saúde","Transporte","Lazer","Outros"].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn-add" style={{gridColumn:"1 / -1"}} onClick={async()=>{
                  if(!vNome||!vValor)return;
                  await dd.addVariavel(vNome, parseFloat(vValor), vCat, mesSel, anoSel, vVenc?parseInt(vVenc):null);
                  setVNome(""); setVValor(""); setVVenc("");
                }}>+ Adicionar em {MONTHS_LABELS[mesSel]}</button>
              </div>
              <div className="summary-box">
                <div className="summary-item" style={{gridColumn:"1 / -1"}}>Total {MONTHS_LABELS[mesSel]}/{anoSel} <strong style={{color:C.amber}}>{brl(variaveis.filter(v=>v.mes===mesSel&&v.ano===anoSel).reduce((a,v)=>a+v.valor,0))}</strong></div>
              </div>
              <div className="item-list">
                {variaveis.filter(v=>v.mes===mesSel&&v.ano===anoSel).map(v=>{
                  const pago = isPago("variavel", v.id, v.mes, v.ano);
                  const st = statusVencimento(v.vencimento, v.mes, v.ano, pago);
                  return (
                    <ItemCard key={v.id} paid={pago} value={v.valor} valueColor={C.amber}
                      onTogglePay={()=>dd.togglePago("variavel", v.id, v.mes, v.ano)}
                      deleteAction={
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          <button className="btn-del" onClick={()=>dd.delVariavel(v.id)}>Excluir</button>
                        </div>
                      }>
                      <div className="item-name">{v.nome}</div>
                      <div className="item-meta">
                        <span>{v.categoria}</span>
                        {v.vencimento && <span>{fmtDia(v.vencimento)}</span>}
                        {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                      </div>
                    </ItemCard>
                  );
                })}
                {variaveis.filter(v=>v.mes===mesSel&&v.ano===anoSel).length===0&&
                  <div className="empty-state">Nenhuma despesa variável em {MONTHS_LABELS[mesSel]}/{anoSel}</div>
                }
              </div>
            </div>
          )}

          {/* CARTÕES */}
          {aba === "cartoes" && (
            <div id="section-cartoes" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.purple}}/> Cartões
                <small>{MONTHS_LABELS[mesSel]}/{anoSel}</small>
              </div>
              <div className="form-row two-cols">
                <div className="form-field" style={{gridColumn:"1 / -1"}}>
                  <label className="form-label">Cartão / Loja</label>
                  <input className="form-input" value={cNome} onChange={e=>setCNome(e.target.value)} placeholder="Ex: Nubank"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Valor (R$)</label>
                  <input className="form-input" type="number" inputMode="decimal" value={cValor} onChange={e=>setCValor(e.target.value)} placeholder="0.00"/>
                </div>
                <div className="form-field">
                  <label className="form-label">Dia venc.</label>
                  <input className="form-input" type="number" inputMode="numeric" min={1} max={31} value={cVenc} onChange={e=>setCVenc(e.target.value)} placeholder="15"/>
                </div>
                <button className="btn-add" style={{gridColumn:"1 / -1"}} onClick={async()=>{
                  if(!cNome||!cValor)return;
                  await dd.addCartao(cNome, parseFloat(cValor), mesSel, anoSel, cVenc?parseInt(cVenc):null);
                  setCNome(""); setCValor(""); setCVenc("");
                }}>+ Adicionar em {MONTHS_LABELS[mesSel]}</button>
              </div>
              <div className="summary-box">
                <div className="summary-item">Mês <strong style={{color:C.purple}}>{brl(cartoes.filter(c=>c.mes===mesSel&&c.ano===anoSel).reduce((a,c)=>a+c.valor,0))}</strong></div>
                <div className="summary-item">Anual <strong style={{color:C.cyan}}>{brl(cartoes.filter(c=>c.ano===anoSel).reduce((a,c)=>a+c.valor,0))}</strong></div>
              </div>
              <div className="item-list">
                {cartoes.filter(c=>c.mes===mesSel&&c.ano===anoSel).map(c=>{
                  const pago = isPago("cartao", c.id, c.mes, c.ano);
                  const st = statusVencimento(c.vencimento, c.mes, c.ano, pago);
                  return (
                    <ItemCard key={c.id} paid={pago} value={c.valor} valueColor={C.purple}
                      onTogglePay={()=>dd.togglePago("cartao", c.id, c.mes, c.ano)}
                      deleteAction={
                        <div style={{display:"flex",justifyContent:"flex-end"}}>
                          <button className="btn-del" onClick={()=>dd.delCartao(c.id)}>Excluir</button>
                        </div>
                      }>
                      <div className="item-name">{c.nome}</div>
                      <div className="item-meta">
                        <span>{fmtDia(c.vencimento)}</span>
                        {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                      </div>
                    </ItemCard>
                  );
                })}
                {cartoes.filter(c=>c.mes===mesSel&&c.ano===anoSel).length===0&&
                  <div className="empty-state">Nenhuma despesa de cartão em {MONTHS_LABELS[mesSel]}/{anoSel}</div>
                }
              </div>
            </div>
          )}

          {/* DETALHES */}
          {aba === "detalhes" && (
            <div id="section-detalhes" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.cyan}}/>
                Detalhes
                <small>{MONTHS_LABELS[mesSel]}/{anoSel}</small>
              </div>
              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="detail-stat-label">Receitas</span>
                  <span className="detail-stat-value" style={{color:C.green}}>{brl(curr.receita)}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Despesas</span>
                  <span className="detail-stat-value" style={{color:C.red}}>{brl(curr.despesa)}</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat-label">Saldo</span>
                  <span className="detail-stat-value" style={{color:curr.saldo>=0?C.green:C.red}}>{brl(curr.saldo)}</span>
                </div>
              </div>

              <div className="detail-grid">
                <div>
                  <div className="detail-section-title">
                    <span style={{display:"flex",alignItems:"center",gap:8,color:C.green}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:C.green}}/> Entradas
                    </span>
                  </div>
                  <div className="item-list">
                    {receitas.filter(r=>r.mes===mesSel&&r.ano===anoSel).map(r=>(
                      <ItemCard key={r.id} value={r.valor} valueColor={C.green}>
                        <div className="item-name">{r.nome}</div>
                      </ItemCard>
                    ))}
                    {receitas.filter(r=>r.mes===mesSel&&r.ano===anoSel).length===0&&
                      <div className="empty-state">Sem entradas</div>
                    }
                  </div>
                </div>

                <div>
                  <div className="detail-section-title">
                    <span style={{display:"flex",alignItems:"center",gap:8,color:C.red}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:C.red}}/> Saídas
                    </span>
                    {(() => {
                      const todos = [
                        ...fixas.map(f=>({k:`fixa|${f.id}|${mesSel}|${anoSel}`,v:f.valor})),
                        ...variaveis.filter(v=>v.mes===mesSel&&v.ano===anoSel).map(v=>({k:`variavel|${v.id}|${v.mes}|${v.ano}`,v:v.valor})),
                        ...cartoes.filter(c=>c.mes===mesSel&&c.ano===anoSel).map(c=>({k:`cartao|${c.id}|${c.mes}|${c.ano}`,v:c.valor})),
                      ];
                      const pagos = todos.filter(x=>pagamentos[x.k]);
                      const totalPago = pagos.reduce((a,x)=>a+x.v,0);
                      return (
                        <span className="pay-counter">
                          <span style={{color:C.green,fontWeight:600}}>{pagos.length}/{todos.length}</span> · <span style={{color:C.green,fontWeight:600}}>{brlCompact(totalPago)}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <div className="item-list">
                    {fixas.map(f=>{
                      const pago = isPago("fixa", f.id, mesSel, anoSel);
                      const st = statusVencimento(f.vencimento, mesSel, anoSel, pago);
                      return (
                        <ItemCard key={`f-${f.id}`} paid={pago} value={f.valor} valueColor={C.red}
                          onTogglePay={()=>dd.togglePago("fixa", f.id, mesSel, anoSel)}>
                          <div className="item-name">{f.nome}</div>
                          <div className="item-meta">
                            <span style={{color:C.blue}}>Fixa</span>
                            {f.vencimento && <span>{fmtDia(f.vencimento)}</span>}
                            {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                          </div>
                        </ItemCard>
                      );
                    })}
                    {variaveis.filter(v=>v.mes===mesSel&&v.ano===anoSel).map(v=>{
                      const pago = isPago("variavel", v.id, v.mes, v.ano);
                      const st = statusVencimento(v.vencimento, v.mes, v.ano, pago);
                      return (
                        <ItemCard key={`v-${v.id}`} paid={pago} value={v.valor} valueColor={C.red}
                          onTogglePay={()=>dd.togglePago("variavel", v.id, v.mes, v.ano)}>
                          <div className="item-name">{v.nome}</div>
                          <div className="item-meta">
                            <span style={{color:C.amber}}>{v.categoria}</span>
                            {v.vencimento && <span>{fmtDia(v.vencimento)}</span>}
                            {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                          </div>
                        </ItemCard>
                      );
                    })}
                    {cartoes.filter(c=>c.mes===mesSel&&c.ano===anoSel).map(c=>{
                      const pago = isPago("cartao", c.id, c.mes, c.ano);
                      const st = statusVencimento(c.vencimento, c.mes, c.ano, pago);
                      return (
                        <ItemCard key={`c-${c.id}`} paid={pago} value={c.valor} valueColor={C.red}
                          onTogglePay={()=>dd.togglePago("cartao", c.id, c.mes, c.ano)}>
                          <div className="item-name">{c.nome}</div>
                          <div className="item-meta">
                            <span style={{color:C.purple}}>Cartão</span>
                            {c.vencimento && <span>{fmtDia(c.vencimento)}</span>}
                            {st && <span className="venc-pill" style={{color:st.color,background:`${st.color}1a`}}>{st.txt}</span>}
                          </div>
                        </ItemCard>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:600,color:"#f0f0fa",marginBottom:8}}>Distribuição das saídas</div>
                <div style={{display:"flex",height:12,borderRadius:6,overflow:"hidden",background:"#0e0e18"}}>
                  {curr.despesa > 0 && <>
                    <div style={{width:`${(curr.fixasTot/curr.despesa)*100}%`,background:C.blue}}/>
                    <div style={{width:`${(curr.cartTot/curr.despesa)*100}%`,background:C.purple}}/>
                    <div style={{width:`${(curr.varTot/curr.despesa)*100}%`,background:C.amber}}/>
                  </>}
                </div>
                <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap",fontSize:11,color:"#7878a0"}}>
                  <span><span style={{display:"inline-block",width:8,height:8,background:C.blue,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/>Fixas {brlCompact(curr.fixasTot)}</span>
                  <span><span style={{display:"inline-block",width:8,height:8,background:C.purple,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/>Cartões {brlCompact(curr.cartTot)}</span>
                  <span><span style={{display:"inline-block",width:8,height:8,background:C.amber,borderRadius:2,marginRight:4,verticalAlign:"middle"}}/>Variáveis {brlCompact(curr.varTot)}</span>
                </div>
              </div>
            </div>
          )}

          {/* POUPANÇA */}
          {aba === "poupanca" && (
            <div id="section-poupanca" className="section-card anchor">
              <div className="section-title">
                <span className="bar" style={{background:C.green}}/>
                Poupança {ruleNec}/{ruleDes}/{rulePou}
              </div>
              <p style={{fontSize:12,color:"#7878a0",marginBottom:14,lineHeight:1.5}}>
                Ajuste os percentuais e compare sua distribuição real com o ideal.<br/>
                <strong style={{color:"#f0f0fa"}}>{MONTHS_LABELS[currentM]}/{anoSel} — Receita: {brl(curr.receita)}</strong>
              </p>
              <div className="savings-grid" style={{marginBottom:14}}>
                <div className="savings-block">
                  <div className="savings-block-label">🏠 Necessidades</div>
                  <div className="savings-value" style={{color:C.blue}}>{ruleNec}%</div>
                  <input type="range" className="savings-slider" min={20} max={70} value={ruleNec}
                    onChange={e=>{ const n=parseInt(e.target.value); setRuleNec(n); if(n+ruleDes>95) setRuleDes(95-n); }}
                    style={{accentColor:C.blue}}/>
                  <div className="savings-bar-bg"><div className="savings-bar-fill" style={{width:`${ruleNec}%`,background:C.blue}}/></div>
                  <div style={{fontSize:11,color:"#7878a0",marginTop:6}}>Sugerido: {brl(curr.receita*ruleNec/100)}</div>
                </div>
                <div className="savings-block">
                  <div className="savings-block-label">🎭 Desejos</div>
                  <div className="savings-value" style={{color:C.purple}}>{ruleDes}%</div>
                  <input type="range" className="savings-slider" min={5} max={50} value={ruleDes}
                    onChange={e=>{ const n=parseInt(e.target.value); setRuleDes(n); if(ruleNec+n>95) setRuleNec(95-n); }}
                    style={{accentColor:C.purple}}/>
                  <div className="savings-bar-bg"><div className="savings-bar-fill" style={{width:`${ruleDes}%`,background:C.purple}}/></div>
                  <div style={{fontSize:11,color:"#7878a0",marginTop:6}}>Sugerido: {brl(curr.receita*ruleDes/100)}</div>
                </div>
                <div className="savings-block">
                  <div className="savings-block-label">💰 Poupança</div>
                  <div className="savings-value" style={{color:rulePou>0?C.green:C.red}}>{rulePou}%</div>
                  <div style={{height:6,background:"#ffffff0d",borderRadius:3,marginTop:14,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,background:C.green,width:`${rulePou}%`,transition:"width .4s"}}/>
                  </div>
                  <div style={{fontSize:11,color:"#7878a0",marginTop:6}}>Meta: {brl(sugPou)}</div>
                </div>
              </div>

              <div style={{background:"#0e0e18",borderRadius:11,padding:14,border:"1px solid #ffffff0f"}}>
                <div style={{fontSize:12,fontWeight:600,marginBottom:12,color:"#f0f0fa"}}>Real vs Meta</div>
                <div className="compare-grid">
                  <div>
                    <div style={{fontSize:9,color:"#7878a0",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:3}}>Real</div>
                    <div style={{fontSize:18,fontWeight:700,fontFamily:"DM Mono",color:curr.saldo>=0?C.green:C.red}}>{brl(curr.saldo)}</div>
                    <div style={{fontSize:10,color:"#7878a0",marginTop:2}}>{pct(poupancaReal)}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#7878a0",textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:3}}>Meta</div>
                    <div style={{fontSize:18,fontWeight:700,fontFamily:"DM Mono",color:C.green}}>{brl(sugPou)}</div>
                    <div style={{fontSize:10,color:"#7878a0",marginTop:2}}>{rulePou}%</div>
                  </div>
                  <div style={{gridColumn:"1 / -1",marginTop:6}}>
                    <span className={`indicator ${savingsStatus}`}>
                      {savingsStatus==="green"?"✓ Meta atingida":savingsStatus==="amber"?"⚠ Parcial":"✗ Abaixo da meta"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="dash-footer">
          Atualizado em {new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})} · {profile.email}
        </div>
      </div>
    </>
  );
}
