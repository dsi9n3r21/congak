import type { Bilingual } from "@/lib/i18n/dictionary";

/** Copy for the public "buy us a coffee" support page (app/coffee/page.tsx).
 * Kept out of lib/i18n/dictionary.ts for the same reason
 * lib/content/homepageCopy.ts is — content specific to one screen lives
 * alongside it, not in the shared UI dictionary.
 *
 * Tone brief from Lynda: Congak is free and will stay free; this is a
 * genuinely optional thank-you, not a paywall or a guilt-trip. Written
 * to be honest about WHERE the money goes (hosting + Pintar's AI
 * tokens) rather than vague, and to say "optional" more than once
 * rather than bury it in fine print.
 */
export const COFFEE = {
  eyebrow: { ms: "Sokong Congak", en: "Support Congak" } satisfies Bilingual,
  headline: { ms: "Belanja Congak Secawan Kopi ☕", en: "Buy Congak a Coffee ☕" } satisfies Bilingual,
  subheadline: {
    ms: "Congak percuma. Dan ia akan kekal begitu.",
    en: "Congak is free. And it's staying that way.",
  } satisfies Bilingual,

  storyParagraphs: [
    {
      ms: "Congak bermula sebagai sesuatu yang dibina oleh seorang ibu untuk anaknya sendiri — latihan matematik KSSR yang sepadan dengan apa yang sebenarnya diajar di sekolah. Ia kemudiannya dikongsi, dengan harapan ia boleh membantu pelajar lain juga.",
      en: "Congak started as something one parent built for her own daughter — KSSR math practice that actually matches what's taught in school. It's shared openly now, in the hope it helps other students too.",
    } satisfies Bilingual,
    {
      ms: "Menjalankannya memerlukan kos sebenar — menampung aplikasi ini, dan setiap kali Pintar menjawab soalan seorang pelajar dengan sabar, itu menggunakan token AI yang berbayar.",
      en: "Keeping it running costs real money — hosting the app, and every time Pintar patiently answers a student's question, that's a paid AI token being used.",
    } satisfies Bilingual,
    {
      ms: "Jika Congak pernah membantu anak anda — walaupun sedikit — anda dialu-alukan untuk membelanja secawan kopi. Ia terus disalurkan untuk mengekalkan Congak berjalan, dan menjadikannya lebih baik dari semasa ke semasa.",
      en: "If Congak has ever helped your child — even a little — you're welcome to leave the price of a coffee. It goes straight toward keeping Congak running, and making it better over time.",
    } satisfies Bilingual,
  ] as Bilingual[],

  reassurance: {
    ms: "Tiada apa-apa di sini yang wajib. Setiap pelajaran, setiap latihan, setiap misi kekal percuma untuk semua orang, selama-lamanya. Ini cuma satu cara untuk mengucapkan terima kasih, jika anda mahu.",
    en: "Nothing here is required. Every lesson, every practice question, every mission stays free for everyone, always. This is just a way to say thank you, if you'd like to.",
  } satisfies Bilingual,

  qrCaption: {
    ms: "Imbas dengan mana-mana aplikasi perbankan atau e-dompet",
    en: "Scan with any banking app or e-wallet",
  } satisfies Bilingual,

  thanksHeadline: { ms: "Terima kasih kerana menggunakan Congak 🪁", en: "Thank you for using Congak 🪁" } satisfies Bilingual,
  thanksBody: {
    ms: "Sama ada anda menyumbang atau tidak, terima kasih kerana membenarkan Congak menjadi sebahagian daripada pembelajaran anak anda.",
    en: "Whether you send a coffee or not, thank you for letting Congak be part of your child's learning.",
  } satisfies Bilingual,

  feedbackHeadline: { ms: "Ada Cadangan?", en: "Have Feedback?" } satisfies Bilingual,
  feedbackBody: {
    ms: "Terjumpa pepijat, atau ada idea untuk menjadikan Congak lebih baik? Kami sangat ingin mendengarnya.",
    en: "Found a bug, or have an idea to make Congak better? We'd genuinely love to hear it.",
  } satisfies Bilingual,
  feedbackEmail: "razsoulconsultancy@gmail.com",

  backLink: { ms: "← Kembali ke Congak", en: "← Back to Congak" } satisfies Bilingual,
};
