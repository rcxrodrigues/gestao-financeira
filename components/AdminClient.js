"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const C = {
  bg: "#07070e", card: "#16161f", border: "#ffffff0f",
  text: "#f0f0fa", textMuted: "#7878a0",
  green: "#22d98a", blue: "#5b9cf6", purple: "#a78bfa",
  red: "#f05f5f", amber: "#fbbf24",
};

const styles = `
  .admin-root { min-height: 100vh; background: #07070e; padding: 0 0 60px; }
  .admin-header {
    background: linear-gradient(180deg, #13131e 0%, transparent 100%);
    border-bottom: 1px solid #ffffff0f;
    padding: 12px 14px;
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px);
  }
  .admin-title { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .admin-badge {
    background: linear-gradient(135deg, #a78bfa, #5b9cf6);
    width: 32px; height: 32px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center; font-size: 16px;
    flex-shrink: 0;
  }
  .admin-name { font-size: 14px; font-weight: 700; }
  .admin-sub { font-size: 9px; color: #7878a0; text-transform: uppercase; letter-spacing: 0.5px; }
  .back-link {
    padding: 6px 10px; border-radius: 8px; background: transparent;
    border: 1px solid #ffffff15; color: #a0a0c0; font-size: 11px; font-weight: 500;
    white-space: nowrap; display: inline-flex; align-items: center; gap: 4px;
  }

  .admin-content { padding: 14px; display: flex; flex-direction: column; gap: 14px; }

  /* Stats - 2 colunas em mobile */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card {
    background: #16161f; border: 1px solid #ffffff0f; border-radius: 12px;
    padding: 12px 14px;
  }
  .stat-label { font-size: 9px; font-weight: 600; color: #7878a0; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 5px; }
  .stat-value { font-size: 22px; font-weight: 700; font-family: 'DM Mono', monospace; }

  /* Filter - scroll horizontal */
  .filter-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin: 0 -14px;
    padding: 0 14px;
  }
  .filter-wrap::-webkit-scrollbar { display: none; }
  .filter-bar { display: flex; gap: 6px; min-width: min-content; }
  .filter-btn {
    padding: 8px 14px; border-radius: 8px; border: 1px solid #ffffff0f;
    background: transparent; color: #7878a0; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all .18s; white-space: nowrap;
    min-height: 36px;
  }
  .filter-btn.active { background: #5b9cf618; border-color: #5b9cf660; color: #5b9cf6; font-weight: 600; }

  .users-card { background: #16161f; border: 1px solid #ffffff0f; border-radius: 12px; padding: 14px; }
  .users-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }

  /* User cards em vez de tabela */
  .user-list { display: flex; flex-direction: column; gap: 10px; }
  .user-card {
    background: #0e0e18; border: 1px solid #ffffff0a; border-radius: 11px;
    padding: 12px; display: flex; flex-direction: column; gap: 10px;
  }
  .user-row1 {
    display: flex; justify-content: space-between; gap: 10px; align-items: flex-start;
  }
  .user-info { min-width: 0; flex: 1; }
  .user-name { font-size: 14px; font-weight: 600; color: #f0f0fa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-email { font-size: 11px; color: #7878a0; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .user-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

  .status-pill {
    display: inline-block; padding: 3px 9px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
  }
  .status-pill.pending   { background: #fbbf241a; color: #fbbf24; }
  .status-pill.approved  { background: #22d98a1a; color: #22d98a; }
  .status-pill.rejected  { background: #f05f5f1a; color: #f05f5f; }
  .status-pill.suspended { background: #f05f5f1a; color: #f05f5f; }
  .role-pill {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .role-pill.admin { background: #a78bfa1a; color: #a78bfa; }
  .role-pill.user  { background: #ffffff08; color: #7878a0; }
  .me-tag { font-size: 10px; color: #a78bfa; }

  .user-row2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: center;
    padding-top: 10px; border-top: 1px solid #ffffff0a;
  }
  .plan-block {
    display: flex; flex-direction: column; gap: 4px;
  }
  .plan-label { font-size: 9px; color: #7878a0; text-transform: uppercase; letter-spacing: 0.5px; }
  .plan-select {
    background: #0d0d18; border: 1px solid #ffffff15; border-radius: 7px;
    color: #f0f0fa; font-family: 'DM Sans', sans-serif; font-size: 12px;
    padding: 7px 9px; outline: none; cursor: pointer; min-height: 36px;
  }
  .date-block {
    display: flex; flex-direction: column; gap: 4px; text-align: right;
  }
  .date-label { font-size: 9px; color: #7878a0; text-transform: uppercase; letter-spacing: 0.5px; }
  .date-value { font-size: 12px; color: #a0a0c0; }

  .actions {
    display: flex; gap: 6px; flex-wrap: wrap;
    padding-top: 10px; border-top: 1px solid #ffffff0a;
  }
  .btn-action {
    flex: 1; min-width: 80px;
    padding: 9px 12px; border-radius: 8px; border: 1px solid;
    font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s;
    min-height: 36px;
  }
  .btn-action:active { transform: scale(0.97); }
  .btn-approve { border-color: #22d98a40; background: #22d98a1a; color: #22d98a; }
  .btn-reject  { border-color: #f05f5f40; background: #f05f5f1a; color: #f05f5f; }
  .btn-suspend { border-color: #fbbf2440; background: #fbbf241a; color: #fbbf24; }
  .btn-reactivate { border-color: #5b9cf640; background: #5b9cf61a; color: #5b9cf6; }
  .no-actions { font-size:11px; color:#7878a0; text-align:center; padding:8px; width:100%; }

  .empty { text-align: center; padding: 36px 12px; color: #7878a0; font-size: 13px; }
  .toast {
    position: fixed; bottom: 20px; left: 14px; right: 14px; z-index: 200;
    padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    box-shadow: 0 8px 24px #00000060; animation: slideIn .25s ease;
    text-align: center;
  }
  .toast.success { background: #22d98a; color: #0a0a0f; }
  .toast.error   { background: #f05f5f; color: #fff; }
  @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  @media (min-width: 768px) {
    .admin-header { padding: 18px 24px 16px; }
    .admin-badge { width: 36px; height: 36px; font-size: 18px; }
    .admin-name { font-size: 16px; }
    .admin-sub { font-size: 10px; }
    .admin-content { padding: 24px; gap: 22px; }
    .stats-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
    .stat-card { padding: 16px 18px; }
    .stat-value { font-size: 24px; }
    .filter-wrap { margin: 0; padding: 0; }
    .users-card { padding: 20px; }
    .user-card { padding: 14px; }
    .toast { left: auto; right: 24px; bottom: 24px; }
  }
`;

