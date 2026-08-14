import type { Bilingual } from "@/lib/i18n/dictionary";

/** Bilingual marketing copy for the public homepage (app/page.tsx). Kept
 * out of lib/i18n/dictionary.ts (UI) since none of this is reused by any
 * other screen — same reasoning dictionary.ts already documents for
 * content-specific text living alongside its own content.
 *
 * Two intentional departures from the original homepage brief, both for
 * honesty rather than polish:
 *  - "Thousands of questions" became "Unlimited practice questions" —
 *    every question is randomly generated fresh from a generator, not
 *    drawn from a fixed bank, so "unlimited" is the true (and stronger)
 *    claim.
 *  - The brief's placeholder stats ("10,000+ Questions Completed", "95%
 *    Student Satisfaction") were fabricated numbers with nothing behind
 *    them yet. Swapped for real, verifiable facts about the content
 *    system instead (topic count, year coverage) — see byTheNumbers
 *    below. Swap in real usage/satisfaction stats once they exist.
 */
export const HOME = {
  nav: {
    login: { ms: "Log Masuk", en: "Log In" } satisfies Bilingual,
  },

  hero: {
    headline: {
      ms: "Kuasai Matematik Bersama Jurulatih AI Peribadi Anda",
      en: "Master Mathematics with Your Personal AI Coach",
    } satisfies Bilingual,
    subheadline: {
      ms: "Pembelajaran selari KSSR untuk murid sekolah rendah Malaysia. Berlatih, belajar, dan tingkatkan prestasi dengan bimbingan Pintar AI di setiap langkah.",
      en: "KSSR-aligned learning for Malaysian primary students. Practice, learn, and improve with Pintar AI guiding every step.",
    } satisfies Bilingual,
    ctaPrimary: { ms: "Mula Belajar Percuma", en: "Start Learning Free" } satisfies Bilingual,
    ctaSecondary: { ms: "Lihat Cara Ia Berfungsi", en: "See How It Works" } satisfies Bilingual,
    chipStreak: { ms: "7 hari berturut-turut", en: "7-day streak" } satisfies Bilingual,
    chipXp: { ms: "+120 XP", en: "+120 XP" } satisfies Bilingual,
  },

  trust: {
    headline: {
      ms: "Direka Khusus untuk Murid Sekolah Rendah Malaysia",
      en: "Designed for Malaysian Primary Students",
    } satisfies Bilingual,
    items: [
      { ms: "Selari dengan KSSR", en: "KSSR Aligned" },
      { ms: "Tahun 4, 5 & 6", en: "Year 4, 5 & 6" },
      { ms: "Sokongan Pembelajaran Berkuasa AI", en: "AI-Powered Learning Support" },
      { ms: "Penjelasan Langkah demi Langkah", en: "Step-by-Step Explanations" },
      { ms: "Persediaan Peperiksaan", en: "Exam Preparation" },
      { ms: "Penjejakan Kemajuan", en: "Progress Tracking" },
    ] satisfies Bilingual[],
  },

  valueProps: {
    headline: { ms: "Lebih Daripada Sekadar Soalan Latihan", en: "More Than Just Practice Questions" } satisfies Bilingual,
    cards: [
      {
        title: { ms: "Fahami Setiap Topik", en: "Understand Every Topic" },
        description: {
          ms: "Penjelasan yang jelas dan contoh berpandu membantu murid membina asas matematik yang kukuh.",
          en: "Clear explanations and guided examples help students build strong mathematical foundations.",
        },
      },
      {
        title: { ms: "Berlatih dengan Yakin", en: "Practice with Confidence" },
        description: {
          ms: "Soalan janaan rawak tanpa had merentasi setiap topik dan tahap kesukaran KSSR.",
          en: "Unlimited randomly-generated questions across every KSSR topic and difficulty level.",
        },
      },
      {
        title: { ms: "Jejaki Kemajuan Sebenar", en: "Track Real Progress" },
        description: {
          ms: "Pantau kekuatan, kenal pasti kelemahan dan raikan pencapaian sepanjang perjalanan pembelajaran.",
          en: "Monitor strengths, identify weaknesses and celebrate achievements along the learning journey.",
        },
      },
    ] satisfies { title: Bilingual; description: Bilingual }[],
  },

  pintar: {
    headline: { ms: "Kenali Pintar AI", en: "Meet Pintar AI" } satisfies Bilingual,
    tagline: { ms: "Rakan pembelajaran matematik peribadi anda.", en: "Your personal mathematics learning companion." } satisfies Bilingual,
    body: {
      ms: "Pintar AI lebih daripada sekadar memberi jawapan. Ia membantu murid memahami kesilapan, mempelajari teknik penyelesaian masalah, membina tabiat belajar, kekal bermotivasi, dan membina keyakinan.",
      en: "Pintar AI does more than provide answers. It helps students understand mistakes, learn problem-solving techniques, build study habits, stay motivated, and develop confidence.",
    } satisfies Bilingual,
    features: [
      { ms: "Menjelaskan kesilapan", en: "Explains mistakes" },
      { ms: "Memberi tip pembelajaran", en: "Gives learning tips" },
      { ms: "Menggalakkan pemikiran berkembang", en: "Encourages growth mindset" },
      { ms: "Mencadangkan topik seterusnya", en: "Suggests next topics" },
      { ms: "Memberi bimbingan peribadi", en: "Provides personalized guidance" },
    ] satisfies Bilingual[],
    chatExample: {
      studentLine: { ms: "Saya tersalah jawapan di sini...", en: "I got this one wrong..." } satisfies Bilingual,
      pintarLine: {
        ms: "Tak mengapa! Anda tolak nombor asal, bukan baki selepas kali pertama. Mari cuba lagi bersama.",
        en: "No worries! You subtracted from the original number, not the remainder after the first step. Let's try it together.",
      } satisfies Bilingual,
    },
  },

  gamification: {
    headline: { ms: "Belajar Yang Terasa Seperti Permainan", en: "Learning That Feels Like A Game" } satisfies Bilingual,
    cards: [
      {
        title: { ms: "Jujukan Harian", en: "Daily Streak" },
        description: { ms: "Terus belajar setiap hari dan bina jujukan anda.", en: "Keep learning every day and build your streak." },
      },
      {
        title: { ms: "Kumpul XP", en: "Earn XP" },
        description: { ms: "Kumpul mata pengalaman apabila anda menyelesaikan pelajaran.", en: "Gain experience points as you complete lessons." },
      },
      {
        title: { ms: "Buka Lencana", en: "Unlock Badges" },
        description: { ms: "Raikan pencapaian dan tonggak penting.", en: "Celebrate milestones and achievements." },
      },
      {
        title: { ms: "Naik Tahap", en: "Level Up" },
        description: { ms: "Naik tahap melalui peringkat pembelajaran dan cabaran.", en: "Progress through learning levels and challenges." },
      },
    ] satisfies { title: Bilingual; description: Bilingual }[],
  },

  parentDashboard: {
    headline: { ms: "Ibu Bapa Sentiasa Termaklum", en: "Parents Stay Informed" } satisfies Bilingual,
    subheadline: { ms: "Ketahui dengan tepat kemajuan anak anda.", en: "Know exactly how your child is progressing." } satisfies Bilingual,
    features: [
      { title: { ms: "Penjejakan Kemajuan", en: "Progress Tracking" }, description: { ms: "Lihat prestasi merentasi semua topik.", en: "See performance across all topics." } },
      { title: { ms: "Analisis Kelemahan", en: "Weakness Analysis" }, description: { ms: "Kenal pasti topik yang memerlukan perhatian.", en: "Identify topics requiring attention." } },
      {
        title: { ms: "Panduan Belajar", en: "Study Guidance" },
        description: { ms: "Dapatkan tip dan pecahan kesilapan lazim bagi setiap topik lemah.", en: "Get tips and common-mistake breakdowns for every weak topic." },
      },
      {
        title: { ms: "Sejarah Peperiksaan", en: "Exam History" },
        description: { ms: "Lihat sejarah dan markah peperiksaan dari semasa ke semasa.", en: "See exam history and scores over time." },
      },
    ] satisfies { title: Bilingual; description: Bilingual }[],
    previewChild: { ms: "Ahmad · Tahun 5", en: "Ahmad · Year 5" } satisfies Bilingual,
    previewWeak: { ms: "3 topik perlu perhatian", en: "3 topics need attention" } satisfies Bilingual,
  },

  howItWorks: {
    headline: { ms: "Cara Ia Berfungsi", en: "How It Works" } satisfies Bilingual,
    steps: [
      {
        title: { ms: "Pilih Tahun Anda", en: "Choose Your Year" },
        description: { ms: "Tahun 4, Tahun 5, atau Tahun 6", en: "Year 4, Year 5, or Year 6" },
      },
      {
        title: { ms: "Belajar dan Berlatih", en: "Learn and Practice" },
        description: { ms: "Akses pelajaran dan latihan selari dengan KSSR.", en: "Access lessons and exercises aligned with KSSR." },
      },
      {
        title: { ms: "Dapatkan Bimbingan", en: "Get Guidance" },
        description: { ms: "Terima sokongan daripada Pintar AI.", en: "Receive support from Pintar AI." },
      },
      {
        title: { ms: "Jejaki Kemajuan", en: "Track Progress" },
        description: { ms: "Kumpul ganjaran dan pantau peningkatan.", en: "Earn rewards and monitor improvement." },
      },
    ] satisfies { title: Bilingual; description: Bilingual }[],
  },

  byTheNumbers: {
    headline: { ms: "Dalam Angka", en: "By the Numbers" } satisfies Bilingual,
    stats: [
      { value: "85", label: { ms: "Topik Selari KSSR", en: "KSSR-Aligned Topics" } },
      { value: "\u221E", label: { ms: "Soalan Latihan Tanpa Had", en: "Unlimited Practice Questions" } },
      { value: "3", label: { ms: "Tahun Dilitupi (4, 5 & 6)", en: "Years Covered (4, 5 & 6)" } },
    ] satisfies { value: string; label: Bilingual }[],
  },

  finalCta: {
    headline: { ms: "Bantu Anak Anda Membina Keyakinan Matematik", en: "Help Your Child Build Mathematical Confidence" } satisfies Bilingual,
    subheadline: { ms: "Mula belajar bersama Pintar AI hari ini.", en: "Start learning with Pintar AI today." } satisfies Bilingual,
    cta: { ms: "Mula Belajar Percuma", en: "Start Learning Free" } satisfies Bilingual,
  },

  footer: {
    tagline: { ms: "Jurulatih AI Matematik untuk murid sekolah rendah Malaysia.", en: "AI Math Coach for Malaysian primary students." } satisfies Bilingual,
    login: { ms: "Log Masuk", en: "Log In" } satisfies Bilingual,
    signup: { ms: "Daftar", en: "Sign Up" } satisfies Bilingual,
  },
};
