"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function linkChildByCode(formData: FormData) {
  const code = String(formData.get("code")).trim().toUpperCase();
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sila log masuk semula." };

  const { data: matches, error: lookupError } = await supabase.rpc("find_student_by_link_code", {
    code,
  });

  if (lookupError || !matches || matches.length === 0) {
    return { error: "Kod tidak sah. Sila semak semula dengan anak anda." };
  }

  const student = matches[0];

  const { error: linkError } = await supabase
    .from("parent_links")
    .insert({ parent_user_id: user.id, student_id: student.id });

  if (linkError) {
    if (linkError.code === "23505") {
      return { error: "Anak ini sudah pun dipautkan ke akaun anda." };
    }
    return { error: "Gagal pautkan akaun. Sila cuba lagi." };
  }

  revalidatePath("/parent/dashboard");
  return { success: true, childName: student.display_name as string };
}
