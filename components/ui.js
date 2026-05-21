"use client";

export function Field({ label, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#7878a0", letterSpacing: "0.5px", textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        {...props}
        style={{
          background: "#0d0d18", border: "1px solid #ffffff15", borderRadius: 10,
          color: "#f0f0fa", fontFamily: "DM Sans, sans-serif", fontSize: 15,
          padding: "13px 14px", outline: "none", transition: "border-color .18s",
          minHeight: 46, WebkitAppearance: "none",
          ...(props.style || {}),
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#5b9cf680")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#ffffff15")}
      />
    </label>
  );
}

export function PrimaryButton({ loading, children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        padding: "13px 18px", borderRadius: 10, border: "none",
        cursor: loading ? "wait" : "pointer",
        background: "linear-gradient(135deg, #5b9cf6, #a78bfa)",
        color: "#fff", fontFamily: "DM Sans, sans-serif", fontSize: 15, fontWeight: 600,
        opacity: loading ? 0.7 : 1, transition: "opacity .18s",
        minHeight: 48, WebkitTapHighlightColor: "transparent",
        ...(props.style || {}),
      }}
    >
      {loading ? "Aguarde..." : children}
    </button>
  );
}

export function ErrorMsg({ children }) {
  if (!children) return null;
  return (
    <div style={{
      padding: "11px 13px", borderRadius: 9, background: "#f05f5f1a",
      border: "1px solid #f05f5f40", color: "#f05f5f", fontSize: 13,
    }}>
      {children}
    </div>
  );
}

export function SuccessMsg({ children }) {
  if (!children) return null;
  return (
    <div style={{
      padding: "11px 13px", borderRadius: 9, background: "#22d98a1a",
      border: "1px solid #22d98a40", color: "#22d98a", fontSize: 13, lineHeight: 1.4,
    }}>
      {children}
    </div>
  );
}
