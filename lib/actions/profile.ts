"use server";

import { redirect } from "next/navigation";
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
    return { error: "Gagal simpan profil. Sila cuba lagi." };
  }

  redirect("/dashboard");
}
