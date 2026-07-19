import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/ui/BottomNav";

export default async function QuestsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student } = await supabase
    .from("students")
    .select("language_pref")
    .eq("user_id", user?.id ?? "")
    .single();
  const lang = student?.language_pref ?? "both";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-24 text-center md:pb-8">
      <p className="text-5xl">🪁</p>
      <h1 className="mt-3 font-display text-xl font-bold text-ink">
        {lang === "en" ? "Adventure Mode is coming soon!" : "Mod Pengembaraan akan tiba tidak lama lagi!"}
      </h1>
      <p className="mt-2 max-w-xs text-sm text-ink/50">
        {lang === "en"
          ? "A world map with badges, daily missions, and weekly challenges is on the way."
          : "Peta dunia dengan lencana, misi harian, dan cabaran mingguan akan tiba."}
      </p>
      <BottomNav />
    </main>
  );
}
