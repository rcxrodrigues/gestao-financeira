"use client";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div style={styles.root}>
      <div style={styles.bg}/>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>💰</div>
          <div>
            <div style={styles.logoText}>Dashboard Financeiro</div>
            <div style={styles.logoSub}>Gestão pessoal</div>
          </div>
        </div>
        <h1 style={styles.title}>{title}</h1>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        <div style={styles.body}>{children}</div>
        {footer && <div style={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px 16px", position: "relative", overflow: "hidden",
  },
  bg: {
    position: "absolute", inset: 0, zIndex: 0,
    background: "radial-gradient(circle at 30% 20%, #22d98a18, transparent 50%), radial-gradient(circle at 70% 80%, #5b9cf618, transparent 50%)",
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 420,
    background: "#16161f", border: "1px solid #ffffff0f", borderRadius: 16,
    padding: "28px 22px", boxShadow: "0 20px 60px #00000060",
  },
  logoRow: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 24,
  },
  logoIcon: {
    width: 40, height: 40, borderRadius: 11,
    background: "linear-gradient(135deg, #22d98a, #5b9cf6)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
  },
  logoText: { fontSize: 15, fontWeight: 700, letterSpacing: "-0.3px" },
  logoSub: { fontSize: 10, color: "#7878a0", textTransform: "uppercase", letterSpacing: "0.5px" },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.5px" },
  subtitle: { fontSize: 13, color: "#7878a0", marginBottom: 20, lineHeight: 1.5 },
  body: { display: "flex", flexDirection: "column", gap: 12 },
  footer: { marginTop: 18, paddingTop: 18, borderTop: "1px solid #ffffff0a", textAlign: "center", fontSize: 13, color: "#7878a0" },
};
