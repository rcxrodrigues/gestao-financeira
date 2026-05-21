import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import AdminClient from "@/components/AdminClient";

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.status !== "approved") {
    redirect("/dashboard");
  }

  return <AdminClient currentUserId={user.id}/>;
}
