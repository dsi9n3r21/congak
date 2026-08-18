import type { MissionTemplate } from "./types";
import { generateEqualShare, generateFractionSubtract, generateBudgetSubtract } from "./missionMath";
import type { BudgetItem } from "./missionMath";

/**
 * Mission content — the story/theme layer, same role `lib/content/topics.ts`
 * plays for lesson content: plain data, not generated at request time.
 * The MATH is randomized per play (via each variant's `generateMath`);
 * the STORY VARIANT is also randomized per play (one of `variants` picked
 * at random) — together those satisfy the "same concept, different story"
 * requirement without needing a live AI call for core gameplay.
 *
 * This is a first, real vertical slice: the 3 example missions from the
 * brief, fully built end to end (engine + content + UI). Extending to the
 * other 6 categories (measurement, geometry, data, time, kbat, real_life)
 * and adding more missions per category is pure content work from here —
 * new MissionTemplate entries, no engine changes needed. See HANDOVER.md.
 */

const GROCERY_ITEMS: BudgetItem[] = [
  { name: { ms: "Roti", en: "Bread" }, priceRM: 4 },
  { name: { ms: "Susu", en: "Milk" }, priceRM: 8 },
  { name: { ms: "Beras", en: "Rice" }, priceRM: 22 },
  { name: { ms: "Telur", en: "Eggs" }, priceRM: 7 },
  { name: { ms: "Gula", en: "Sugar" }, priceRM: 5 },
  { name: { ms: "Sayur", en: "Vegetables" }, priceRM: 9 },
];

