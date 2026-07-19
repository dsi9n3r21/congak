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

  if (userRowError) {
    return { error: "Akaun dicipta tetapi profil gagal disediakan. Sila hubungi sokongan." };
  }

  redirect(role === "student" ? "/profile/setup" : "/parent/dashboard");
}

export async function login(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Emel atau kata laluan tidak sah." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
