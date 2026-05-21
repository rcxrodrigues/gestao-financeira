"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LogoutButton({ compact = false }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (compact) {
    return (
      <button onClick={handleLogout} style={{
        padding: "6px 12px", borderRadius: 8, border: "1px solid #ffffff15",
        background: "transparent", color: "#7878a0", fontSize: 12, fontWeight: 500,
        cursor: "pointer", transition: "all .18s",
      }} onMouseEnter={e => e.currentTarget.style.color = "#f0f0fa"}
         onMouseLeave={e => e.currentTarget.style.color = "#7878a0"}>
        Sair
      </button>
    );
  }

  return (
    <button onClick={handleLogout} style={{
      padding: "10px 16px", borderRadius: 10, border: "1px solid #ffffff15",
      background: "transparent", color: "#a0a0c0", fontSize: 13, fontWeight: 500,
      cursor: "pointer", marginTop: 10,
    }}>
      Sair da conta
    </button>
  );
}
