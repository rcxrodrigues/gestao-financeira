import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, role, nome, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "approved") redirect("/pending");

  return <DashboardClient userId={user.id} profile={profile}/>;
}
