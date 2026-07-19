import type { Metadata, Viewport } from "next";
import { Baloo_2, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-baloo" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jetbrains" });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className={`${baloo.variable} ${jakarta.variable} ${jetbrains.variable}`}>
        {children}
      </body>
    </html>
  );
}
