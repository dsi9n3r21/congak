import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Homepage } from "@/components/home/Homepage";

// Logged-out visitors land on the marketing homepage below. Logged-in
// visitors get sent straight to their real destination — a student
// account (row in `students`) goes to /dashboard, a parent account (a
// row in `parent_links` for this user) goes to /parent/dashboard — same
// two lookups the dashboard pages themselves already use to tell the two
// apart, so this stays in sync with how auth actually works elsewhere.
export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
    if (student) redirect("/dashboard");

    const { data: parentLink } = await supabase
      .from("parent_links")
      .select("id")
      .eq("parent_user_id", user.id)
      .maybeSingle();
    if (parentLink) redirect("/parent/dashboard");

    // Logged in but neither record exists yet (e.g. mid-signup) — send
    // to the student profile setup flow rather than showing marketing
    // copy to someone who already has an account.
    redirect("/profile/setup");
  }

  return <Homepage />;
}
