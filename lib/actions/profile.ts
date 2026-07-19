"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I — easier for a kid to type correctly

function generateLinkCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function createStudentProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const displayName = String(formData.get("displayName"));
  const yearLevel = Number(formData.get("yearLevel"));
  const avatarId = String(formData.get("avatarId"));
  const theme = String(formData.get("theme")) as "adventure" | "explorer";
  const gender = formData.get("gender") ? String(formData.get("gender")) : null;

  let error = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const linkCode = generateLinkCode();
    const result = await supabase.from("students").insert({
      user_id: user!.id,
      display_name: displayName,
      year_level: yearLevel,
      avatar_id: avatarId,
      theme,
      gender,
      link_code: linkCode,
    });
    error = result.error;
    if (!error || error.code !== "23505") break; // 23505 = unique_violation, worth retrying with a new code
  }

  if (error) {
    console.error("[createStudentProfile] insert failed:", error);
    return { error: `Gagal simpan profil: ${error.message}` };
  }

  redirect("/dashboard");
}

export async function updateLanguagePref(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const languagePref = String(formData.get("languagePref"));
  await supabase.from("students").update({ language_pref: languagePref }).eq("user_id", user.id);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

const A11Y_FIELDS = ["a11y_large_text", "a11y_dyslexia_font", "a11y_low_distraction"] as const;
type A11yField = (typeof A11Y_FIELDS)[number];

export async function updateAccessibilityPref(field: A11yField, value: boolean) {
  if (!A11Y_FIELDS.includes(field)) return; // guard against an unexpected field name reaching the DB

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("students").update({ [field]: value }).eq("user_id", user.id);
  // Layout renders the <body> classes server-side, so the whole tree
  // (not just /profile) needs to re-render for the toggle to take effect
  // immediately.
  revalidatePath("/", "layout");
}