const fmtData = (s) => s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—";

export default function AdminClient({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(data.users || []);
    } catch (err) {
      showToast(err.message || "Erro ao carregar", "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUser = async (id, updates) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers(u => u.map(x => x.id === id ? { ...x, ...updates } : x));
      showToast("Atualizado");
    } catch (err) {
      showToast(err.message || "Erro", "error");
    }
  };

  const filtered = users.filter(u => filter === "all" ? true : u.status === filter);

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === "pending").length,
    approved: users.filter(u => u.status === "approved").length,
    rejected: users.filter(u => u.status === "rejected").length,
    suspended: users.filter(u => u.status === "suspended").length,
  };

  const statusLabels = { pending: "Pendente", approved: "Aprovado", rejected: "Recusado", suspended: "Suspenso" };

  return (
    <>
      <style>{styles}</style>
      <div className="admin-root">
        <header className="admin-header">
          <div className="admin-title">
            <div className="admin-badge">👑</div>
            <div style={{minWidth:0}}>
              <div className="admin-name">Painel Admin</div>
              <div className="admin-sub">Usuários</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Link href="/dashboard" className="back-link">← Dashboard</Link>
            <LogoutButton compact/>
          </div>
        </header>

        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value" style={{color:C.text}}>{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pendentes</div>
              <div className="stat-value" style={{color:C.amber}}>{stats.pending}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Aprovados</div>
              <div className="stat-value" style={{color:C.green}}>{stats.approved}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Inativos</div>
              <div className="stat-value" style={{color:C.red}}>{stats.rejected + stats.suspended}</div>
            </div>
          </div>

          <div className="filter-wrap">
            <div className="filter-bar">
              {[
                ["all", `Todos · ${stats.total}`],
                ["pending", `Pendentes · ${stats.pending}`],
                ["approved", `Aprovados · ${stats.approved}`],
                ["rejected", `Recusados · ${stats.rejected}`],
                ["suspended", `Suspensos · ${stats.suspended}`],
              ].map(([k, l]) => (
                <button key={k} className={`filter-btn ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="users-card">
            <div className="users-title">Usuários ({filtered.length})</div>
            {loading ? (
              <div className="empty">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">Nenhum usuário com este filtro</div>
            ) : (
              <div className="user-list">
                {filtered.map(u => {
                  const isMe = u.id === currentUserId;
                  return (
                    <div key={u.id} className="user-card">
                      <div className="user-row1">
                        <div className="user-info">
                          <div className="user-name">
                            {u.nome || u.email.split("@")[0]}
                            {isMe && <span className="me-tag" style={{marginLeft:6}}>(você)</span>}
                          </div>
                          <div className="user-email">{u.email}</div>
                        </div>
                        <div className="user-meta">
                          <span className={`role-pill ${u.role}`}>{u.role}</span>
                          <span className={`status-pill ${u.status}`}>{statusLabels[u.status]}</span>
                        </div>
                      </div>

                      <div className="user-row2">
                        <div className="plan-block">
                          <span className="plan-label">Plano</span>
                          <select className="plan-select" value={u.plano || "free"} onChange={e=>updateUser(u.id, { plano: e.target.value })} disabled={isMe}>
                            <option value="free">Free</option>
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>
                        <div className="date-block">
                          <span className="date-label">Cadastro</span>
                          <span className="date-value">{fmtData(u.created_at)}</span>
                        </div>
                      </div>

                      <div className="actions">
                        {isMe ? (
                          <div className="no-actions">— sem ações disponíveis para si mesmo —</div>
                        ) : <>
                          {u.status === "pending" && <>
                            <button className="btn-action btn-approve" onClick={()=>updateUser(u.id, { status: "approved" })}>✓ Aprovar</button>
                            <button className="btn-action btn-reject"  onClick={()=>updateUser(u.id, { status: "rejected" })}>✗ Recusar</button>
                          </>}
                          {u.status === "approved" && (
                            <button className="btn-action btn-suspend" onClick={()=>updateUser(u.id, { status: "suspended" })}>⏸ Suspender</button>
                          )}
                          {(u.status === "rejected" || u.status === "suspended") && (
                            <button className="btn-action btn-reactivate" onClick={()=>updateUser(u.id, { status: "approved" })}>↻ Reativar</button>
                          )}
                        </>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  );
}
