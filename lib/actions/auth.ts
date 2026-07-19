"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const role = String(formData.get("role")) as "student" | "parent";

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) {
    return { error: error?.message ?? "Pendaftaran gagal. Sila cuba lagi." };
  }

  // Mirror the auth user into our own `users` table with their role —
  // everything downstream (students, parent_links, RLS policies) keys off this.
  const { error: userRowError } = await supabase
    .from("users")
    .insert({ id: data.user.id, role });

  if (userRowError && userRowError.code !== "23505") {
    // 23505 = unique_violation: this can happen if a previous signup
    // attempt with the same email already created the users row (Supabase
    // returns the same existing auth user on a repeat signUp call rather
    // than erroring, as an anti-enumeration measure). That's recoverable —
    // the row we want already exists — so only real failures stop the flow.
    console.error("[signUp] users insert failed:", userRowError);
    return { error: `Akaun dicipta tetapi profil gagal disediakan: ${userRowError.message}` };
  }

  redirect(role === "student" ? "/profile/setup" : "/parent/dashboard");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: "Emel atau kata laluan tidak sah." };
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single();

  redirect(userRow?.role === "parent" ? "/parent/dashboard" : "/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