export const MISSIONS: MissionTemplate[] = [
  {
    id: "lost-kittens",
    category: "number",
    kind: "rescue",
    yearLevel: 4,
    title: { ms: "Anak Kucing Yang Hilang", en: "The Lost Kittens" },
    skillTag: { ms: "Bahagi & agihan sama rata", en: "Division & equal sharing" },
    emoji: "🐱",
    rewardXp: 20,
    badgeId: "kindness",
    variants: [
      {
        tokens: {
          character: { ms: "anak kucing", en: "kittens" },
          item: { ms: "susu", en: "milk" },
          place: { ms: "Hutan Nombor", en: "Number Forest" },
        },
        intro: {
          ms: "Pintar sedang berjalan melalui {place} apabila dia terdengar bunyi mengiau yang lembut. Beberapa {character} yang ditinggalkan sedang bersembunyi di belakang semak.",
          en: "Pintar is walking through {place} when he hears tiny meows. Some abandoned {character} are hiding behind a bush.",
        },
        challenge: {
          ms: "{character} itu perlu menerima {item} sama banyak setiap seekor. Bolehkah anda bantu Pintar agihkannya sama rata?",
          en: "The {character} should each receive an equal amount of {item}. Can you help Pintar share it out equally?",
        },
        outcomeSuccess: {
          ms: "{character} itu gembira minum {item} mereka. Terima kasih kerana membantu!",
          en: "The {character} happily drink their {item}. Thanks for helping!",
        },
        outcomeRetry: {
          ms: "Belum tepat lagi — {character} itu masih menunggu bahagian yang sama rata. Cuba kira semula.",
          en: "Not quite yet — the {character} are still waiting for an equal share. Try the calculation again.",
        },
        reflection: {
          ms: "Anda baru sahaja guna PEMBAHAGIAN untuk agihkan sesuatu sama rata — kemahiran yang sama digunakan setiap kali sesuatu perlu dikongsi secara adil!",
          en: "You just used DIVISION to share something equally — the same skill you'd use any time something needs to be split fairly!",
        },
        generateMath: () => generateEqualShare([5, 4, 8]),
      },
      {
        tokens: {
          character: { ms: "anak anjing", en: "puppies" },
          item: { ms: "makanan", en: "food" },
          place: { ms: "Ladang Bahagi", en: "Division Farm" },
        },
        intro: {
          ms: "Di {place}, Pintar menjumpai sekumpulan {character} kecil yang lapar, menunggu waktu makan.",
          en: "At {place}, Pintar finds a litter of hungry {character}, waiting for feeding time.",
        },
        challenge: {
          ms: "{character} itu perlu menerima {item} sama banyak setiap seekor supaya semua kenyang.",
          en: "The {character} need to receive an equal amount of {item} each so everyone gets enough.",
        },
        outcomeSuccess: {
          ms: "Semua {character} makan dengan gembira — agihan yang adil untuk semua!",
          en: "All the {character} eat happily — a fair share for everyone!",
        },
        outcomeRetry: {
          ms: "Cuba semak semula — setiap {character} patut dapat bahagian yang SAMA.",
          en: "Check again — each of the {character} should get the SAME share.",
        },
        reflection: {
          ms: "PEMBAHAGIAN membantu kita agihkan sesuatu secara adil, walaupun jumlahnya tidak genap.",
          en: "DIVISION helps us share things fairly, even when the total doesn't divide into whole numbers.",
        },
        generateMath: () => generateEqualShare([4, 5, 10]),
      },
      {
        tokens: {
          character: { ms: "burung kecil", en: "birds" },
          item: { ms: "bijirin", en: "seeds" },
          place: { ms: "Taman Burung", en: "Bird Garden" },
        },
        intro: {
          ms: "Sekumpulan {character} mendarat di {place}, mencari makanan untuk sarapan pagi.",
          en: "A flock of {character} lands in the {place}, looking for breakfast.",
        },
        challenge: {
          ms: "Pintar ada sedikit {item} untuk diagihkan sama rata kepada setiap {character}.",
          en: "Pintar has a small amount of {item} to share equally among the {character}.",
        },
        outcomeSuccess: {
          ms: "Setiap {character} mematuk bahagian mereka dengan gembira!",
          en: "Each of the {character} happily pecks at their share!",
        },
        outcomeRetry: {
          ms: "Belum tepat — cuba bahagikan semula supaya setiap {character} dapat jumlah yang sama.",
          en: "Not quite — try dividing again so every one of the {character} gets the same amount.",
        },
        reflection: {
          ms: "Berkongsi sama rata itu PEMBAHAGIAN — kemahiran yang berguna setiap hari!",
          en: "Sharing equally is DIVISION — a skill that's useful every single day!",
        },
        generateMath: () => generateEqualShare([2, 8, 10]),
      },
    ],
  },
  {
    id: "bridge-to-fraction-valley",
    category: "fraction",
    kind: "builder",
    yearLevel: 5,
    title: { ms: "Jambatan ke Lembah Pecahan", en: "Bridge to Fraction Valley" },
    skillTag: { ms: "Tolak pecahan (penyebut sama)", en: "Fraction subtraction (same denominator)" },
    emoji: "🌉",
    rewardXp: 25,
    badgeId: "bridge_builder",
    variants: [
      {
        tokens: { material: { ms: "tali", en: "rope" }, place: { ms: "Lembah Pecahan", en: "Fraction Valley" } },
        intro: { ms: "Sebuah jambatan kayu di {place} telah runtuh. Pintar perlu membaikinya sebelum senja.", en: "A wooden bridge in {place} has collapsed. Pintar needs to fix it before nightfall." },
        challenge: { ms: "Untuk membaikinya, Pintar perlukan sepanjang {material} tertentu. Dia sudah ada sebahagian daripadanya.", en: "To rebuild it, Pintar needs a certain length of {material}. He already has part of it." },
        outcomeSuccess: { ms: "Jambatan itu berjaya dibaiki! {place} kini boleh diterokai.", en: "The bridge is repaired! {place} is now unlocked." },
        outcomeRetry: { ms: "{material} itu masih tidak cukup panjang — cuba kira semula berapa lagi yang diperlukan.", en: "The {material} still isn't long enough — try the calculation again." },
        reflection: { ms: "Anda baru sahaja TOLAK dua pecahan berpenyebut sama — cara yang sama digunakan setiap kali kita bandingkan dua bahagian!", en: "You just SUBTRACTED two fractions with the same denominator — the same method used any time we compare two parts!" },
        generateMath: () => generateFractionSubtract([4, 8]),
      },
      {
        tokens: { material: { ms: "papan", en: "planks" }, place: { ms: "Kampung Pecahan", en: "Fraction Village" } },
        intro: { ms: "Sebuah laluan kayu menuju {place} telah reput dan perlu dibaiki segera.", en: "A wooden path leading to {place} has rotted and needs urgent repair." },
        challenge: { ms: "Pintar perlukan sejumlah {material} tertentu untuk siapkan laluan itu.", en: "Pintar needs a certain amount of {material} to finish the path." },
        outcomeSuccess: { ms: "Laluan itu selesai dibaiki — perjalanan ke {place} kini selamat!", en: "The path is repaired — the way to {place} is now safe!" },
        outcomeRetry: { ms: "Masih belum cukup {material} — semak semula pengiraan pecahan anda.", en: "Still not enough {material} — double-check your fraction calculation." },
        reflection: { ms: "Menolak pecahan membantu kita cari BERAPA LAGI yang diperlukan.", en: "Subtracting fractions helps us find HOW MUCH MORE is needed." },
        generateMath: () => generateFractionSubtract([5, 6, 10]),
      },
      {
        tokens: { material: { ms: "kain layar", en: "sailcloth" }, place: { ms: "Pulau Pecahan", en: "Fraction Island" } },
        intro: { ms: "Layar sebuah perahu kecil menuju {place} telah koyak separuh jalan.", en: "The sail of a small boat heading to {place} has torn halfway through the journey." },
        challenge: { ms: "Pintar perlu menampal layar itu dengan sejumlah {material} tertentu.", en: "Pintar needs to patch the sail with a certain amount of {material}." },
        outcomeSuccess: { ms: "Layar telah ditampal — perahu itu boleh belayar ke {place}!", en: "The sail is patched — the boat can sail on to {place}!" },
        outcomeRetry: { ms: "Tampalan itu masih tidak cukup besar — cuba kira semula.", en: "The patch still isn't big enough — try recalculating." },
        reflection: { ms: "Menolak pecahan berpenyebut sama bermakna kita tolak sahaja PENGANGKA — penyebut kekal sama.", en: "Subtracting same-denominator fractions means we just subtract the NUMERATORS — the denominator stays the same." },
        generateMath: () => generateFractionSubtract([4, 5, 12]),
      },
    ],
  },
  {
    id: "grocery-challenge",
    category: "money",
    kind: "financial_literacy",
    yearLevel: 4,
    title: { ms: "Cabaran Membeli-belah", en: "Grocery Challenge" },
    skillTag: { ms: "Wang & tolak berbilang item", en: "Money & multi-item subtraction" },
    emoji: "🛒",
    rewardXp: 30,
    badgeId: "money_hero",
    variants: [
      {
        tokens: { helper: { ms: "seorang nenek", en: "a grandmother" }, place: { ms: "pasar", en: "the market" } },
        intro: { ms: "Pintar membantu {helper} membeli-belah di {place}.", en: "Pintar helps {helper} do her shopping at {place}." },
        challenge: { ms: "Selepas semua barangan dibeli, berapakah baki wang yang tinggal?", en: "After all the items are bought, how much money is left?" },
        outcomeSuccess: { ms: "{helper} berjaya selesaikan belian dengan bajet yang mencukupi!", en: "{helper} successfully completes her shopping within budget!" },
        outcomeRetry: { ms: "Cuba kira semula jumlah semua barangan dahulu, baru tolak daripada bajet.", en: "Try adding up all the items first, then subtracting from the budget." },
        reflection: { ms: "Anda guna TOLAK untuk uruskan wang — kemahiran penting untuk belanjawan setiap hari!", en: "You used SUBTRACTION to manage money — an important everyday budgeting skill!" },
        generateMath: () => generateBudgetSubtract(GROCERY_ITEMS),
      },
      {
        tokens: { helper: { ms: "seorang jiran", en: "a neighbour" }, place: { ms: "kedai runcit", en: "the grocery store" } },
        intro: { ms: "Pintar teman {helper} membeli keperluan dapur di {place}.", en: "Pintar accompanies {helper} to buy kitchen supplies at {place}." },
        challenge: { ms: "Bantu kira baki wang {helper} selepas semua belian dibayar.", en: "Help work out how much money {helper} has left after paying for everything." },
        outcomeSuccess: { ms: "Belanjawan {helper} mencukupi — belian selesai dengan jayanya!", en: "{helper}'s budget was enough — the shopping is done!" },
        outcomeRetry: { ms: "Belum tepat — semak semula jumlah kos semua barangan.", en: "Not quite — recheck the total cost of all the items." },
        reflection: { ms: "Menguruskan wang bermula dengan tahu jumlah perbelanjaan sebelum menolak daripada bajet.", en: "Managing money starts with knowing the total spend before subtracting it from the budget." },
        generateMath: () => generateBudgetSubtract(GROCERY_ITEMS),
      },
      {
        tokens: { helper: { ms: "sebuah keluarga", en: "a family" }, place: { ms: "pasar raya", en: "the supermarket" } },
        intro: { ms: "Pintar menemani {helper} membeli bahan masakan untuk majlis di {place}.", en: "Pintar joins {helper} buying ingredients for a gathering at {place}." },
        challenge: { ms: "Berapakah baki wang {helper} selepas semua bahan dibeli?", en: "How much money does {helper} have left after buying all the ingredients?" },
        outcomeSuccess: { ms: "Semua bahan berjaya dibeli dalam bajet — masakan boleh bermula!", en: "All the ingredients were bought within budget — cooking can begin!" },
        outcomeRetry: { ms: "Cuba kira semula — tambah dahulu semua harga, baru tolak daripada bajet.", en: "Try again — add up all the prices first, then subtract from the budget." },
        reflection: { ms: "Menjumlahkan kos dahulu sebelum menolak ialah cara terbaik untuk elak silap.", en: "Adding up the cost first before subtracting is the best way to avoid mistakes." },
        generateMath: () => generateBudgetSubtract(GROCERY_ITEMS),
      },
    ],
  },
];

export function getMissionById(id: string): MissionTemplate | undefined {
  return MISSIONS.find((m) => m.id === id);
}
