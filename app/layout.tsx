import type { Metadata, Viewport } from "next";
import { Baloo_2, Plus_Jakarta_Sans, JetBrains_Mono, Lexend } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-baloo" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains" });
// Lexend — a real, research-backed font for reading ease, used for the
// "dyslexia-friendly font" toggle. The CSS previously referenced
// "OpenDyslexic", a font that was never actually loaded anywhere, so that
// toggle silently did nothing.
const lexend = Lexend({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: "Congak — Matematik Jadi Mudah",
  description: "Platform pembelajaran matematik KSSR untuk murid Tahun 4, 5 dan 6.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Congak" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F4A93B",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Accessibility prefs need to be known before the <body> tag renders, so
  // this reads directly here rather than passing lang/prefs down through
  // every page — auth pages with no logged-in student just get all-off
  // defaults, which is correct (nothing to apply yet).
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: student } = user
    ? await supabase
        .from("students")
        .select("a11y_large_text, a11y_dyslexia_font, a11y_low_distraction")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  const bodyClasses = [
    baloo.variable,
    jakarta.variable,
    jetbrains.variable,
    lexend.variable,
    student?.a11y_large_text && "a11y-large-text",
    student?.a11y_dyslexia_font && "a11y-dyslexia-font",
    student?.a11y_low_distraction && "a11y-low-distraction",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <html lang="ms">
      <body className={bodyClasses}>{children}</body>
    </html>
  );
}
