import type { GeneratedQuestion } from "../questions/types";
import type { Bilingual } from "../i18n/dictionary";
import { formatRM } from "../questions/generators/money";
import { formatDurationNeutral, to12String } from "../questions/generators/time";
import { formatLength } from "../questions/generators/length";

/** Mirrors the no-carry simulation in wholeNumbers.ts so we can detect
 * the exact same mistake pattern from a free-typed "fill" answer, not
 * just from picking the matching MCQ distractor. */
function noCarryAdd(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String((digitA + digitB) % 10) + result;
  }
  return Number(result);
}

/** Mirrors the no-borrow simulation in wholeNumbersSubtraction.ts so we
 * can detect the same mistake pattern from a free-typed "fill" answer. */
function noBorrowSubtract(a: number, b: number): number {
  const da = String(a).split("").reverse();
  const db = String(b).split("").reverse();
  const len = Math.max(da.length, db.length);
  let result = "";
  for (let i = 0; i < len; i++) {
    const digitA = Number(da[i] ?? 0);
    const digitB = Number(db[i] ?? 0);
    result = String(Math.abs(digitA - digitB)) + result;
  }
  return Number(result);
}

export interface ClassificationResult {
  mistakeType: string;
  /** Short, kid-facing hint used as a fallback if the AI call fails/is skipped */
  hint: Bilingual;
}

/**
 * Rule-based, deterministic, and free — this runs on every wrong answer,
 * before (and independent of) any OpenAI call. Professor Nombor's AI text
 * (Phase 2) explains the mistake_type in natural language; this function
 * decides WHICH mistake_type it is.
 */
export function classifyMistake(question: GeneratedQuestion, studentAnswer: string): ClassificationResult {
  const answer = studentAnswer.trim();

  switch (question.generatorKey) {
    case "whole_numbers_addition": {
      const ctx = question.context as { a: number; b: number; correct?: number; total?: number; b2?: number; finalTotal?: number };
      // challenge: correctAnswer is the total after a SECOND delivery, not
      // the total after just the first one.
      if (ctx.finalTotal !== undefined) {
        if (Number(answer) === ctx.correct) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas penghantaran PERTAMA. Teruskan: tambah penghantaran KEDUA juga.",
              en: "You stopped after the FIRST delivery. Keep going: add the SECOND delivery too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA nombor itu: jumlah asal + penghantaran pertama + penghantaran kedua.",
            en: "Add all THREE numbers: the original amount + the first delivery + the second delivery.",
          },
        };
      }
      // reverseProblem: correctAnswer is the missing addend, a different context shape (has `total`, not `correct`).
      if (ctx.total !== undefined) {
        if (Number(answer) === ctx.total) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula jumlah keseluruhan. Tolak penambah yang diketahui daripada jumlah itu untuk cari penambah yang hilang.",
              en: "You gave back the total. Subtract the known addend from that total to find the missing addend.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Penambah yang hilang = jumlah − penambah yang diketahui.",
            en: "Missing addend = total − known addend.",
          },
        };
      }
      const { a, b, correct } = ctx as { a: number; b: number; correct: number };
      if (Number(answer) === noCarryAdd(a, b)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Jangan lupa \"simpan\" apabila jumlah lajur lebih 9.",
            en: "Don't forget to \"carry\" when a column's total is more than 9.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 10 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba tambah semula langkah demi langkah, bermula dari lajur sa.",
          en: "Try adding again step by step, starting from the ones column.",
        },
      };
    }

    case "fractions_same_denominator": {
      const ctx = question.context as {
        numA: number; numB: number; denom: number; correctNum: number; numC?: number; finalNum?: number;
      };
      const { numA, numB, denom, correctNum } = ctx;
      // challenge: correctAnswer is the sum of THREE portions, not two.
      if (ctx.finalNum !== undefined) {
        if (answer === `${correctNum}/${denom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda hanya tambah DUA bahagian pertama. Teruskan: tambah bahagian KETIGA juga.",
              en: "You only added the FIRST two portions. Keep going: add the THIRD portion too.",
            },
          };
        }
        return {
          mistakeType: "fraction_calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA pengangka bersama-sama, penyebut kekal sama.",
            en: "Add all THREE numerators together, the denominator stays the same.",
          },
        };
      }
      if (answer === `${correctNum}/${denom * 2}`) {
        return {
          mistakeType: "denominator_addition_error",
          hint: {
            ms: "Penyebut sepatutnya kekal sama — hanya pengangka (nombor atas) yang ditambah.",
            en: "The denominator should stay the same — only the numerator (top number) gets added.",
          },
        };
      }
      if (answer === `${numA}/${denom}` || answer === `${numB}/${denom}`) {
        return {
          mistakeType: "incomplete_addition",
          hint: {
            ms: "Nampaknya hanya satu pecahan sahaja dikira. Tambah KEDUA-DUA pengangka.",
            en: "It looks like only one fraction was counted. Add BOTH numerators.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Semak semula pengangka: adakah kedua-dua nombor atas sudah ditambah?",
          en: "Check the numerator again: have both top numbers been added?",
        },
      };
    }

    case "money_change": {
      const ctx = question.context as {
        priceSen?: number; paidSen: number; changeSen?: number;
        price1Sen?: number; price2Sen?: number; change1Sen?: number; finalSen?: number;
      };
      // challenge: a two-hop question — correctAnswer is what's left after
      // a SECOND purchase from the first change, not the first change itself.
      if (ctx.finalSen !== undefined) {
        const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
        if (answerSen === ctx.change1Sen) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas belian PERTAMA. Teruskan: tolak harga belian KEDUA daripada baki pertama itu.",
              en: "You stopped after the FIRST purchase. Keep going: subtract the SECOND item's price from that first change.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ada DUA langkah: (1) baki selepas belian pertama, (2) baki itu tolak harga belian kedua.",
            en: "There are TWO steps: (1) the change after the first purchase, (2) that change minus the second item's price.",
          },
        };
      }
      const { priceSen, paidSen, changeSen } = ctx as {
        priceSen: number; paidSen: number; changeSen: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      const targetSen = Math.round(parseFloat(question.correctAnswer.replace(/[^0-9.]/g, "")) * 100);
      // reverseProblem: correctAnswer is the amount paid, not the change.
      if (targetSen === paidSen && targetSen !== changeSen) {
        if (!Number.isNaN(answerSen) && Math.abs(answerSen - Math.abs(priceSen - changeSen)) < 5) {
          return {
            mistakeType: "wrong_operation",
            hint: {
              ms: "Wang Dibayar = Harga Barang + Baki — kedua-dua nilai perlu DITAMBAH, bukan ditolak.",
              en: "Money Paid = Item Price + Change — the two values need to be ADDED, not subtracted.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cuba kira semula: Harga Barang + Baki = Wang Dibayar.",
            en: "Try calculating again: Item Price + Change = Money Paid.",
          },
        };
      }
      if (Math.abs(answerSen - changeSen) === 100) {
        return {
          mistakeType: "subtraction_borrow_error",
          hint: {
            ms: "Semak semula proses \"pinjam\" semasa menolak — beza jawapan anda tepat RM1.00.",
            en: "Check the \"borrowing\" step in your subtraction again — your answer is off by exactly RM1.00.",
          },
        };
      }
      if (!Number.isNaN(answerSen) && answerSen !== changeSen) {
        return {
          mistakeType: "ringgit_sen_conversion_error",
          hint: {
            ms: "Cuba tukar semua kepada sen dahulu sebelum menolak, contohnya RM5.00 = 500 sen.",
            en: "Try converting everything to sen first before subtracting, e.g. RM5.00 = 500 sen.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba kira semula: Wang Dibayar − Harga Barang.",
          en: "Try calculating again: Money Paid − Item Price.",
        },
      };
    }

    case "perimeter": {
      const ctxPerim = question.context as { length: number; width: number; correct?: number; perimeter?: number; ratePerMetre?: number; totalCost?: number };
      // challenge: correctAnswer is the fencing COST, not the perimeter itself.
      if (ctxPerim.totalCost !== undefined) {
        if (answer === `RM${ctxPerim.perimeter}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari perimeter. Teruskan: darabkan perimeter itu dengan kos setiap meter.",
              en: "You stopped after finding the perimeter. Keep going: multiply that perimeter by the cost per metre.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari perimeter dahulu (2 × (panjang + lebar)), kemudian darabkan dengan kos setiap meter.",
            en: "First find the perimeter (2 × (length + width)), then multiply by the cost per metre.",
          },
        };
      }
      const { length, width, correct } = ctxPerim as { length: number; width: number; correct: number };
      if (Number(answer) === length * width) {
        return {
          mistakeType: "perimeter_area_confusion",
          hint: {
            ms: "Perimeter ialah jumlah semua sisi, bukan luas. Cuba 2 × (panjang + lebar).",
            en: "Perimeter is the total of all sides, not the area. Try 2 × (length + width).",
          },
        };
      }
      if (Number(answer) === length + width) {
        return {
          mistakeType: "forgot_double_perimeter",
          hint: {
            ms: "Jangan lupa gandakan (panjang + lebar) dengan 2, kerana setiap sisi berulang dua kali.",
            en: "Don't forget to double (length + width) by 2, since each side is repeated twice.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 2 × (panjang + lebar).", en: "Try calculating again: 2 × (length + width)." },
      };
    }

    case "decimal_add_subtract": {
      const ctxDecAS = question.context as { a: number; b: number; correct?: number; c?: number; subtotal?: number; finalTotal?: number };
      // challenge: correctAnswer is the grand total after a THIRD item, not
      // the first two items' subtotal.
      if (ctxDecAS.finalTotal !== undefined) {
        const subtotalStr = `RM${ctxDecAS.subtotal!.toFixed(2)}`;
        if (answer === subtotalStr) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas DUA barang pertama. Teruskan: tambah barang KETIGA juga.",
              en: "You stopped after the FIRST two items. Keep going: add the THIRD item too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA harga barang itu bersama-sama.",
            en: "Add all THREE item prices together.",
          },
        };
      }
      return {
        mistakeType: "decimal_point_misalignment",
        hint: {
          ms: "Semak semula: adakah titik perpuluhan disusun lurus semasa mengira?",
          en: "Check again: were the decimal points lined up correctly when calculating?",
        },
      };
    }

    case "percentage_of_quantity": {
      const ctx = question.context as {
        percent: number; quantity: number; correct: number; remainder1?: number; finalRemaining?: number;
      };
      const { percent, quantity, correct } = ctx;
      // challenge: correctAnswer is what's left after TWO cascading
      // percentage cuts, not the quantity or the first part alone.
      if (ctx.finalRemaining !== undefined) {
        if (Number(answer) === ctx.remainder1) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas potongan PERTAMA. Teruskan: tolak potongan KEDUA daripada baki pertama itu.",
              en: "You stopped after the FIRST cut. Keep going: subtract the second cut from that first remainder.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ada DUA langkah: (1) baki selepas potongan pertama, (2) kira potongan kedua daripada BAKI itu, bukan daripada kuantiti asal.",
            en: "There are TWO steps: (1) the remainder after the first cut, (2) the second cut calculated from that REMAINDER, not the original quantity.",
          },
        };
      }
      if (Number(answer) === percent * quantity) {
        return {
          mistakeType: "forgot_divide_by_100",
          hint: {
            ms: "Peratus perlu dibahagi 100 dahulu sebelum didarab dengan kuantiti.",
            en: "The percentage needs to be divided by 100 first before multiplying by the quantity.",
          },
        };
      }
      if (Math.abs(Number(answer) - Math.round(quantity / percent)) < 1) {
        return {
          mistakeType: "inverted_percentage_operation",
          hint: {
            ms: "Cuba darab kuantiti dengan peratus/100, bukan bahagi.",
            en: "Try multiplying the quantity by percent/100, not dividing.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: (peratus ÷ 100) × kuantiti.", en: "Try calculating again: (percent ÷ 100) × quantity." },
      };
    }

    case "time_duration": {
      const ctxTimeDur = question.context as {
        startHour: number; startMinute: number; durationMinutes: number; correct: string; duration2Minutes?: number; finalTime?: string;
      };
      // challenge: correctAnswer is the end time after a SECOND class, not
      // the first class's end time.
      if (ctxTimeDur.finalTime !== undefined) {
        if (answer === ctxTimeDur.correct) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri waktu tamat kelas PERTAMA sahaja. Teruskan: tambah tempoh kelas KEDUA juga.",
              en: "You gave the end time of the FIRST class only. Keep going: add the SECOND class's duration too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari waktu tamat kelas pertama dahulu, kemudian tambah tempoh kelas kedua pada waktu itu.",
            en: "First find when the first class ends, then add the second class's duration to that time.",
          },
        };
      }
      const { startHour, startMinute, durationMinutes, correct } = ctxTimeDur as {
        startHour: number; startMinute: number; durationMinutes: number; correct: string;
      };
      const noCarryMinute = (startMinute + durationMinutes) % 60;
      const noCarryTime = `${((startHour - 1) % 12) + 1}:${String(noCarryMinute).padStart(2, "0")}`;
      if (answer === noCarryTime) {
        return {
          mistakeType: "time_carry_error",
          hint: {
            ms: "Apabila minit melebihi 60, tukar 60 minit kepada 1 jam dan tambah pada jam.",
            en: "When minutes go past 60, convert 60 minutes into 1 hour and add it to the hour.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: `Cuba kira semula bermula dari ${correct === answer ? "" : "waktu mula"}.`, en: "Try calculating again from the start time." },
      };
    }

    case "average": {
      const ctx = question.context as {
        sum: number; count: number; correct: number; newValue?: number; newCount?: number; newAverage?: number;
      };
      const { sum, count, correct } = ctx;
      const target = Number(question.correctAnswer);
      // challenge: correctAnswer is the NEW average after an extra value
      // is added, not the original average or a missing original value.
      if (ctx.newAverage !== undefined) {
        const naiveAverage = (correct + (ctx.newValue as number)) / 2;
        if (Number(answer) === naiveAverage) {
          return {
            mistakeType: "averaged_the_average",
            hint: {
              ms: "Purata lama mewakili BEBERAPA nilai, bukan satu. Cari jumlah asal dahulu (purata × bilangan), tambah nilai baharu, kemudian bahagi dengan bilangan baharu.",
              en: "The old average represents SEVERAL values, not one. Find the original sum first (average × count), add the new value, then divide by the new count.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Jumlah baharu = (purata lama × bilangan lama) + nilai baharu. Purata baharu = jumlah baharu ÷ bilangan baharu.",
            en: "New sum = (old average × old count) + new value. New average = new sum ÷ new count.",
          },
        };
      }
      // reverseProblem: correctAnswer is the missing value, not the average.
      if (target !== correct) {
        if (Number(answer) === correct * count) {
          return {
            mistakeType: "forgot_subtract_known_values",
            hint: {
              ms: "Darab purata dengan bilangan nilai dahulu, kemudian TOLAK jumlah nilai yang sudah diketahui.",
              en: "Multiply the average by the count first, then SUBTRACT the sum of the known values.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Purata × Bilangan − Jumlah nilai diketahui = nilai yang hilang.",
            en: "Average × Count − Sum of known values = the missing value.",
          },
        };
      }
      if (Number(answer) === sum) {
        return {
          mistakeType: "forgot_divide_average",
          hint: {
            ms: "Purata perlu dibahagi dengan bilangan nombor — jangan berhenti pada jumlah sahaja.",
            en: "The average needs to be divided by how many numbers there are — don't stop at just the sum.",
          },
        };
      }
      if (Number(answer) === Math.round(sum / (count - 1))) {
        return {
          mistakeType: "wrong_count_average",
          hint: {
            ms: "Semak semula: berapa banyak nombor sepatutnya anda bahagikan dengan?",
            en: "Double check: how many numbers should you actually be dividing by?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Purata = Jumlah ÷ Bilangan nombor.", en: "Average = Sum ÷ Count of numbers." },
      };
    }

    case "simplify_ratio": {
      const { simplifiedA, simplifiedB, partBValue, partAValue, diffValue } = question.context as {
        a: number; b: number; simplifiedA: number; simplifiedB: number; partBValue?: number; partAValue?: number; diffValue?: number;
      };
      // challenge: correctAnswer is the DIFFERENCE between the two actual
      // parts, not either part's value alone.
      if (diffValue !== undefined) {
        if (Number(answer) === Math.max(partAValue!, partBValue!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri nilai SATU bahagian sahaja. Teruskan: cari kedua-dua bahagian, kemudian tolak untuk cari beza antaranya.",
              en: "You gave the value of just ONE part. Keep going: find both parts, then subtract to find the difference between them.",
            },
          };
        }
        return {
          mistakeType: "ratio_scaling_error",
          hint: {
            ms: "Cari nilai SEBENAR kedua-dua bahagian dahulu (guna nisbah dan jumlah), kemudian tolak yang kecil daripada yang besar.",
            en: "First find the ACTUAL value of both parts (using the ratio and the total), then subtract the smaller from the larger.",
          },
        };
      }
      // reverseProblem: correctAnswer is a plain quantity, not a ratio string.
      if (!question.correctAnswer.includes(":")) {
        if (partBValue !== undefined && Number(answer) === partBValue) {
          return {
            mistakeType: "ratio_part_swapped",
            hint: {
              ms: "Anda beri nilai bahagian yang satu lagi — semak semula bahagian mana yang ditanya.",
              en: "You gave the other part's value — check again which part the question is asking for.",
            },
          };
        }
        return {
          mistakeType: "ratio_scaling_error",
          hint: {
            ms: "Tambah kedua-dua bahagian nisbah dahulu (contoh 2+3=5), kemudian bahagikan jumlah keseluruhan dengan nombor itu untuk cari nilai satu bahagian.",
            en: "Add both parts of the ratio first (e.g. 2+3=5), then divide the total by that number to find the value of one part.",
          },
        };
      }
      if (answer === `${simplifiedB}:${simplifiedA}`) {
        return {
          mistakeType: "ratio_order_reversed",
          hint: {
            ms: "Susunan nisbah penting — pastikan bahagian pertama kekal di depan.",
            en: "The order in a ratio matters — make sure the first part stays first.",
          },
        };
      }
      return {
        mistakeType: "ratio_not_fully_simplified",
        hint: {
          ms: "Cari nombor terbesar yang boleh membahagikan kedua-dua bahagian nisbah dengan tepat.",
          en: "Find the largest number that divides both parts of the ratio evenly.",
        },
      };
    }

    case "volume": {
      const ctxVol = question.context as { totalMlA: number; mlB: number; correctMl?: number; mlC?: number; afterFirst?: number; finalMl?: number };
      // challenge: correctAnswer is the volume after a SECOND event
      // (poured out after pouring in), not just after the first.
      if (ctxVol.finalMl !== undefined) {
        if (Number(answer) === ctxVol.afterFirst) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas menuang MASUK. Teruskan: tolak jumlah yang dituang KELUAR daripada baki itu.",
              en: "You stopped after pouring IN. Keep going: subtract the amount poured OUT from that total.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambah dahulu jumlah yang dituang masuk, kemudian tolak jumlah yang dituang keluar.",
            en: "First add the amount poured in, then subtract the amount poured out.",
          },
        };
      }
      const { totalMlA, mlB, correctMl } = ctxVol as { totalMlA: number; mlB: number; correctMl: number };
      if (Number(answer) === mlB + (totalMlA - Math.floor(totalMlA / 1000) * 1000)) {
        return {
          mistakeType: "volume_conversion_error",
          hint: {
            ms: "Tukar liter kepada ml dahulu (1 L = 1000 ml) sebelum menambah.",
            en: "Convert litres to ml first (1 L = 1000 ml) before adding.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Tukar semua kepada ml dahulu, kemudian tambah.", en: "Convert everything to ml first, then add." },
      };
    }

    case "area_rectangle": {
      const ctxAreaRect = question.context as { length: number; width: number; correct?: number; area?: number; ratePerSqm?: number; totalCost?: number };
      // challenge: correctAnswer is the grass COST, not the area itself.
      if (ctxAreaRect.totalCost !== undefined) {
        if (answer === `RM${ctxAreaRect.area}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari luas. Teruskan: darabkan luas itu dengan kos setiap meter persegi.",
              en: "You stopped after finding the area. Keep going: multiply that area by the cost per square metre.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari luas dahulu (panjang × lebar), kemudian darabkan dengan kos setiap meter persegi.",
            en: "First find the area (length × width), then multiply by the cost per square metre.",
          },
        };
      }
      const { length, width, correct } = ctxAreaRect as { length: number; width: number; correct: number };
      if (Number(answer) === 2 * (length + width)) {
        return {
          mistakeType: "area_perimeter_confusion",
          hint: {
            ms: "Luas ialah panjang × lebar, bukan perimeter. Cuba darab, bukan tambah.",
            en: "Area is length × width, not perimeter. Try multiplying, not adding.",
          },
        };
      }
      if (Number(answer) === length + width) {
        return {
          mistakeType: "forgot_multiply_area",
          hint: {
            ms: "Untuk mencari luas, darabkan panjang dengan lebar.",
            en: "To find the area, multiply the length by the width.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: panjang × lebar.", en: "Try calculating again: length × width." },
      };
    }

    case "angles_straight_line": {
      const ctxASL = question.context as { angleA: number; correct?: number; multiple?: number; smallest?: number; remaining?: number };
      // challenge: correctAnswer is the smallest of THREE angles on a
      // straight line, not the direct complement of one given angle.
      if (ctxASL.multiple !== undefined) {
        const { multiple, smallest, remaining } = ctxASL as { multiple: number; smallest: number; remaining: number };
        if (Number(answer) === remaining) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas tolak sudut pertama daripada 180°. Teruskan: bahagikan baki itu mengikut nisbah untuk cari sudut ketiga.",
              en: "You stopped after subtracting the first angle from 180°. Keep going: split that remainder by the ratio to find the third angle.",
            },
          };
        }
        if (Number(answer) === Math.round(remaining / 2)) {
          return {
            mistakeType: "split_evenly_ignored_ratio",
            hint: {
              ms: `Sudut kedua ialah ${multiple} kali ganda sudut ketiga — jangan bahagikan baki itu sama rata.`,
              en: `The second angle is ${multiple} times the third — don't split the remainder evenly.`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak sudut pertama daripada 180° dahulu, kemudian bahagikan baki itu mengikut nisbah yang diberi.",
            en: "First subtract the first angle from 180°, then split the remainder by the given ratio.",
          },
        };
      }
      const { angleA, correct } = ctxASL as { angleA: number; correct: number };
      if (Number(answer) === Math.abs(90 - angleA)) {
        return {
          mistakeType: "confused_with_complementary",
          hint: {
            ms: "Sudut pada garis lurus berjumlah 180°, bukan 90°.",
            en: "Angles on a straight line add up to 180°, not 90°.",
          },
        };
      }
      if (Number(answer) === angleA) {
        return {
          mistakeType: "no_operation_performed",
          hint: {
            ms: "Tolak sudut yang diberi daripada 180° untuk cari sudut satu lagi.",
            en: "Subtract the given angle from 180° to find the other angle.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 180° − sudut yang diberi.", en: "Try calculating again: 180° − the given angle." },
      };
    }

    case "area_composite": {
      const ctxAC = question.context as {
        area1?: number; correct?: number; outerArea?: number; innerArea?: number;
      };
      // challenge: correctAnswer is the remaining area after SUBTRACTING a
      // pond cut-out from a garden, not the sum of two rectangles.
      if (ctxAC.outerArea !== undefined) {
        const { outerArea, innerArea, correct: chCorrect } = ctxAC as { outerArea: number; innerArea: number; correct: number };
        if (Number(answer) === outerArea) {
          return {
            mistakeType: "forgot_to_subtract_cutout",
            hint: {
              ms: "Jangan lupa TOLAK luas kolam daripada luas keseluruhan taman.",
              en: "Don't forget to SUBTRACT the pond's area from the garden's total area.",
            },
          };
        }
        if (Number(answer) === outerArea + innerArea) {
          return {
            mistakeType: "added_instead_of_subtracted",
            hint: {
              ms: "Kolam itu ADA DI DALAM taman — tolak luasnya, jangan tambah.",
              en: "The pond is INSIDE the garden — subtract its area, don't add it.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari luas keseluruhan taman, kemudian tolak luas kolam.",
            en: "Find the garden's overall area, then subtract the pond's area.",
          },
        };
      }
      const { area1, correct } = ctxAC as { area1: number; correct: number };
      // reverseProblem: correctAnswer is a missing side length, not the total area.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak luas Segi Empat Tepat A daripada jumlah keseluruhan dahulu, kemudian bahagikan dengan sisi yang diketahui.",
            en: "Subtract Rectangle A's area from the total first, then divide by the known side.",
          },
        };
      }
      if (Number(answer) === area1) {
        return {
          mistakeType: "forgot_second_rectangle",
          hint: {
            ms: "Jangan lupa kira luas KEDUA-DUA segi empat tepat, kemudian tambah.",
            en: "Don't forget to work out the area of BOTH rectangles, then add them.",
          },
        };
      }
      return {
        mistakeType: "area_addition_error",
        hint: {
          ms: "Kira luas setiap segi empat tepat berasingan (panjang × lebar), kemudian tambah kedua-duanya.",
          en: "Calculate each rectangle's area separately (length × width), then add the two together.",
        },
      };
    }

    case "volume_cuboid": {
      const ctxVC = question.context as unknown as { length?: number; width?: number; correct?: number; smallVolume?: number; bigVolume?: number; boxesCount?: number; a?: number };
      // challenge: correctAnswer is how many small boxes fit into a
      // large box, not the volume of a single cuboid.
      if (ctxVC.boxesCount !== undefined) {
        const { bigVolume, boxesCount, a } = ctxVC as { bigVolume: number; boxesCount: number; a: number };
        if (Number(answer) === bigVolume) {
          return {
            mistakeType: "forgot_to_divide_by_small_volume",
            hint: {
              ms: "Itu isi padu kotak BESAR sahaja. Bahagikan isi padu kotak besar dengan isi padu kotak kecil untuk cari bilangan kotak.",
              en: "That's just the big box's volume. Divide the big box's volume by the small box's volume to find how many boxes fit.",
            },
          };
        }
        if (Number(answer) === a) {
          return {
            mistakeType: "used_one_dimension_only",
            hint: {
              ms: "Jangan hanya bandingkan SATU dimensi. Kira isi padu KEDUA-DUA kotak (guna ketiga-tiga dimensi setiap satu), kemudian bahagikan.",
              en: "Don't just compare ONE dimension. Find the volume of BOTH boxes (using all three dimensions each), then divide.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Kira isi padu kotak kecil, kira isi padu kotak besar, kemudian bahagikan isi padu besar dengan isi padu kecil.",
            en: "Find the small box's volume, find the large box's volume, then divide the large volume by the small volume.",
          },
        };
      }
      const { length, width } = ctxVC as { length: number; width: number };
      if (Number(answer) === length * width) {
        return {
          mistakeType: "treated_volume_as_area",
          hint: {
            ms: "Isi padu kuboid guna KETIGA-TIGA dimensi (panjang × lebar × tinggi), bukan hanya dua seperti luas.",
            en: "A cuboid's volume uses ALL THREE dimensions (length × width × height), not just two like area.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Formula: Isi padu = panjang × lebar × tinggi.",
          en: "Formula: Volume = length × width × height.",
        },
      };
    }

    case "volume_composite": {
      const ctxVCo = question.context as unknown as { volume1?: number; correct?: number; bigVolume?: number; cutVolume?: number; chCorrect?: number };
      // challenge: correctAnswer is the volume remaining after SUBTRACTING
      // a cut-out compartment, not the sum of two cuboids.
      if (ctxVCo.bigVolume !== undefined) {
        const { bigVolume, cutVolume, chCorrect } = ctxVCo as { bigVolume: number; cutVolume: number; chCorrect: number };
        if (Number(answer) === bigVolume) {
          return {
            mistakeType: "forgot_to_subtract_cutout",
            hint: {
              ms: "Jangan lupa TOLAK isi padu petak kosong daripada isi padu blok keseluruhan.",
              en: "Don't forget to SUBTRACT the empty compartment's volume from the whole block's volume.",
            },
          };
        }
        if (Number(answer) === bigVolume + cutVolume) {
          return {
            mistakeType: "added_instead_of_subtracted",
            hint: {
              ms: "Petak simpanan itu ADA DI DALAM blok — tolak isi padunya, jangan tambah.",
              en: "The storage compartment is INSIDE the block — subtract its volume, don't add it.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Kira isi padu blok keseluruhan, kemudian tolak isi padu petak kosong yang dipotong.",
            en: "Find the whole block's volume, then subtract the empty compartment's volume.",
          },
        };
      }
      const { volume1, correct } = ctxVCo as { volume1: number; correct: number };
      // reverseProblem: correctAnswer is a missing dimension, not the total volume.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak isi padu Kuboid A daripada jumlah keseluruhan dahulu, kemudian bahagikan dengan dua dimensi yang diketahui bagi Kuboid B.",
            en: "Subtract Cuboid A's volume from the total first, then divide by Cuboid B's two known dimensions.",
          },
        };
      }
      if (Number(answer) === volume1) {
        return {
          mistakeType: "forgot_second_cuboid",
          hint: {
            ms: "Jangan lupa kira isi padu KEDUA-DUA kuboid (panjang × lebar × tinggi setiap satu), kemudian tambah.",
            en: "Don't forget to work out the volume of BOTH cuboids (length × width × height for each), then add them." ,
          },
        };
      }
      return {
        mistakeType: "volume_addition_error",
        hint: {
          ms: "Kira isi padu setiap kuboid berasingan (panjang × lebar × tinggi), kemudian tambah kedua-duanya.",
          en: "Calculate each cuboid's volume separately (length × width × height), then add the two together.",
        },
      };
    }

    case "perimeter_composite": {
      const ctxPC = question.context as unknown as {
        overallLength: number; overallWidth: number; notchLength?: number; notchWidth?: number; correct: number;
        notchDepth?: number; gapWidth?: number; chCorrect?: number;
      };
      // challenge: correctAnswer is the perimeter of a shape with a
      // MIDDLE-of-side notch (which DOES add to the perimeter), not a
      // corner notch (which never changes it).
      if (ctxPC.notchDepth !== undefined) {
        const { overallLength, overallWidth, notchDepth, gapWidth, correct, chCorrect } = ctxPC as {
          overallLength: number; overallWidth: number; notchDepth: number; gapWidth: number; correct: number; chCorrect: number;
        };
        if (Number(answer) === correct) {
          return {
            mistakeType: "over_applied_corner_notch_rule",
            hint: {
              ms: "Petua \"petak di penjuru tidak ubah perimeter\" TIDAK terpakai di sini — lorong ini dipotong di TENGAH sisi, bukan di penjuru, jadi ia MENAMBAH 2 × kedalaman lorong pada perimeter.",
              en: "The \"corner notch doesn't change the perimeter\" rule does NOT apply here — this gap is cut into the MIDDLE of a side, not a corner, so it ADDS 2 × the gap's depth to the perimeter.",
            },
          };
        }
        if (Number(answer) === correct + 2 * gapWidth) {
          return {
            mistakeType: "added_width_instead_of_depth",
            hint: {
              ms: "Tambahkan 2 × KEDALAMAN lorong itu (bukan lebarnya) pada perimeter segi empat tepat asal.",
              en: "Add 2 × the gap's DEPTH (not its width) to the original rectangle's perimeter.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: `Perimeter = 2 × (${overallLength} + ${overallWidth}), TAMBAH 2 × kedalaman lorong (kerana lorong ini di tengah sisi, bukan di penjuru).`,
            en: `Perimeter = 2 × (${overallLength} + ${overallWidth}), PLUS 2 × the gap's depth (since this gap is in the middle of a side, not a corner).`,
          },
        };
      }
      const { overallLength, overallWidth, notchLength, notchWidth, correct } = ctxPC as {
        overallLength: number; overallWidth: number; notchLength: number; notchWidth: number; correct: number;
      };
      // reverseProblem: correctAnswer is a missing bounding-rectangle
      // dimension, not the perimeter itself.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Perimeter = 2 × (panjang + lebar). Bahagikan perimeter dengan 2, kemudian tolak panjang yang diketahui untuk cari lebar.",
            en: "Perimeter = 2 × (length + width). Divide the perimeter by 2, then subtract the known length to find the width.",
          },
        };
      }
      const subtractedNotch = correct - 2 * (notchLength + notchWidth);
      if (Number(answer) === Math.max(0, subtractedNotch)) {
        return {
          mistakeType: "notch_assumed_to_reduce_perimeter",
          hint: {
            ms: "Memotong petak kecil daripada penjuru TIDAK mengubah perimeter keseluruhan — bahagian sisi yang hilang digantikan dengan panjang yang sama pada sisi baharu. Perimeter bentuk-L = perimeter segi empat tepat asal.",
            en: "Cutting a small notch out of the corner does NOT change the overall perimeter — the side length that's removed is replaced by an equal length on the new inner side. The L-shape's perimeter equals the original rectangle's.",
          },
        };
      }
      if (Number(answer) === overallLength * overallWidth - notchLength * notchWidth) {
        return {
          mistakeType: "found_area_not_perimeter",
          hint: {
            ms: "Soalan ini minta PERIMETER (jumlah panjang sempadan), bukan LUAS.",
            en: "This question asks for the PERIMETER (total boundary length), not the AREA.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: `Perimeter bentuk-L = perimeter segi empat tepat asal = 2 × (${overallLength} + ${overallWidth}). Saiz petak yang dipotong tidak mengubah jawapan ini.`,
          en: `The L-shape's perimeter = the original rectangle's perimeter = 2 × (${overallLength} + ${overallWidth}). The size of the cut-out notch doesn't change this answer.`,
        },
      };
    }

    case "angles_triangle_sum": {
      const ctxATS = question.context as { angleA?: number; angleB?: number; correct?: number; apex?: number; baseAngle?: number; combinedBase?: number };
      // challenge: correctAnswer is ONE base angle of an isosceles
      // triangle given only the apex angle, not the third angle of a
      // scalene triangle given the other two.
      if (ctxATS.apex !== undefined) {
        const { apex, baseAngle, combinedBase } = ctxATS as { apex: number; baseAngle: number; combinedBase: number };
        if (Number(answer) === combinedBase) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas tolak sudut puncak daripada 180°. Teruskan: bahagikan baki itu dengan 2 kerana kedua-dua sudut tapak adalah SAMA.",
              en: "You stopped after subtracting the apex from 180°. Keep going: divide that remainder by 2 since both base angles are EQUAL.",
            },
          };
        }
        if (Number(answer) === Math.round((360 - apex) / 2)) {
          return {
            mistakeType: "confused_angle_sum_360",
            hint: {
              ms: "Sudut dalam segi tiga berjumlah 180°, bukan 360°. Tolak sudut puncak daripada 180° dahulu.",
              en: "Angles in a triangle add up to 180°, not 360°. Subtract the apex angle from 180° first.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak sudut puncak daripada 180°, kemudian bahagikan baki itu dengan 2.",
            en: "Subtract the apex angle from 180°, then divide the remainder by 2.",
          },
        };
      }
      const { angleA, angleB, correct } = ctxATS as { angleA: number; angleB: number; correct: number };
      if (Number(answer) === 360 - angleA - angleB) {
        return {
          mistakeType: "confused_angle_sum_360",
          hint: {
            ms: "Sudut dalam segi tiga berjumlah 180°, bukan 360°. 360° ialah untuk sudut pada satu titik.",
            en: "Angles in a triangle add up to 180°, not 360°. 360° is for angles at a point.",
          },
        };
      }
      if (Number(answer) === 180 - angleA) {
        return {
          mistakeType: "only_subtracted_one_angle",
          hint: {
            ms: "Tolak KEDUA-DUA sudut yang diberi daripada 180°, bukan satu sahaja.",
            en: "Subtract BOTH given angles from 180°, not just one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 180° − sudut pertama − sudut kedua.", en: "Try calculating again: 180° − first angle − second angle." },
      };
    }

    case "angles_classify": {
      const ctxAC = question.context as { degrees: number; correctType: string; angleA?: number; angleB?: number; typeOfA?: string };
      // challenge: correctAnswer is the TYPE of the SECOND angle on a
      // straight line, not a directly-shown angle's own type.
      if (ctxAC.angleB !== undefined) {
        const { typeOfA } = ctxAC as { typeOfA: string };
        if (answer === typeOfA) {
          return {
            mistakeType: "classified_wrong_angle",
            hint: {
              ms: "Anda kelaskan sudut PERTAMA (yang diberi). Tolak sudut itu daripada 180° dahulu untuk cari sudut KEDUA, kemudian kelaskan sudut kedua itu.",
              en: "You classified the FIRST angle (the one given). Subtract it from 180° first to find the SECOND angle, then classify that one.",
            },
          };
        }
        return {
          mistakeType: "angle_type_confusion",
          hint: {
            ms: "Tolak sudut pertama daripada 180° untuk cari sudut kedua, kemudian kelaskan hasilnya: Tirus < 90° < Tegak = 90° < Cakah < 180°.",
            en: "Subtract the first angle from 180° to find the second angle, then classify that result: Acute < 90° < Right = 90° < Obtuse < 180°.",
          },
        };
      }
      const { degrees, correctType } = ctxAC as { degrees: number; correctType: string };
      if (answer === "right" && correctType !== "right") {
        return {
          mistakeType: "confused_with_right_angle",
          hint: {
            ms: "Sudut tegak (right angle) ialah TEPAT 90°. Sudut ini bukan tepat 90°.",
            en: "A right angle is EXACTLY 90°. This angle isn't exactly 90°.",
          },
        };
      }
      if (correctType === "reflex" && answer !== "reflex") {
        return {
          mistakeType: "missed_reflex_angle",
          hint: {
            ms: "Sudut refleks lebih besar daripada 180°. Lihat bahagian rajah yang lebih besar.",
            en: "A reflex angle is greater than 180°. Look at the larger part of the diagram.",
          },
        };
      }
      return {
        mistakeType: "angle_type_confusion",
        hint: {
          ms: "Ingat: Tirus < 90° < Tegak = 90° < Cakah < 180° < Refleks < 360°.",
          en: "Remember: Acute < 90° < Right = 90° < Obtuse < 180° < Reflex < 360°.",
        },
      };
    }

    case "area_triangle": {
      const ctxTri = question.context as { base: number; height: number; correct?: number; area?: number; ratePerSqCm?: number; totalCost?: number };
      // challenge: correctAnswer is the cloth COST, not the area itself.
      if (ctxTri.totalCost !== undefined) {
        if (answer === `RM${ctxTri.area}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari luas. Teruskan: darabkan luas itu dengan kos setiap sentimeter persegi.",
              en: "You stopped after finding the area. Keep going: multiply that area by the cost per square centimetre.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari luas dahulu (½ × tapak × tinggi), kemudian darabkan dengan kos setiap sentimeter persegi.",
            en: "First find the area (½ × base × height), then multiply by the cost per square centimetre.",
          },
        };
      }
      const { base, height, correct } = ctxTri as { base: number; height: number; correct: number };
      if (Number(answer) === base * height) {
        return {
          mistakeType: "forgot_to_halve",
          hint: {
            ms: "Luas segi tiga ialah SEPARUH daripada tapak × tinggi. Jangan lupa bahagi dengan 2.",
            en: "The area of a triangle is HALF of base × height. Don't forget to divide by 2.",
          },
        };
      }
      if (Number(answer) === Math.round((base / 2) * (height / 2))) {
        return {
          mistakeType: "halved_both_dimensions",
          hint: {
            ms: "Darab tapak dengan tinggi dahulu, kemudian bahagikan HASIL itu dengan 2 — bukan bahagikan kedua-dua nombor dahulu.",
            en: "Multiply base by height first, then divide that RESULT by 2 — not divide both numbers first.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: (tapak × tinggi) ÷ 2.", en: "Try calculating again: (base × height) ÷ 2." },
      };
    }

    case "angles_at_point": {
      const ctxAAP = question.context as { angleA: number; angleB?: number; correct?: number; multiple?: number; smallest?: number; remaining?: number };
      // challenge: correctAnswer is the smallest of THREE angles at a
      // point where only one is given directly, not the straightforward
      // "two given, find the third" case.
      if (ctxAAP.multiple !== undefined) {
        const { multiple, smallest, remaining } = ctxAAP as { multiple: number; smallest: number; remaining: number };
        if (Number(answer) === remaining) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas tolak sudut pertama daripada 360°. Teruskan: bahagikan baki itu mengikut nisbah untuk cari sudut ketiga.",
              en: "You stopped after subtracting the first angle from 360°. Keep going: split that remainder by the ratio to find the third angle.",
            },
          };
        }
        if (Number(answer) === Math.round(remaining / 2)) {
          return {
            mistakeType: "split_evenly_ignored_ratio",
            hint: {
              ms: `Sudut kedua ialah ${multiple} kali ganda sudut ketiga — jangan bahagikan baki itu sama rata.`,
              en: `The second angle is ${multiple} times the third — don't split the remainder evenly.`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak sudut pertama daripada 360° dahulu, kemudian bahagikan baki itu mengikut nisbah yang diberi.",
            en: "First subtract the first angle from 360°, then split the remainder by the given ratio.",
          },
        };
      }
      const { angleA, angleB, correct } = ctxAAP as { angleA: number; angleB: number; correct: number };
      if (Number(answer) === Math.abs(180 - angleA - angleB)) {
        return {
          mistakeType: "confused_with_180",
          hint: {
            ms: "Sudut pada satu titik berjumlah 360°, bukan 180°. 180° ialah untuk sudut pada garis lurus atau dalam segi tiga.",
            en: "Angles at a point add up to 360°, not 180°. 180° is for angles on a straight line or in a triangle.",
          },
        };
      }
      if (Number(answer) === 360 - angleA) {
        return {
          mistakeType: "only_subtracted_one_angle",
          hint: {
            ms: "Tolak KEDUA-DUA sudut yang diberi daripada 360°, bukan satu sahaja.",
            en: "Subtract BOTH given angles from 360°, not just one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 360° − sudut pertama − sudut kedua.", en: "Try calculating again: 360° − first angle − second angle." },
      };
    }

    case "circumference": {
      const ctxCirc = question.context as { radius: number; correct?: number; circumference?: number; ratePerMetre?: number; totalCost?: number };
      // challenge: correctAnswer is the fencing COST, not the circumference itself.
      if (ctxCirc.totalCost !== undefined) {
        if (answer === `RM${ctxCirc.circumference!.toFixed(2)}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari lilitan. Teruskan: darabkan lilitan itu dengan kos setiap meter.",
              en: "You stopped after finding the circumference. Keep going: multiply that circumference by the cost per metre.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari lilitan dahulu (2 × π × jejari), kemudian darabkan dengan kos setiap meter.",
            en: "First find the circumference (2 × π × radius), then multiply by the cost per metre.",
          },
        };
      }
      const { radius, correct } = ctxCirc as { radius: number; correct: number };
      const PI = 3.142;
      if (answer === (radius * PI).toFixed(2)) {
        return {
          mistakeType: "forgot_to_double_radius",
          hint: {
            ms: "Lilitan = 2 × π × jejari. Jangan lupa gandakan jejari (×2) sebelum darab dengan π.",
            en: "Circumference = 2 × π × radius. Don't forget to double the radius (×2) before multiplying by π.",
          },
        };
      }
      if (answer === (radius * radius * PI).toFixed(2)) {
        return {
          mistakeType: "confused_with_area_formula",
          hint: {
            ms: "Itu ialah formula LUAS bulatan (π × jejari²), bukan lilitan. Lilitan ialah 2 × π × jejari.",
            en: "That's the AREA formula for a circle (π × radius²), not circumference. Circumference is 2 × π × radius.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: 2 × π × jejari (guna π = 3.142).", en: "Try calculating again: 2 × π × radius (use π = 3.142)." },
      };
    }

    case "area_circle": {
      const ctxCircArea = question.context as { radius: number; correct?: number; area?: number; ratePerSqCm?: number; totalCost?: number };
      // challenge: correctAnswer is the canvas COST, not the area itself.
      if (ctxCircArea.totalCost !== undefined) {
        if (answer === `RM${ctxCircArea.area!.toFixed(2)}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari luas. Teruskan: darabkan luas itu dengan kos setiap sentimeter persegi.",
              en: "You stopped after finding the area. Keep going: multiply that area by the cost per square centimetre.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari luas dahulu (π × jejari × jejari), kemudian darabkan dengan kos setiap sentimeter persegi.",
            en: "First find the area (π × radius × radius), then multiply by the cost per square centimetre.",
          },
        };
      }
      const { radius, correct } = ctxCircArea as { radius: number; correct: number };
      const PI = 3.142;
      if (answer === (2 * radius * PI).toFixed(2)) {
        return {
          mistakeType: "confused_with_circumference_formula",
          hint: {
            ms: "Itu ialah formula LILITAN (2 × π × jejari), bukan luas. Luas ialah π × jejari × jejari.",
            en: "That's the CIRCUMFERENCE formula (2 × π × radius), not area. Area is π × radius × radius.",
          },
        };
      }
      if (answer === (2 * radius * (2 * radius) * PI).toFixed(2)) {
        return {
          mistakeType: "squared_diameter_instead",
          hint: {
            ms: "Anda mendarab diameter (2 × jejari) dengan dirinya, bukan jejari. Guna jejari sahaja: π × jejari × jejari.",
            en: "You squared the diameter (2 × radius) instead of the radius. Use the radius only: π × radius × radius.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: π × jejari × jejari (guna π = 3.142).", en: "Try calculating again: π × radius × radius (use π = 3.142)." },
      };
    }

    case "whole_numbers_subtraction": {
      const ctx = question.context as { a: number; b: number; correct?: number; remaining?: number; b2?: number; afterFirst?: number; finalRemaining?: number };
      // challenge: correctAnswer is what's left after a SECOND deduction,
      // not the remainder after just the first one.
      if (ctx.finalRemaining !== undefined) {
        if (Number(answer) === ctx.afterFirst) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas jualan PERTAMA. Teruskan: tolak jualan KEDUA daripada baki pertama itu.",
              en: "You stopped after the FIRST sale. Keep going: subtract the SECOND sale from that first remainder.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) baki selepas jualan pertama, (2) baki itu tolak jualan kedua.",
            en: "Two steps: (1) the remainder after the first sale, (2) that remainder minus the second sale.",
          },
        };
      }
      // reverseProblem: correctAnswer is the original total, a different context shape (has `remaining`, not `correct`).
      if (ctx.remaining !== undefined) {
        if (Number(answer) === ctx.remaining) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula baki. Tambahkan baki itu dengan jumlah yang telah dijual untuk cari jumlah asal.",
              en: "You gave back the remainder. Add that remainder to the amount sold to find the original total.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Jumlah asal = baki + jumlah yang telah dijual.",
            en: "Original total = remainder + amount sold.",
          },
        };
      }
      const { a, b, correct } = ctx as { a: number; b: number; correct: number };
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas lebih kecil daripada digit bawah, anda perlu \"pinjam\" 1 daripada lajur sebelah kiri.",
            en: "When the top digit is smaller than the bottom digit, you need to \"borrow\" 1 from the column on the left.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 10 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan.", en: "Try calculating again, column by column from the right." },
      };
    }

    case "whole_numbers_multiplication": {
      const ctx = question.context as { a: number; b: number; correct: number; b2?: number; finalTotal?: number };
      const { a, b, correct } = ctx;
      // challenge: correctAnswer is the total projected over a DIFFERENT
      // number of days (b2), not the daily rate or the original total.
      if (ctx.finalTotal !== undefined) {
        if (Number(answer) === a) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri kadar harian sahaja. Teruskan: darab kadar itu dengan bilangan hari yang BAHARU.",
              en: "You gave just the daily rate. Keep going: multiply that rate by the NEW number of days.",
            },
          };
        }
        if (Number(answer) === correct) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Itu jumlah ASAL. Soalan minta jumlah untuk bilangan hari yang BAHARU — cari kadar harian dahulu, kemudian darab dengan hari baharu itu.",
              en: "That's the ORIGINAL total. The question asks for the total over the NEW number of days — find the daily rate first, then multiply by the new day count.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) jumlah ÷ bilangan hari asal = kadar harian, (2) kadar harian × bilangan hari baharu.",
            en: "Two steps: (1) total ÷ original days = daily rate, (2) daily rate × new number of days.",
          },
        };
      }
      // reverseProblem: correctAnswer is the daily rate, not the product.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ bilangan hari), bukan darab. Cuba kira semula.",
            en: "This is a division question (total ÷ number of days), not multiplication. Try calculating again.",
          },
        };
      }
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      if (Number(answer) === a * tens + a * ones) {
        return {
          mistakeType: "forgot_shift",
          hint: {
            ms: "Apabila darab dengan digit puluh, jangan lupa tambah satu 0 di hujung hasil darab kedua sebelum menambahnya.",
            en: "When multiplying by the tens digit, don't forget to add a trailing 0 to that partial product before adding it.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "whole_numbers_division": {
      const ctx = question.context as {
        dividend?: number; divisor: number; correct?: number; divisor2?: number; quotient1?: number; quotient2?: number;
      };
      // challenge: correctAnswer is the REGROUPED quotient (divisor2), not
      // the original quotient or divisor.
      if (ctx.quotient2 !== undefined) {
        if (Number(answer) === ctx.quotient1) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri kuantiti bagi kumpulan PERTAMA sahaja. Teruskan: kira semula bagi bilangan kelas yang BAHARU.",
              en: "You gave the amount for the FIRST grouping only. Keep going: recalculate for the NEW number of classes.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) darab pembahagi asal dengan hasil bahagi asal untuk cari jumlah, (2) bahagikan jumlah itu dengan bilangan kelas yang BAHARU.",
            en: "Two steps: (1) multiply the original divisor by the original quotient to find the total, (2) divide that total by the NEW number of classes.",
          },
        };
      }
      const { dividend, divisor, correct } = ctx as { dividend: number; divisor: number; correct: number };
      // reverseProblem: correctAnswer is the divisor (number of groups), not the quotient.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ nilai setiap kumpulan), bukan darab. Cuba kira semula.",
            en: "This is a division question (total ÷ amount per group), not multiplication. Try calculating again.",
          },
        };
      }
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_division_y5": {
      const ctxY5Div = question.context as {
        dividend?: number; divisor: number; correct?: number; divisor2?: number; quotient1?: number; quotient2?: number;
      };
      // challenge: correctAnswer is the quotient AFTER regrouping into a
      // different number of students, not the first sharing's quotient.
      if (ctxY5Div.quotient2 !== undefined) {
        if (Number(answer) === ctxY5Div.quotient1) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas pengagihan PERTAMA. Teruskan: bahagikan semula jumlah yang SAMA kepada bilangan murid yang baharu.",
              en: "You stopped after the FIRST sharing. Keep going: divide the SAME total again among the new number of students.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Bahagikan jumlah asal dengan bilangan murid yang BAHARU sahaja, bukan bilangan murid pertama.",
            en: "Divide the original total by the NEW number of students only, not the first one.",
          },
        };
      }
      const { dividend, divisor, correct } = question.context as { dividend: number; divisor: number; correct: number };
      // reverseProblem: correctAnswer is the divisor (number of students), not the quotient.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ nilai setiap murid), bukan darab. Cuba kira semula.",
            en: "This is a division question (total ÷ amount per student), not multiplication. Try calculating again.",
          },
        };
      }
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_multiplication_y6": {
      const ctxY6Mult = question.context as { a: number; b: number; correct: number; b2?: number; finalTotal?: number };
      // challenge: correctAnswer is the total projected over a DIFFERENT
      // number of days, not the original total.
      if (ctxY6Mult.finalTotal !== undefined) {
        if (Number(answer) === ctxY6Mult.a) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari kadar harian. Teruskan: darabkan kadar itu dengan bilangan hari yang BAHARU.",
              en: "You stopped after finding the daily rate. Keep going: multiply that rate by the NEW number of days.",
            },
          };
        }
        if (Number(answer) === ctxY6Mult.correct) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda guna semula jumlah ASAL. Kira semula untuk bilangan hari yang baharu.",
              en: "You reused the ORIGINAL total. Recalculate for the new number of days.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari kadar harian dahulu (jumlah ÷ bilangan hari asal), kemudian darabkan dengan bilangan hari yang baharu.",
            en: "First find the daily rate (total ÷ original number of days), then multiply by the new number of days.",
          },
        };
      }
      const { a, b, correct } = question.context as { a: number; b: number; correct: number };
      // reverseProblem: correctAnswer is the daily rate, not the product.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ bilangan hari), bukan darab. Cuba kira semula.",
            en: "This is a division question (total ÷ number of days), not multiplication. Try calculating again.",
          },
        };
      }
      const tens = Math.floor(b / 10);
      const ones = b % 10;
      if (Number(answer) === a * tens + a * ones) {
        return {
          mistakeType: "forgot_shift",
          hint: {
            ms: "Apabila darab dengan digit puluh, jangan lupa tambah satu 0 di hujung hasil darab kedua sebelum menambahnya.",
            en: "When multiplying by the tens digit, don't forget to add a trailing 0 to that partial product before adding it.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "mixed_operations": {
      const ctxMO = question.context as { a: number; b: number; c: number; d?: number; e?: number; firstHop?: number; correct: number };
      // challenge: correctAnswer combines TWO multiplication terms
      // ("a + b×c + d×e"), not just one.
      if (ctxMO.d !== undefined) {
        const { d, e, firstHop, correct: chCorrect } = ctxMO as { d: number; e: number; firstHop: number; correct: number };
        if (Number(answer) === firstHop) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas hadiah pertama. Teruskan: darabkan hadiah kedua, kemudian tambah kepada jumlah itu.",
              en: "You stopped after the first gift. Keep going: multiply out the second gift too, then add it to the total.",
            },
          };
        }
        if (Number(answer) === firstHop + d) {
          return {
            mistakeType: "forgot_second_multiplication",
            hint: {
              ms: `Jangan lupa darabkan bilangan not (${d}) dengan nilai setiap not (RM${e}) sebelum menambah.`,
              en: `Don't forget to multiply the number of notes (${d}) by the value of each note (RM${e}) before adding.`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Darabkan setiap pasangan (bilangan × nilai) dahulu, kemudian tambahkan kesemuanya.",
            en: "Multiply each pair (count × value) first, then add everything together.",
          },
        };
      }
      const { a, b, c, correct } = ctxMO as { a: number; b: number; c: number; correct: number };
      if (Number(answer) === (a + b) * c) {
        return {
          mistakeType: "ignored_order_of_operations",
          hint: {
            ms: "Buat pendaraban dahulu, kemudian penambahan — bukan dari kiri ke kanan.",
            en: "Do the multiplication first, then the addition — not strictly left to right.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: darab dahulu, kemudian tambah.", en: "Try calculating again: multiply first, then add." },
      };
    }

    case "whole_numbers_multiplication_y4": {
      const ctx = question.context as {
        a?: number; b?: number; correct?: number; perDay?: number; days?: number; total?: number; b2?: number; finalTotal?: number;
      };
      // challenge: correctAnswer is the total projected over a DIFFERENT
      // number of days, not the daily rate or the original total.
      if (ctx.finalTotal !== undefined) {
        if (Number(answer) === ctx.a) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri kadar harian sahaja. Teruskan: darab kadar itu dengan bilangan hari yang BAHARU.",
              en: "You gave just the daily rate. Keep going: multiply that rate by the NEW number of days.",
            },
          };
        }
        if (Number(answer) === ctx.correct) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Itu jumlah ASAL. Soalan minta jumlah untuk bilangan hari yang BAHARU.",
              en: "That's the ORIGINAL total. The question asks for the total over the NEW number of days.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) jumlah ÷ bilangan hari asal = kadar harian, (2) kadar harian × bilangan hari baharu.",
            en: "Two steps: (1) total ÷ original days = daily rate, (2) daily rate × new number of days.",
          },
        };
      }
      // reverseProblem: correctAnswer is the per-day rate, a totally different context shape.
      if (ctx.perDay !== undefined) {
        if (Number(answer) === ctx.total) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula jumlah keseluruhan. Bahagikan jumlah itu dengan bilangan hari untuk cari kadar harian.",
              en: "You gave back the overall total. Divide that total by the number of days to find the daily rate.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ bilangan hari), bukan darab.",
            en: "This is a division question (total ÷ number of days), not multiplication.",
          },
        };
      }
      const { a, b, correct } = ctx as { a: number; b: number; correct: number };
      const digits = String(a).split("").reverse();
      let noCarry = "";
      for (const d of digits) noCarry = String((Number(d) * b) % 10) + noCarry;
      if (Number(answer) === Number(noCarry)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Apabila hasil darab satu digit lebih daripada 9, jangan lupa \"simpan\" baki ke lajur seterusnya.",
            en: "When one digit's product is more than 9, don't forget to \"carry\" the extra into the next column.",
          },
        };
      }
      if (Number(answer) === a + b) {
        return {
          mistakeType: "added_instead_of_multiplied",
          hint: {
            ms: "Ini soalan darab, bukan tambah. Darabkan kedua-dua nombor itu.",
            en: "This is a multiplication question, not addition. Multiply the two numbers together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula hasil darab itu.", en: "Try calculating the product again." },
      };
    }

    case "whole_numbers_division_y4": {
      const ctx = question.context as {
        dividend?: number; divisor: number; correct?: number; divisor2?: number; quotient1?: number; quotient2?: number;
      };
      // challenge: correctAnswer is the REGROUPED quotient, not the
      // original quotient or divisor.
      if (ctx.quotient2 !== undefined) {
        if (Number(answer) === ctx.quotient1) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri kuantiti bagi kumpulan PERTAMA sahaja. Teruskan: kira semula bagi bilangan murid yang BAHARU.",
              en: "You gave the amount for the FIRST grouping only. Keep going: recalculate for the NEW number of students.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) darab pembahagi asal dengan hasil bahagi asal untuk cari jumlah, (2) bahagikan jumlah itu dengan bilangan murid yang BAHARU.",
            en: "Two steps: (1) multiply the original divisor by the original quotient to find the total, (2) divide that total by the NEW number of students.",
          },
        };
      }
      const { dividend, divisor, correct } = ctx as { dividend: number; divisor: number; correct: number };
      // reverseProblem: correctAnswer is the divisor (number of students), not the quotient.
      if (Number(question.correctAnswer) !== correct) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Ini soalan bahagi (jumlah ÷ nilai setiap murid), bukan darab. Cuba kira semula.",
            en: "This is a division question (total ÷ amount per student), not multiplication. Try calculating again.",
          },
        };
      }
      if (Number(answer) === dividend - divisor) {
        return {
          mistakeType: "subtracted_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tolak. Berapa kali boleh anda tolak pembahagi daripada nombor itu?",
            en: "This is a division question, not subtraction. How many times does the divisor fit into the number?",
          },
        };
      }
      if (Number(answer) === dividend + divisor) {
        return {
          mistakeType: "added_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan tambah. Cari berapa kali pembahagi masuk ke dalam nombor itu.",
            en: "This is a division question, not addition. Find how many times the divisor fits into the number.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula: berapa kali pembahagi boleh masuk ke dalam nombor itu.", en: "Try calculating again: how many times does the divisor fit into the number." },
      };
    }

    case "whole_numbers_addition_y5": {
      const ctx = question.context as { a: number; b: number; correct?: number; total?: number; b2?: number; finalTotal?: number };
      // challenge: correctAnswer is the total after a SECOND delivery, not
      // the total after just the first one.
      if (ctx.finalTotal !== undefined) {
        if (Number(answer) === ctx.correct) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas penghantaran PERTAMA. Teruskan: tambah penghantaran KEDUA juga.",
              en: "You stopped after the FIRST delivery. Keep going: add the SECOND delivery too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA nombor itu: jumlah asal + penghantaran pertama + penghantaran kedua.",
            en: "Add all THREE numbers: the original amount + the first delivery + the second delivery.",
          },
        };
      }
      // reverseProblem: correctAnswer is the missing addend, a different context shape (has `total`, not `correct`).
      if (ctx.total !== undefined) {
        if (Number(answer) === ctx.total) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula jumlah keseluruhan. Tolak penambah yang diketahui daripada jumlah itu untuk cari penambah yang hilang.",
              en: "You gave back the total. Subtract the known addend from that total to find the missing addend.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Penambah yang hilang = jumlah − penambah yang diketahui.",
            en: "Missing addend = total − known addend.",
          },
        };
      }
      const { a, b, correct } = ctx as { a: number; b: number; correct: number };
      if (Number(answer) === noCarryAdd(a, b)) {
        return {
          mistakeType: "forgot_carry",
          hint: {
            ms: "Jangan lupa \"simpan\" apabila jumlah lajur lebih 9.",
            en: "Don't forget to \"carry\" when a column's total is more than 9.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 100 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cuba tambah semula langkah demi langkah, bermula dari lajur sa.",
          en: "Try adding again step by step, starting from the ones column.",
        },
      };
    }

    case "whole_numbers_subtraction_y5": {
      const ctxSubY5 = question.context as { a: number; b: number; correct?: number; remaining?: number; b2?: number; afterFirst?: number; finalRemaining?: number };
      // challenge: correctAnswer is what's left after a SECOND deduction,
      // not just after the first week's shipment.
      if (ctxSubY5.finalRemaining !== undefined) {
        if (Number(answer) === ctxSubY5.afterFirst) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas minggu PERTAMA. Teruskan: tolak penghantaran minggu KEDUA juga.",
              en: "You stopped after the FIRST week. Keep going: subtract the SECOND week's shipment too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak KEDUA-DUA penghantaran daripada jumlah asal, satu selepas yang lain.",
            en: "Subtract BOTH shipments from the original total, one after the other.",
          },
        };
      }
      // reverseProblem: correctAnswer is the original total, a different context shape (has `remaining`, not `correct`).
      if (ctxSubY5.remaining !== undefined) {
        if (Number(answer) === ctxSubY5.remaining) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula baki yang tinggal. Tambahkan baki itu dengan jumlah yang dihantar keluar untuk cari jumlah asal.",
              en: "You gave back the remaining amount. Add that remainder to the amount shipped out to find the original total.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Jumlah asal = baki yang tinggal + jumlah yang dihantar keluar.",
            en: "Original total = remaining amount + amount shipped out.",
          },
        };
      }
      const { a, b, correct } = ctxSubY5 as { a: number; b: number; correct: number };
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas lebih kecil daripada digit bawah, anda perlu \"pinjam\" 1 daripada lajur sebelah kiri.",
            en: "When the top digit is smaller than the bottom digit, you need to \"borrow\" 1 from the column on the left.",
          },
        };
      }
      if (Math.abs(Number(answer) - correct) % 100 === 0 && answer !== String(correct)) {
        return {
          mistakeType: "place_value_misalignment",
          hint: {
            ms: "Semak semula: adakah setiap digit disusun pada lajur nilai tempat yang betul?",
            en: "Double check: is every digit lined up in the correct place value column?",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan.", en: "Try calculating again, column by column from the right." },
      };
    }

    case "whole_numbers_addition_y6": {
      const ctxAddY6 = question.context as { a: number; b: number; c?: number; correct?: number; d?: number; grandTotal?: number; missing?: number; total?: number };
      // challenge: correctAnswer is the grand total after a FOURTH figure
      // turns up, not the original three-month subtotal.
      if (ctxAddY6.grandTotal !== undefined) {
        if (Number(answer) === ctxAddY6.correct) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti pada jumlah TIGA bulan. Teruskan: tambah catatan bulan KEEMPAT yang baru ditemui juga.",
              en: "You stopped at the THREE-month subtotal. Keep going: add the newly-found FOURTH month's figure too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KESEMUA EMPAT nombor itu bersama-sama.",
            en: "Add all FOUR numbers together.",
          },
        };
      }
      // reverseProblem: correctAnswer is the missing addend, a different context shape (has `missing`/`total`, not `c`/`correct`).
      if (ctxAddY6.missing !== undefined) {
        if (Number(answer) === ctxAddY6.total) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula jumlah keseluruhan. Tolak DUA bulan yang diketahui daripada jumlah itu untuk cari bulan yang hilang.",
              en: "You gave back the grand total. Subtract the TWO known months from that total to find the missing month.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Bulan yang hilang = jumlah keseluruhan − kedua-dua bulan yang diketahui.",
            en: "Missing month = grand total − both known months.",
          },
        };
      }
      const { a, b } = ctxAddY6 as { a: number; b: number };
      if (Number(answer) === a + b) {
        return {
          mistakeType: "forgot_addend",
          hint: {
            ms: "Ada TIGA nombor dalam soalan ini — semak semula anda sudah tambah kesemuanya.",
            en: "There are THREE numbers in this question — double check you've added all of them.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba tambah semula ketiga-tiga nombor itu, satu demi satu.", en: "Try adding all three numbers again, one at a time." },
      };
    }

    case "whole_numbers_subtraction_y6": {
      const ctxSubY6 = question.context as { a: number; b: number; correct?: number; b1?: number; b2?: number; remaining1?: number; finalRemaining?: number };
      // challenge: correctAnswer is what's still not-yet-produced after a
      // SECOND production phase, not just after phase one.
      if (ctxSubY6.finalRemaining !== undefined) {
        if (Number(answer) === ctxSubY6.remaining1) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas fasa PERTAMA. Teruskan: tolak pengeluaran fasa KEDUA juga daripada baki itu.",
              en: "You stopped after phase ONE. Keep going: subtract phase TWO's production from that remainder too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak KEDUA-DUA fasa pengeluaran daripada sasaran asal, satu selepas yang lain.",
            en: "Subtract BOTH production phases from the original target, one after the other.",
          },
        };
      }
      const { a, b, correct } = ctxSubY6 as { a: number; b: number; correct: number };
      // reverseProblem: correctAnswer is the remaining (not-yet-produced) amount, not the produced amount.
      if (Number(question.correctAnswer) !== correct) {
        if (Number(answer) === correct) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri jumlah yang SUDAH dikeluarkan. Tolak jumlah itu daripada sasaran untuk cari jumlah yang MASIH belum dikeluarkan.",
              en: "You gave the amount already produced. Subtract that from the target to find how much is STILL not yet produced.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Jumlah yang masih belum dikeluarkan = sasaran − jumlah yang sudah dikeluarkan.",
            en: "Amount still not yet produced = target − amount already produced.",
          },
        };
      }
      if (Number(answer) === noBorrowSubtract(a, b)) {
        return {
          mistakeType: "forgot_borrow",
          hint: {
            ms: "Apabila digit atas ialah 0 dan digit bawah lebih besar, anda perlu \"pinjam\" merentasi beberapa lajur 0 secara berturutan.",
            en: "When the top digit is 0 and the bottom digit is bigger, you need to \"borrow\" across several zero columns in a row.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula, lajur demi lajur dari kanan — berhati-hati dengan lajur 0.", en: "Try calculating again, column by column from the right — watch the zero columns carefully." },
      };
    }

    case "fractions_subtract_same_denominator": {
      const ctxFracSub = question.context as {
        numA: number; numB: number; denom: number; correctNum: number; numC?: number; finalNum?: number;
      };
      const { numA, numB, denom, correctNum } = ctxFracSub;
      // challenge: correctAnswer is what's left after TWO deductions, not one.
      if (ctxFracSub.finalNum !== undefined) {
        if (answer === `${correctNum}/${denom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda hanya tolak bahagian PERTAMA (waktu tengah hari). Teruskan: tolak bahagian KEDUA (waktu petang) juga.",
              en: "You only subtracted the FIRST portion (at lunch). Keep going: subtract the SECOND portion (in the evening) too.",
            },
          };
        }
        return {
          mistakeType: "fraction_calculation_error",
          hint: {
            ms: "Tolak KEDUA-DUA bahagian yang dimakan daripada pengangka asal, penyebut kekal sama.",
            en: "Subtract BOTH portions eaten from the original numerator, the denominator stays the same.",
          },
        };
      }
      // reverseProblem: correctAnswer is the starting amount, not the difference.
      if (question.correctAnswer !== `${correctNum}/${denom}`) {
        return {
          mistakeType: "fraction_calculation_error",
          hint: {
            ms: "Untuk cari jumlah permulaan, TAMBAH baki dengan jumlah yang ditolak, bukan tolak.",
            en: "To find the starting amount, ADD the remainder and the amount taken away, don't subtract.",
          },
        };
      }
      if (answer === `${numA + numB}/${denom}`) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Ini soalan tolak, bukan tambah. Tolak pengangka kedua daripada pengangka pertama.",
            en: "This is a subtraction question, not addition. Subtract the second numerator from the first.",
          },
        };
      }
      if (answer === `${correctNum}/${Math.max(denom - numB, 1)}`) {
        return {
          mistakeType: "denominator_subtraction_error",
          hint: {
            ms: "Penyebut sepatutnya kekal sama — hanya pengangka (nombor atas) yang ditolak.",
            en: "The denominator should stay the same — only the numerator (top number) gets subtracted.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Semak semula pengangka: adakah pengangka kedua sudah ditolak daripada pengangka pertama?",
          en: "Check the numerator again: has the second numerator been subtracted from the first?",
        },
      };
    }

    case "decimal_add_subtract_y4": {
      const ctxDecY4 = question.context as { a: number; b: number; correct?: number; c?: number; subtotal?: number; finalTotal?: number };
      // challenge: correctAnswer is the grand total after a THIRD session,
      // not the first two sessions' subtotal.
      if (ctxDecY4.finalTotal !== undefined) {
        const subtotalStr = ctxDecY4.subtotal!.toFixed(1);
        if (answer === subtotalStr) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas DUA sesi pertama. Teruskan: tambah sesi KETIGA juga.",
              en: "You stopped after the FIRST two sessions. Keep going: add the THIRD session too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA jarak itu bersama-sama.",
            en: "Add all THREE distances together.",
          },
        };
      }
      return {
        mistakeType: "decimal_point_misalignment",
        hint: {
          ms: "Semak semula: adakah titik perpuluhan disusun lurus semasa mengira?",
          en: "Check again: were the decimal points lined up correctly when calculating?",
        },
      };
    }

    case "decimal_multiply": {
      const ctxDecMul = question.context as { a: number; b: number; correct?: number; b2?: number; firstTotal?: number; finalTotal?: number };
      // challenge: correctAnswer is the total for a DIFFERENT bottle count,
      // not the per-bottle amount or the original bottle count's total.
      if (ctxDecMul.finalTotal !== undefined) {
        if (Math.abs(Number(answer) - ctxDecMul.a) < 0.05) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari jumlah sebotol. Teruskan: darabkan jumlah itu dengan bilangan botol yang BAHARU.",
              en: "You stopped after finding the per-bottle amount. Keep going: multiply that amount by the NEW number of bottles.",
            },
          };
        }
        if (Math.abs(Number(answer) - ctxDecMul.firstTotal!) < 0.05) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda guna semula jumlah ASAL. Kira semula untuk bilangan botol yang baharu.",
              en: "You reused the ORIGINAL total. Recalculate for the new number of bottles.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari jumlah sebotol dahulu (jumlah asal ÷ bilangan botol asal), kemudian darabkan dengan bilangan botol yang baharu.",
            en: "First find the per-bottle amount (original total ÷ original bottle count), then multiply by the new bottle count.",
          },
        };
      }
      const { a, b, correct } = ctxDecMul as { a: number; b: number; correct: number };
      if (Math.abs(Number(answer) - Math.round(a * 10) * b) < 0.05) {
        return {
          mistakeType: "ignored_decimal_point",
          hint: {
            ms: "Jangan abaikan titik perpuluhan semasa mendarab — letakkan semula selepas mengira.",
            en: "Don't ignore the decimal point while multiplying — place it back after calculating.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba darab semula, kemudian semak kedudukan titik perpuluhan.", en: "Try multiplying again, then check where the decimal point goes." },
      };
    }

    case "decimal_divide": {
      const ctxDecDiv = question.context as { dividend?: number; divisor?: number; correct?: number; bigDividend?: number; divisor1?: number; divisor2?: number; quotient1?: number; quotient2?: number };
      // challenge: correctAnswer is the piece length AFTER re-cutting into
      // a different number of pieces, not the first cut's piece length.
      if (ctxDecDiv.quotient2 !== undefined) {
        if (Math.abs(Number(answer) - ctxDecDiv.quotient1!) < 0.05) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas potongan PERTAMA. Teruskan: bahagikan panjang yang SAMA sekali lagi dengan bilangan bahagian yang baharu.",
              en: "You stopped after the FIRST cut. Keep going: divide the SAME length again by the new number of pieces.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Bahagikan panjang asal dengan bilangan bahagian yang BAHARU sahaja, bukan bilangan bahagian pertama.",
            en: "Divide the original length by the NEW number of pieces only, not the first one.",
          },
        };
      }
      const { dividend, divisor, correct } = ctxDecDiv as { dividend: number; divisor: number; correct: number };
      if (Math.abs(Number(answer) - Math.round(dividend * 10) / divisor) < 0.05) {
        return {
          mistakeType: "ignored_decimal_point",
          hint: {
            ms: "Jangan abaikan titik perpuluhan semasa membahagi — letakkan semula selepas mengira.",
            en: "Don't ignore the decimal point while dividing — place it back after calculating.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba bahagi semula, kemudian semak kedudukan titik perpuluhan.", en: "Try dividing again, then check where the decimal point goes." },
      };
    }

    case "fractions_divide_by_whole": {
      const ctx = question.context as {
        num: number; denom: number; whole: number; correctNum: number; correctDenom: number;
        whole2?: number; finalNum?: number; finalDenom?: number;
      };
      const { num, denom, whole, correctNum, correctDenom } = ctx;
      // challenge: correctAnswer is the share after a SECOND division,
      // not the original amount or the first share alone.
      if (ctx.finalNum !== undefined) {
        if (answer === `${correctNum}/${correctDenom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri bahagian selepas pembahagian PERTAMA sahaja. Teruskan: bahagikan bahagian itu sekali lagi dengan bilangan orang yang baharu.",
              en: "You gave the share after the FIRST division only. Keep going: divide that share again by the new number of people.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) darabkan penyebut dengan bilangan orang pertama, (2) darabkan penyebut itu SEKALI LAGI dengan bilangan orang kedua.",
            en: "Two steps: (1) multiply the denominator by the first group size, (2) multiply that denominator AGAIN by the second group size.",
          },
        };
      }
      // reverseProblem: correctAnswer is the original amount, not the per-share fraction.
      if (question.correctAnswer !== `${correctNum}/${correctDenom}`) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Untuk cari jumlah asal, DARAB semula bahagian dengan bilangan bahagian, bukan bahagikan.",
            en: "To find the original amount, MULTIPLY the share back by the number of shares, don't divide.",
          },
        };
      }
      if (answer === `${num * whole}/${denom}`) {
        return {
          mistakeType: "multiplied_instead_of_divided",
          hint: {
            ms: "Ini soalan bahagi, bukan darab. Darabkan PENYEBUT dengan nombor bulat itu, bukan pengangka.",
            en: "This is a division question, not multiplication. Multiply the DENOMINATOR by the whole number, not the numerator.",
          },
        };
      }
      if (answer === `${num}/${denom * whole}` && `${num}/${denom * whole}` !== `${correctNum}/${correctDenom}`) {
        return {
          mistakeType: "forgot_to_simplify",
          hint: {
            ms: "Jawapan itu betul tetapi belum dipermudahkan. Bahagikan pengangka dan penyebut dengan faktor sepunya.",
            en: "That answer is correct but not simplified. Divide both numerator and denominator by their common factor.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Ingat peraturan: (a/b) ÷ c = a/(b × c).",
          en: "Remember the rule: (a/b) ÷ c = a/(b × c).",
        },
      };
    }

    case "money_add_subtract": {
      const ctxMoneyAS = question.context as { aSen?: number; bSen?: number; correctSen?: number; cSen?: number; subtotalSen?: number; finalTotalSen?: number };
      // challenge: correctAnswer is the grand total after a THIRD item, not
      // the first two items' subtotal.
      if (ctxMoneyAS.finalTotalSen !== undefined) {
        if (answer === formatRM(ctxMoneyAS.subtotalSen!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas DUA barang pertama. Teruskan: tambah barang KETIGA juga.",
              en: "You stopped after the FIRST two items. Keep going: add the THIRD item too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA harga barang itu bersama-sama.",
            en: "Add all THREE item prices together.",
          },
        };
      }
      return {
        mistakeType: "ringgit_sen_carry_error",
        hint: {
          ms: "Semak semula: adakah sen dan ringgit \"disimpan\"/\"dipinjam\" dengan betul apabila sen melebihi 100?",
          en: "Check again: were the ringgit and sen carried/borrowed correctly when the sen total passed 100?",
        },
      };
    }

    case "money_multiply_divide": {
      const ctxMoneyMD = question.context as { priceSen?: number; qty1?: number; qty2?: number; firstTotalSen?: number; finalTotalSen?: number };
      // challenge: correctAnswer is the total for a DIFFERENT quantity,
      // not the unit price or the original quantity's total.
      if (ctxMoneyMD.finalTotalSen !== undefined) {
        if (answer === formatRM(ctxMoneyMD.priceSen!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas cari harga seunit. Teruskan: darabkan harga itu dengan bilangan yang BAHARU.",
              en: "You stopped after finding the unit price. Keep going: multiply that price by the NEW quantity.",
            },
          };
        }
        if (answer === formatRM(ctxMoneyMD.firstTotalSen!)) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda guna semula jumlah ASAL. Kira semula untuk bilangan yang baharu.",
              en: "You reused the ORIGINAL total. Recalculate for the new quantity.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari harga seunit dahulu (jumlah ÷ bilangan asal), kemudian darabkan dengan bilangan yang baharu.",
            en: "First find the unit price (total ÷ original quantity), then multiply by the new quantity.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Tukar kepada sen dahulu, kira, kemudian tukar semula kepada RM.",
          en: "Convert to sen first, calculate, then convert back to RM.",
        },
      };
    }

    case "simple_interest": {
      const ctxSI = question.context as {
        principalRM: number; rate: number; years: number; interestSen: number; totalSen?: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      // challenge: correctAnswer is the TOTAL amount (principal + interest),
      // not the interest alone.
      if (ctxSI.totalSen !== undefined) {
        if (Math.abs(answerSen - ctxSI.interestSen) < 5) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri faedah sahaja. Teruskan: tambahkan faedah itu dengan prinsipal untuk dapatkan jumlah KESELURUHAN.",
              en: "You gave just the interest. Keep going: add that interest to the principal to get the TOTAL amount.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari faedah dahulu (Prinsipal × Kadar × Tahun ÷ 100), kemudian tambahkan dengan prinsipal.",
            en: "First find the interest (Principal × Rate × Years ÷ 100), then add it to the principal.",
          },
        };
      }
      const { principalRM, rate, years, interestSen } = ctxSI;
      if (Math.abs(answerSen - Math.round((principalRM * 100 * rate) / 100)) < 5) {
        return {
          mistakeType: "forgot_years_multiplier",
          hint: {
            ms: "Jangan lupa darabkan dengan bilangan TAHUN — faedah berulang setiap tahun.",
            en: "Don't forget to multiply by the number of YEARS — interest accumulates every year.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Formula: Faedah = Prinsipal × Kadar × Tahun ÷ 100.",
          en: "Formula: Interest = Principal × Rate × Years ÷ 100.",
        },
      };
    }

    case "compound_interest": {
      const ctxCI = question.context as unknown as {
        principalRM: number; rate: number; years: number; compoundInterestSen: number;
        amountBeforeFinalYearSen?: number; finalYearInterestSen?: number;
      };
      // challenge: correctAnswer is the interest earned in the FINAL
      // year alone, not the total across all years or year 1 alone. Must
      // be checked BEFORE the reverseProblem check below since both
      // contexts carry a `principalRM` field.
      if (ctxCI.finalYearInterestSen !== undefined) {
        const { compoundInterestSen, finalYearInterestSen, principalRM, rate } = ctxCI as {
          compoundInterestSen: number; finalYearInterestSen: number; principalRM: number; rate: number;
        };
        const answerSenCh = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
        if (Math.abs(answerSenCh - compoundInterestSen) < 5) {
          return {
            mistakeType: "gave_total_instead_of_final_year",
            hint: {
              ms: "Itu jumlah faedah bagi SEMUA tahun. Soalan minta faedah TAHUN TERAKHIR sahaja.",
              en: "That's the total interest across ALL years. The question asks for the FINAL year's interest only.",
            },
          };
        }
        const usedOriginalSen = Math.round((principalRM * 100 * rate) / 100);
        if (Math.abs(answerSenCh - usedOriginalSen) < 5) {
          return {
            mistakeType: "used_original_principal_for_final_year",
            hint: {
              ms: "Kira jumlah TERKINI (selepas tahun-tahun sebelumnya dikompaun) dahulu, kemudian kira faedah tahun terakhir daripada jumlah itu — bukan daripada prinsipal asal.",
              en: "Work out the CURRENT total (after the earlier years have compounded) first, then calculate the final year's interest from that — not from the original principal.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Kompaun jumlah itu melalui tahun-tahun sebelumnya dahulu, kemudian kira faedah tahun TERAKHIR sahaja daripada jumlah yang telah berkembang itu.",
            en: "Compound the amount through the earlier years first, then calculate just the FINAL year's interest from that grown amount.",
          },
        };
      }
      const { principalRM, rate, years, compoundInterestSen } = ctxCI as {
        principalRM: number; rate: number; years: number; compoundInterestSen: number;
      };
      // reverseProblem: correctAnswer is the principal, not the compound interest earned.
      if (question.correctAnswer === `RM${principalRM}`) {
        const year1InterestSen = Math.round((principalRM * 100 * rate) / 100);
        if (Number(answer.replace(/[^0-9.]/g, "")) === Math.round(year1InterestSen / 100)) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda beri semula jumlah faedah, bukan prinsipal. Prinsipal = Faedah Tahun 1 ÷ (Kadar ÷ 100).",
              en: "You gave back the interest amount, not the principal. Principal = Year 1 Interest ÷ (Rate ÷ 100).",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Prinsipal = Faedah Tahun 1 ÷ (Kadar ÷ 100).",
            en: "Principal = Year 1 Interest ÷ (Rate ÷ 100).",
          },
        };
      }
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      const simpleInterestSen = Math.round(((principalRM * 100) * rate * years) / 100);
      if (Math.abs(answerSen - simpleInterestSen) < 5 && simpleInterestSen !== compoundInterestSen) {
        return {
          mistakeType: "used_simple_interest_formula",
          hint: {
            ms: "Ini faedah KOMPAUN, bukan faedah mudah — faedah setiap tahun dikira daripada jumlah TERKINI (termasuk faedah tahun lepas), bukan daripada prinsipal asal sahaja.",
            en: "This is COMPOUND interest, not simple interest — each year's interest is calculated on the CURRENT total (including last year's interest), not just the original principal.",
          },
        };
      }
      const oneYearOnlySen = Math.round((principalRM * 100 * rate) / 100);
      if (Math.abs(answerSen - oneYearOnlySen) < 5 && years > 1) {
        return {
          mistakeType: "stopped_compounding_early",
          hint: {
            ms: `Anda hanya kira faedah untuk 1 tahun — teruskan mengira untuk kesemua ${years} tahun, setiap kali menggunakan jumlah TERKINI.`,
            en: `You only calculated 1 year's interest — keep going for all ${years} years, each time using the CURRENT total.`,
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Kira faedah setahun demi setahun — setiap tahun, faedah dikira daripada jumlah terkini, bukan prinsipal asal.",
          en: "Work through it year by year — each year, interest is calculated on the current total, not the original principal.",
        },
      };
    }

    case "profit_loss": {
      const ctxPL = question.context as {
        costSen: number; sellingSen: number; resultSen: number; qty?: number; totalResultSen?: number;
      };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      // challenge: correctAnswer is the TOTAL profit/loss across several
      // items, not the per-item profit/loss alone.
      if (ctxPL.totalResultSen !== undefined) {
        if (Math.abs(answerSen - ctxPL.resultSen) < 5) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri untung/rugi bagi SATU item sahaja. Teruskan: darabkan itu dengan bilangan item yang dijual.",
              en: "You gave the profit/loss for just ONE item. Keep going: multiply that by the number of items sold.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari untung/rugi seunit dahulu (harga jualan − harga kos), kemudian darabkan dengan bilangan item yang dijual.",
            en: "First find the per-item profit/loss (selling price − cost price), then multiply by the number of items sold.",
          },
        };
      }
      const { costSen, sellingSen, resultSen } = ctxPL;
      if (Math.abs(answerSen - (costSen + sellingSen)) < 5) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Untung/rugi ialah BEZA antara harga jualan dan harga kos, bukan jumlahnya.",
            en: "Profit/loss is the DIFFERENCE between selling price and cost price, not their sum.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cuba kira semula beza antara harga jualan dan harga kos.", en: "Try calculating the difference between selling price and cost price again." },
      };
    }

    case "time_add_subtract": {
      const ctxTimeAS = question.context as { aMinutes?: number; bMinutes?: number; correctMinutes?: number; cMinutes?: number; subtotal?: number; finalTotal?: number };
      // challenge: correctAnswer is the total after a THIRD subject, not
      // the first two subjects' subtotal.
      if (ctxTimeAS.finalTotal !== undefined) {
        if (answer === formatDurationNeutral(ctxTimeAS.subtotal!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas DUA mata pelajaran pertama. Teruskan: tambah masa mata pelajaran KETIGA juga.",
              en: "You stopped after the FIRST two subjects. Keep going: add the THIRD subject's time too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA tempoh masa itu bersama-sama.",
            en: "Add all THREE durations together.",
          },
        };
      }
      return {
        mistakeType: "time_base60_carry_error",
        hint: {
          ms: "Ingat: 60 minit = 1 jam. Semak semula sama ada anda \"simpan\"/\"pinjam\" jam dengan betul.",
          en: "Remember: 60 minutes = 1 hour. Check whether you carried/borrowed the hour correctly.",
        },
      };
    }

    case "length_add_subtract": {
      const ctxLenAS = question.context as { aCm?: number; bCm?: number; correctCm?: number; cCm?: number; subtotal?: number; finalTotal?: number };
      // challenge: correctAnswer is the total after a THIRD piece is
      // joined, not the first two pieces' subtotal.
      if (ctxLenAS.finalTotal !== undefined) {
        if (answer === formatLength(ctxLenAS.subtotal!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas DUA keping pertama. Teruskan: tambah keping KETIGA juga.",
              en: "You stopped after the FIRST two pieces. Keep going: add the THIRD piece too.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan KETIGA-TIGA panjang itu bersama-sama.",
            en: "Add all THREE lengths together.",
          },
        };
      }
      return {
        mistakeType: "length_base100_carry_error",
        hint: {
          ms: "Ingat: 100 cm = 1 m. Semak semula sama ada anda \"simpan\"/\"pinjam\" meter dengan betul.",
          en: "Remember: 100 cm = 1 m. Check whether you carried/borrowed the metre correctly.",
        },
      };
    }

    case "unit_convert": {
      const ctxUC = question.context as unknown as { factor: number; bigToSmall?: string; smallRemainder?: number; bigVal?: number; correct?: number; big?: string; small?: string };
      // challenge: correctAnswer is a COMPOUND quantity ("bigVal big +
      // smallRemainder small") converted entirely into the small unit,
      // not a single clean-quantity conversion.
      if (ctxUC.smallRemainder !== undefined) {
        const { factor, bigVal, correct } = ctxUC as { factor: number; bigVal: number; correct: number };
        if (Number(answer) === bigVal * factor) {
          return {
            mistakeType: "forgot_remainder",
            hint: {
              ms: "Anda tukar bahagian unit besar sahaja. Jangan lupa TAMBAH baki unit kecil itu.",
              en: "You only converted the big-unit part. Don't forget to ADD the small-unit remainder.",
            },
          };
        }
        if (Number(answer) === bigVal + (correct - bigVal * factor)) {
          return {
            mistakeType: "forgot_to_convert",
            hint: {
              ms: `Tukar bahagian unit besar itu kepada unit kecil dahulu (× ${factor}), kemudian tambah bakinya.`,
              en: `First convert the big-unit part into small units (× ${factor}), then add the remainder.`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tukar bahagian unit besar kepada unit kecil, kemudian tambahkan baki unit kecil itu.",
            en: "Convert the big-unit part into small units, then add on the small-unit remainder.",
          },
        };
      }
      const { factor, bigToSmall } = ctxUC as { factor: number; bigToSmall: string };
      const wasBigToSmall = bigToSmall === "yes";
      return {
        mistakeType: "wrong_conversion_factor",
        hint: {
          ms: `Semak semula faktor penukaran itu — betulkah anda ${wasBigToSmall ? "darab" : "bahagi"} dengan ${factor}?`,
          en: `Double check the conversion factor — did you ${wasBigToSmall ? "multiply" : "divide"} by ${factor}?`,
        },
      };
    }

    case "discount": {
      const ctxDiscount = question.context as { discountSen?: number; finalSen?: number; priceRM?: number; discountPct1?: number; discountPct2?: number; afterFirstSen?: number; finalStackedSen?: number };
      // challenge: correctAnswer is the price after TWO stacked discounts,
      // not just the first one, and not a flat combined-percentage discount.
      if (ctxDiscount.finalStackedSen !== undefined) {
        if (answer === formatRM(ctxDiscount.afterFirstSen!)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas diskaun PERTAMA. Teruskan: kira diskaun KEDUA daripada harga yang telah didiskaun itu.",
              en: "You stopped after the FIRST discount. Keep going: apply the SECOND discount to the already-discounted price.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Diskaun kedua dikira daripada harga SELEPAS diskaun pertama, bukan daripada harga asal — jangan tambahkan kedua-dua peratus itu terus.",
            en: "The second discount is calculated on the price AFTER the first discount, not the original price — don't just add the two percentages together.",
          },
        };
      }
      const { discountSen, finalSen } = ctxDiscount as { discountSen: number; finalSen: number };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - discountSen) < 5) {
        return {
          mistakeType: "gave_discount_amount_not_final_price",
          hint: {
            ms: "Itu jumlah diskaun sahaja. Soalan minta harga SELEPAS diskaun — tolak diskaun daripada harga asal.",
            en: "That's just the discount amount. The question asks for the price AFTER the discount — subtract the discount from the original price.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari jumlah diskaun dahulu, kemudian tolak daripada harga asal.", en: "Find the discount amount first, then subtract it from the original price." },
      };
    }

    case "likelihood": {
      const ctxLH = question.context as unknown as { countA?: number; countB?: number; newCountA?: number; beforeAnswer?: string };
      // challenge: correctAnswer is based on UPDATED counts after a
      // without-replacement pick, not the original static counts.
      if (ctxLH.newCountA !== undefined) {
        const { beforeAnswer } = ctxLH as { beforeAnswer: string };
        if (answer === beforeAnswer) {
          return {
            mistakeType: "forgot_without_replacement",
            hint: {
              ms: "Anda guna bilangan ASAL. Selepas satu guli dikeluarkan dan TIDAK dimasukkan semula, bilangannya berkurang — kira semula sebelum membuat kesimpulan.",
              en: "You used the ORIGINAL counts. After one marble is removed and NOT put back, the count changes — recount before deciding.",
            },
          };
        }
        return {
          mistakeType: "likelihood_misconception",
          hint: {
            ms: "Kira semula bilangan guli SELEPAS satu dikeluarkan, kemudian bandingkan bilangan itu untuk tentukan kemungkinan yang betul.",
            en: "Recount the marbles AFTER one is removed, then compare those counts to determine the correct likelihood.",
          },
        };
      }
      return {
        mistakeType: "likelihood_misconception",
        hint: {
          ms: "Fikirkan: berapa banyak cara untuk berjaya, berbanding jumlah keseluruhan?",
          en: "Think about it: how many ways to succeed, compared to the total?",
        },
      };
    }

    case "prime_composite": {
      const ctxPC = question.context as unknown as { n?: number; lo?: number; hi?: number; primeCount?: number; compositeCount?: number };
      // challenge: correctAnswer is a COUNT of primes across a range,
      // not a classification of a single number.
      if (ctxPC.lo !== undefined) {
        const { lo, hi, primeCount, compositeCount } = ctxPC as { lo: number; hi: number; primeCount: number; compositeCount: number };
        if (Number(answer) === compositeCount) {
          return {
            mistakeType: "counted_composite_instead",
            hint: {
              ms: "Anda kira nombor GUBAHAN. Soalan minta bilangan nombor PERDANA sahaja.",
              en: "You counted the COMPOSITE numbers. The question asks for the count of PRIME numbers only.",
            },
          };
        }
        return {
          mistakeType: "miscounted_range",
          hint: {
            ms: `Semak SETIAP nombor daripada ${lo} hingga ${hi} satu demi satu, dan kira berapa banyak yang perdana.`,
            en: `Check EVERY number from ${lo} to ${hi} one by one, and count how many are prime.`,
          },
        };
      }
      const { n } = ctxPC as { n: number };
      return {
        mistakeType: "prime_composite_misconception",
        hint: {
          ms: `Semak semula: bolehkah ${n} dibahagi tepat dengan sebarang nombor selain 1 dan ${n} sendiri? Ingat juga 1 bukan nombor perdana mahupun nombor gubahan.`,
          en: `Check again: can ${n} be divided exactly by any number other than 1 and ${n} itself? Also remember 1 is neither prime nor composite.`,
        },
      };
    }

    case "regular_polygon_angles": {
      const ctxRPA = question.context as unknown as { sides?: number; variant?: string; eachAngleA?: number; eachAngleB?: number; combinedAngle?: number; gapAngle?: number };
      // challenge: correctAnswer is the GAP angle when two DIFFERENT
      // polygons meet at a point, not a single polygon's own angle.
      if (ctxRPA.eachAngleA !== undefined) {
        const { eachAngleA, combinedAngle, gapAngle } = ctxRPA as { eachAngleA: number; combinedAngle: number; gapAngle: number };
        if (Number(answer) === combinedAngle) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda tambah kedua-dua sudut poligon dengan betul, tetapi lupa tolak daripada 360° untuk cari sudut jurang.",
              en: "You added both polygons' angles correctly, but forgot to subtract from 360° to find the gap angle.",
            },
          };
        }
        if (Number(answer) === 360 - eachAngleA) {
          return {
            mistakeType: "used_one_shape_only",
            hint: {
              ms: "Jangan hanya guna SATU poligon. Cari sudut pedalaman KEDUA-DUA poligon itu dahulu, tambahkan, kemudian tolak daripada 360°.",
              en: "Don't use just ONE polygon. Find both polygons' interior angles first, add them, then subtract from 360°.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari sudut pedalaman SETIAP poligon (guna formula (bilangan sisi − 2) × 180° ÷ bilangan sisi), tambahkan kedua-duanya, kemudian tolak daripada 360°.",
            en: "Find EACH polygon's interior angle (using (sides − 2) × 180° ÷ sides), add them together, then subtract from 360°.",
          },
        };
      }
      const { sides, variant } = ctxRPA as { sides: number; variant: string };
      return {
        mistakeType: "polygon_angle_formula_error",
        hint: {
          ms:
            variant === "each_angle"
              ? `Formula: (${sides} − 2) × 180° ÷ ${sides}. Jangan lupa tolak 2 daripada bilangan sisi dahulu, kemudian bahagikan dengan ${sides}.`
              : `Formula: (${sides} − 2) × 180°. Jangan lupa tolak 2 daripada bilangan sisi dahulu.`,
          en:
            variant === "each_angle"
              ? `Formula: (${sides} − 2) × 180° ÷ ${sides}. Don't forget to subtract 2 from the number of sides first, then divide by ${sides}.`
              : `Formula: (${sides} − 2) × 180°. Don't forget to subtract 2 from the number of sides first.`,
        },
      };
    }

    case "time_format_convert": {
      const ctxTFC = question.context as unknown as {
        hour24?: number; minute?: number; isPM?: string; direction?: string;
        durationMinutes?: number; arrivalHour24?: number; arrivalMinute?: number;
        wrongShown?: string;
        departTotal?: number; transferTotal?: number; layoverMinutes?: number; duration2?: number; totalMinutes?: number;
      };
      // challenge: correctAnswer is the FINAL arrival time of a two-leg
      // journey with a transfer, not a single duration added once.
      if (ctxTFC.transferTotal !== undefined) {
        const { transferTotal, layoverMinutes, duration2, totalMinutes } = ctxTFC as {
          transferTotal: number; layoverMinutes: number; duration2: number; totalMinutes: number;
        };
        const stoppedAtTransferHour = Math.floor(transferTotal / 60) % 24;
        const stoppedAtTransferMinute = transferTotal % 60;
        if (answer === to12String(stoppedAtTransferHour, stoppedAtTransferMinute)) {
          return {
            mistakeType: "stopped_at_transfer_station",
            hint: {
              ms: "Anda berhenti di stesen pertukaran. Jangan lupa tambah masa menunggu DAN perjalanan bas kedua.",
              en: "You stopped at the transfer station. Don't forget to add the layover wait AND the second bus's journey too.",
            },
          };
        }
        return {
          mistakeType: "forgot_layover",
          hint: {
            ms: "Tambah kedua-dua tempoh perjalanan DAN masa menunggu di stesen pertukaran — jangan lupa mana-mana satu.",
            en: "Add both journey durations AND the layover wait at the transfer station — don't skip any of them.",
          },
        };
      }
      // reverseProblem: correctAnswer is an arrival time after adding a
      // single duration to a departure time.
      if (ctxTFC.durationMinutes !== undefined) {
        const { hour24, minute, durationMinutes } = ctxTFC as { hour24: number; minute: number; durationMinutes: number };
        if (answer === to12String(hour24, minute)) {
          return {
            mistakeType: "forgot_to_add_duration",
            hint: {
              ms: "Anda tukar waktu berlepas sahaja. Jangan lupa TAMBAH tempoh perjalanan sebelum menukar kepada format 12 jam.",
              en: "You only converted the departure time. Don't forget to ADD the journey duration before converting to 12-hour format.",
            },
          };
        }
        return {
          mistakeType: "time_carry_error",
          hint: {
            ms: "Tambah tempoh perjalanan pada waktu berlepas dahulu (ingat 60 minit = 1 jam), kemudian tukar kepada format 12 jam.",
            en: "Add the journey duration to the departure time first (remember 60 minutes = 1 hour), then convert to 12-hour format.",
          },
        };
      }
      // errorSpotting: correctAnswer is the right 24-hour conversion,
      // wrongShown is the documented mistake shown to the student.
      if (ctxTFC.wrongShown !== undefined) {
        return {
          mistakeType: "noon_midnight_or_am_pm_confusion",
          hint: {
            ms: "12 tengah hari = 1200, 12 tengah malam = 0000. Untuk petang/malam (bukan 12 tengah hari), tambah 12 pada jam.",
            en: "12 noon = 1200, 12 midnight = 0000. For afternoon/evening (not 12 noon), add 12 to the hour.",
          },
        };
      }
      // base case: direct to24 / to12 conversion.
      const { hour24, isPM, direction } = ctxTFC as { hour24: number; isPM: string; direction: string };
      if (direction === "to24") {
        if (hour24 === 0 && answer === "1200") {
          return {
            mistakeType: "noon_midnight_swap",
            hint: { ms: "12 tengah malam ialah 0000, bukan 1200. 12 tengah hari pula ialah 1200.", en: "12 midnight is 0000, not 1200. 12 noon is 1200." },
          };
        }
        if (hour24 === 12 && answer === "0000") {
          return {
            mistakeType: "noon_midnight_swap",
            hint: { ms: "12 tengah hari ialah 1200, bukan 0000. 12 tengah malam pula ialah 0000.", en: "12 noon is 1200, not 0000. 12 midnight is 0000." },
          };
        }
        if (isPM === "no") {
          return {
            mistakeType: "added_12_to_am",
            hint: { ms: "Waktu ini pagi (a.m.) — jangan tambah 12 pada jamnya.", en: "This time is a.m. — don't add 12 to the hour." },
          };
        }
        return {
          mistakeType: "forgot_to_add_12_pm",
          hint: { ms: "Waktu ini petang/malam (p.m.) dan bukan 12 tengah hari — tambah 12 pada jamnya.", en: "This time is p.m. and not 12 noon — add 12 to the hour." },
        };
      }
      return {
        mistakeType: "wrong_am_pm_period",
        hint: {
          ms: "Semak semula sama ada waktu ini a.m. atau p.m. — jam selepas 1200 (kecuali 2400) adalah p.m.",
          en: "Double-check whether this time is a.m. or p.m. — an hour after 1200 (except 2400) is p.m.",
        },
      };
    }

    case "fractions_percentage_convert": {
      const ctxFPC = question.context as { bigNum?: number; bigDenom?: number; n?: number; denom?: number; pct?: number };
      // challenge: correctAnswer converts an UNSIMPLIFIED fraction to a
      // percentage — the denominator doesn't scale evenly to 100 until
      // simplified first.
      if (ctxFPC.bigNum !== undefined) {
        const { bigNum, bigDenom, pct } = ctxFPC as { bigNum: number; bigDenom: number; pct: number };
        if (Number(answer) === bigNum) {
          return {
            mistakeType: "used_numerator_directly",
            hint: {
              ms: "Jangan guna pengangka terus sebagai peratus. Permudahkan pecahan itu dahulu, kemudian skalakan penyebut kepada 100.",
              en: "Don't use the numerator directly as the percentage. Simplify the fraction first, then scale the denominator to 100.",
            },
          };
        }
        return {
          mistakeType: "forgot_to_simplify_first",
          hint: {
            ms: `Penyebut ${bigDenom} tidak boleh diskalakan terus kepada 100. Permudahkan ${bigNum}/${bigDenom} dahulu, kemudian skalakan pecahan yang dipermudahkan itu.`,
            en: `The denominator ${bigDenom} can't be scaled to 100 directly. Simplify ${bigNum}/${bigDenom} first, then scale the simplified fraction.`,
          },
        };
      }
      return {
        mistakeType: "fraction_percentage_conversion_error",
        hint: {
          ms: "Ingat: peratus ialah \"per seratus\". Skalakan pengangka dan penyebut supaya penyebut menjadi 100.",
          en: "Remember: percent means \"per hundred\". Scale the numerator and denominator so the denominator becomes 100.",
        },
      };
    }

    case "fractions_multiply": {
      const ctxFracMul = question.context as {
        num: number; denom: number; whole: number; correctNum?: number; correctDenom?: number;
        whole2?: number; firstTotal?: string; finalTotal?: string;
      };
      const { num, denom, whole, correctNum, correctDenom } = ctxFracMul;
      // challenge: correctAnswer is the total for a DIFFERENT number of
      // loaves, not the per-loaf fraction or the original total.
      if (ctxFracMul.finalTotal !== undefined) {
        if (answer === `${num}/${denom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas jumlah SEBAGI paun. Teruskan: darabkan jumlah itu dengan bilangan paun yang BAHARU.",
              en: "You stopped at the per-loaf amount. Keep going: multiply that by the NEW number of loaves.",
            },
          };
        }
        if (answer === ctxFracMul.firstTotal) {
          return {
            mistakeType: "calculation_error",
            hint: {
              ms: "Anda guna semula jumlah ASAL. Kira semula untuk bilangan paun yang baharu.",
              en: "You reused the ORIGINAL total. Recalculate for the new number of loaves.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari jumlah tepung sebagi paun dahulu (jumlah asal ÷ bilangan paun asal), kemudian darabkan dengan bilangan paun yang baharu.",
            en: "First find the per-loaf flour amount (original total ÷ original number of loaves), then multiply by the new number of loaves.",
          },
        };
      }
      // reverseProblem: correctAnswer is the per-batch fraction, not the total.
      if (correctNum !== undefined && correctDenom !== undefined && question.correctAnswer !== `${correctNum}/${correctDenom}`) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Untuk cari nilai satu bahagian, BAHAGIKAN jumlah dengan bilangan bahagian, bukan darab semula.",
            en: "To find the value of one share, DIVIDE the total by the number of shares, don't multiply again.",
          },
        };
      }
      if (answer === `${num}/${denom * whole}`) {
        return {
          mistakeType: "multiplied_denominator_instead",
          hint: {
            ms: "Ini soalan darab, bukan bahagi. Darabkan PENGANGKA dengan nombor bulat itu, bukan penyebut.",
            en: "This is a multiplication question, not division. Multiply the NUMERATOR by the whole number, not the denominator.",
          },
        };
      }
      return {
        mistakeType: "forgot_to_simplify",
        hint: {
          ms: "Semak semula sama ada jawapan anda sudah dipermudahkan.",
          en: "Check whether your answer is already in simplest form.",
        },
      };
    }

    case "decimal_percentage_convert": {
      const ctxDPC = question.context as { diffPct?: number; decimal1?: number; decimal2?: number; h2?: number };
      // challenge: correctAnswer is the percentage-point IMPROVEMENT
      // between two decimal scores, not a single conversion.
      if (ctxDPC.diffPct !== undefined) {
        const { diffPct, decimal1, decimal2, h2 } = ctxDPC as { diffPct: number; decimal1: number; decimal2: number; h2: number };
        if (answer === (decimal2 - decimal1).toFixed(2)) {
          return {
            mistakeType: "forgot_to_convert_to_percentage",
            hint: {
              ms: "Anda tolak dengan betul tetapi lupa tukar bezanya kepada peratus (darab dengan 100).",
              en: "You subtracted correctly but forgot to convert the difference to a percentage (multiply by 100).",
            },
          };
        }
        if (Number(answer) === h2) {
          return {
            mistakeType: "ignored_first_attempt",
            hint: {
              ms: "Itu markah kedua sahaja. Cari BEZA antara kedua-dua percubaan, bukan markah kedua sahaja.",
              en: "That's just the second score. Find the DIFFERENCE between the two attempts, not just the second score.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tolak markah pertama daripada markah kedua, kemudian tukar bezanya kepada peratus.",
            en: "Subtract the first score from the second, then convert the difference to a percentage.",
          },
        };
      }
      return {
        mistakeType: "decimal_percentage_scale_error",
        hint: {
          ms: "Ingat: darab dengan 100 untuk tukar perpuluhan kepada peratus, bahagi dengan 100 untuk arah bertentangan.",
          en: "Remember: multiply by 100 to convert a decimal to a percentage, divide by 100 for the reverse.",
        },
      };
    }

    case "percentage_add_subtract": {
      const ctxPAS = question.context as { p1?: number; p2?: number; p3?: number; afterTwoRises?: number; correct?: number };
      // challenge: correctAnswer combines THREE percentage changes, not
      // just two.
      if (ctxPAS.p3 !== undefined) {
        const { p1, p3, afterTwoRises, correct } = ctxPAS as { p1: number; p3: number; afterTwoRises: number; correct: number };
        if (Number(answer) === afterTwoRises) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda gabungkan dua kenaikan pertama sahaja. Jangan lupa gunakan perubahan ketiga juga.",
              en: "You only combined the first two rises. Don't forget to apply the third change too.",
            },
          };
        }
        if (Number(answer) === p1 - p3) {
          return {
            mistakeType: "ignored_middle_value",
            hint: {
              ms: "Anda terlepas pandang kenaikan kedua. Gabungkan KETIGA-TIGA perubahan mengikut urutan.",
              en: "You skipped the second rise. Combine ALL THREE changes in order.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Gabungkan dua perubahan pertama dahulu, kemudian gunakan perubahan ketiga pada jumlah itu.",
            en: "Combine the first two changes first, then apply the third change to that total.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Layan peratus seperti nombor bulat biasa — tambah atau tolak terus.",
          en: "Treat the percentages like regular whole numbers — add or subtract directly.",
        },
      };
    }

    case "fractions_divide_mixed_by_whole": {
      const ctxFDMW = question.context as { fracNum: number; denom: number; divisor: number; correctNum?: number; correctDenom?: number; finalNum?: number; finalDenom?: number };
      // challenge: correctAnswer is the share after a SECOND division,
      // not the first per-container amount alone.
      if (ctxFDMW.finalNum !== undefined) {
        const { correctNum, correctDenom } = ctxFDMW as { correctNum: number; correctDenom: number };
        if (answer === `${correctNum}/${correctDenom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri jumlah selepas pembahagian PERTAMA sahaja. Teruskan: bahagikan jumlah itu sekali lagi dengan bilangan beg kecil.",
              en: "You gave the amount after the FIRST division only. Keep going: divide that amount again by the number of small bags.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) darabkan penyebut dengan bilangan bekas pertama, (2) darabkan penyebut itu SEKALI LAGI dengan bilangan beg kecil.",
            en: "Two steps: (1) multiply the denominator by the first number of containers, (2) multiply that denominator AGAIN by the number of small bags.",
          },
        };
      }
      const { fracNum, denom, divisor } = ctxFDMW;
      if (answer === `${fracNum}/${denom * divisor}`) {
        return {
          mistakeType: "ignored_whole_number_part",
          hint: {
            ms: "Jangan lupa tukar nombor bercampur kepada pecahan tak wajar dahulu, sebelum membahagi.",
            en: "Don't forget to convert the mixed number to an improper fraction first, before dividing.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Tukar kepada pecahan tak wajar dahulu, kemudian darabkan penyebut dengan nombor bulat itu.",
          en: "Convert to an improper fraction first, then multiply the denominator by the whole number.",
        },
      };
    }

    case "service_tax": {
      const ctxST = question.context as { taxSen?: number; totalSen?: number; discountPct?: number; discountedSen?: number };
      // challenge: correctAnswer applies tax AFTER a discount, not a
      // single tax calculation on a given amount.
      if (ctxST.discountPct !== undefined) {
        const { discountedSen, totalSen } = ctxST as { discountedSen: number; totalSen: number };
        const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
        if (Math.abs(answerSen - discountedSen) < 5) {
          return {
            mistakeType: "forgot_tax_after_discount",
            hint: {
              ms: "Anda berhenti selepas diskaun. Jangan lupa tambah cukai perkhidmatan atas harga yang telah didiskaun itu.",
              en: "You stopped after the discount. Don't forget to add the service tax on top of the discounted price.",
            },
          };
        }
        return {
          mistakeType: "taxed_wrong_amount",
          hint: {
            ms: "Cukai perkhidmatan dikira atas harga SELEPAS diskaun, bukan harga asal. Tolak diskaun dahulu, kemudian kira cukai.",
            en: "Service tax is calculated on the price AFTER the discount, not the original price. Subtract the discount first, then calculate the tax.",
          },
        };
      }
      const { taxSen, totalSen } = ctxST as { taxSen: number; totalSen: number };
      const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
      if (Math.abs(answerSen - taxSen) < 5) {
        return {
          mistakeType: "gave_tax_only",
          hint: {
            ms: "Itu jumlah cukai sahaja. Soalan minta JUMLAH PERLU DIBAYAR — tambah cukai pada jumlah invois.",
            en: "That's just the tax amount. The question asks for the TOTAL PAYABLE — add the tax to the invoice amount.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari jumlah cukai dahulu, kemudian tambah pada jumlah invois.", en: "Find the tax amount first, then add it to the invoice total." },
      };
    }

    case "dividend": {
      const ctxDiv = question.context as { shares1?: number; rate1?: number; dividend1?: number; totalSen?: number };
      // challenge: correctAnswer combines dividends from TWO companies,
      // not one.
      if (ctxDiv.shares1 !== undefined) {
        const { dividend1, totalSen } = ctxDiv as { dividend1: number; totalSen: number };
        const answerSen = Math.round(parseFloat(answer.replace(/[^0-9.]/g, "")) * 100);
        if (Math.abs(answerSen - dividend1) < 5) {
          return {
            mistakeType: "stopped_at_first_company",
            hint: {
              ms: "Anda beri dividen syarikat pertama sahaja. Jangan lupa cari dividen syarikat kedua dan tambahkan kedua-duanya.",
              en: "You only gave the first company's dividend. Don't forget to find the second company's dividend too and add them together.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari dividen SETIAP syarikat secara berasingan (kadar yang berbeza!), kemudian tambahkan kedua-duanya.",
            en: "Find the dividend for EACH company separately (different rates!), then add them together.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Darabkan bilangan saham dengan dividen bagi setiap saham.",
          en: "Multiply the number of shares by the dividend per share.",
        },
      };
    }

    case "proportion": {
      const ctxProp = question.context as { a?: number; b?: number; knownVal?: number; cA?: number; cB?: number; cC?: number; total?: number; correct?: number };
      // challenge: correctAnswer is one part of a THREE-way ratio given
      // only the total, not a two-way ratio given one known part.
      if (ctxProp.cA !== undefined) {
        const { total, correct } = ctxProp as { total: number; correct: number };
        if (Number(answer) === Math.round(total / 3)) {
          return {
            mistakeType: "divided_evenly_ignored_ratio",
            hint: {
              ms: "Jangan bahagikan jumlah itu sama rata. Guna nisbah untuk cari faktor skala dahulu.",
              en: "Don't split the total evenly. Use the ratio to find the scale factor first.",
            },
          };
        }
        if (Number(answer) === total) {
          return {
            mistakeType: "gave_total_instead_of_part",
            hint: {
              ms: "Itu jumlah KESEMUA haiwan. Cari faktor skala dahulu, kemudian darab dengan nombor nisbah haiwan yang ditanya.",
              en: "That's the total of ALL animals. Find the scale factor first, then multiply by the ratio number for the animal being asked about.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan ketiga-tiga nombor nisbah, bahagikan jumlah dengan itu untuk cari faktor skala, kemudian darab.",
            en: "Add all three ratio numbers, divide the total by that to find the scale factor, then multiply.",
          },
        };
      }
      const { a, b, knownVal } = ctxProp as { a: number; b: number; knownVal: number };
      if (Number(answer) === knownVal + Math.abs(a - b)) {
        return {
          mistakeType: "added_instead_of_scaled",
          hint: {
            ms: "Ini soalan nisbah — cari FAKTOR SKALA dahulu (bahagikan), jangan tambah beza.",
            en: "This is a ratio question — find the SCALE FACTOR first (by dividing), don't add the difference.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cari faktor skala daripada kuantiti yang diketahui, kemudian gunakan pada sisi nisbah yang satu lagi.",
          en: "Find the scale factor from the known quantity, then apply it to the other side of the ratio.",
        },
      };
    }

    case "unitary_proportion": {
      const ctxUP = question.context as unknown as { unitCost?: number; targetQty?: number; costA?: number; forgotUnitStepBoth?: number; combined?: number };
      // challenge: correctAnswer is the COMBINED cost of new quantities
      // of TWO different items, not one.
      if (ctxUP.costA !== undefined) {
        const { costA, combined } = ctxUP as { costA: number; combined: number };
        if (Number(answer) === costA) {
          return {
            mistakeType: "stopped_at_first_item",
            hint: {
              ms: "Itu kos SATU item sahaja. Cari kos item kedua juga (guna kaedah unit), kemudian tambahkan kedua-duanya.",
              en: "That's just ONE item's cost. Find the second item's cost too (using the unit method), then add them together.",
            },
          };
        }
        return {
          mistakeType: "skipped_unit_step",
          hint: {
            ms: "Untuk SETIAP item, cari harga SATU dahulu (bahagi dengan kuantiti asal), darab dengan kuantiti baharu, kemudian tambahkan kos kedua-dua item.",
            en: "For EACH item, find the ONE-item price first (divide by the original quantity), multiply by the new quantity, then add both items' costs together.",
          },
        };
      }
      const { unitCost, targetQty } = ctxUP as { unitCost: number; targetQty: number };
      if (Number(answer) === unitCost * targetQty) {
        return {
          mistakeType: "skipped_unit_step",
          hint: {
            ms: "Cari harga SATU item dahulu (bahagikan dengan kuantiti asal), kemudian darab dengan kuantiti baharu.",
            en: "Find the price of ONE item first (divide by the original quantity), then multiply by the new quantity.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Kaedah unit: cari harga satu item dahulu, kemudian darabkan dengan kuantiti yang ditanya.",
          en: "Unitary method: find the price of one item first, then multiply by the quantity being asked about.",
        },
      };
    }

    case "write_ratio": {
      const { a, b } = question.context as unknown as { a: number; b: number };
      if (answer === `${b}:${a}`) {
        return {
          mistakeType: "reversed_ratio_order",
          hint: {
            ms: "Susunan nisbah penting — tulis mengikut urutan yang ditanya dalam soalan (yang pertama disebut, ditulis dahulu).",
            en: "Order matters in a ratio — write it in the order the question asks (whichever is named first goes first).",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Nisbah membandingkan dua kuantiti dalam bentuk a:b — guna nombor sebenar, jangan tambah atau tolak.",
          en: "A ratio compares two quantities as a:b — use the actual counts, don't add or subtract them.",
        },
      };
    }

    case "asset_liability": {
      const ctxAL = question.context as { assetTotal?: number; liabilityTotal?: number; netWorth?: number };
      // challenge: correctAnswer is the NET WORTH from a list of valued
      // items, not a single classification or a plain count.
      if (ctxAL.netWorth !== undefined) {
        const { assetTotal, liabilityTotal, netWorth } = ctxAL as { assetTotal: number; liabilityTotal: number; netWorth: number };
        if (answer === `RM${assetTotal + liabilityTotal}`) {
          return {
            mistakeType: "added_instead_of_subtracted",
            hint: {
              ms: "Liabiliti MENGURANGKAN kekayaan bersih — tolak jumlah liabiliti daripada jumlah aset, jangan tambah.",
              en: "Liabilities REDUCE net worth — subtract the liability total from the asset total, don't add them.",
            },
          };
        }
        if (answer === `RM${assetTotal}`) {
          return {
            mistakeType: "forgot_to_subtract_liabilities",
            hint: {
              ms: "Itu jumlah aset sahaja. Jangan lupa tolak jumlah liabiliti untuk cari kekayaan bersih.",
              en: "That's just the asset total. Don't forget to subtract the liability total to find the net worth.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Jumlahkan semua nilai aset, jumlahkan semua nilai liabiliti, kemudian tolak liabiliti daripada aset.",
            en: "Add up all the asset values, add up all the liability values, then subtract liabilities from assets.",
          },
        };
      }
      return {
        mistakeType: "asset_liability_misconception",
        hint: {
          ms: "Aset ialah sesuatu yang anda MILIKI dan bernilai. Liabiliti ialah sesuatu yang anda TERHUTANG.",
          en: "An asset is something you OWN that has value. A liability is something you OWE.",
        },
      };
    }

    case "fractions_divide_by_fraction": {
      const ctxFDF = question.context as { correctNum?: number; correctDenom?: number; finalNum?: number; finalDenom?: number };
      // challenge: correctAnswer is the count after a SECOND split into
      // boxes, not the first bottle-count quotient alone.
      if (ctxFDF.finalNum !== undefined) {
        const { correctNum, correctDenom } = ctxFDF as { correctNum: number; correctDenom: number };
        if (answer === `${correctNum}/${correctDenom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri jumlah botol selepas pembahagian PERTAMA sahaja. Teruskan: bahagikan jumlah itu sekali lagi dengan bilangan kotak.",
              en: "You gave the bottle count after the FIRST division only. Keep going: divide that count again by the number of boxes.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) terbalik dan darab untuk cari jumlah botol, (2) darabkan penyebut itu SEKALI LAGI dengan bilangan kotak.",
            en: "Two steps: (1) flip and multiply to find the bottle count, (2) multiply that denominator AGAIN by the number of boxes.",
          },
        };
      }
      return {
        mistakeType: "forgot_to_flip",
        hint: {
          ms: "Ingat: \"terbalik dan darab\" — terbalikkan pecahan kedua dahulu, kemudian darab.",
          en: "Remember: \"flip and multiply\" — flip the second fraction first, then multiply.",
        },
      };
    }

    case "fractions_divide_mixed_by_fraction": {
      const ctxFDMF = question.context as { correctNum?: number; correctDenom?: number; finalNum?: number; finalDenom?: number };
      // challenge: correctAnswer is the count after a SECOND split among
      // students, not the first piece-count quotient alone.
      if (ctxFDMF.finalNum !== undefined) {
        const { correctNum, correctDenom } = ctxFDMF as { correctNum: number; correctDenom: number };
        if (answer === `${correctNum}/${correctDenom}`) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri jumlah bahagian selepas pembahagian PERTAMA sahaja. Teruskan: bahagikan jumlah itu sekali lagi dengan bilangan murid.",
              en: "You gave the piece count after the FIRST division only. Keep going: divide that count again by the number of students.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) tukar kepada pecahan tak wajar dan terbalik-darab untuk cari jumlah bahagian, (2) darabkan penyebut itu SEKALI LAGI dengan bilangan murid.",
            en: "Two steps: (1) convert to an improper fraction and flip-multiply to find the piece count, (2) multiply that denominator AGAIN by the number of students.",
          },
        };
      }
      return {
        mistakeType: "fraction_calculation_error",
        hint: {
          ms: "Tukar nombor bercampur kepada pecahan tak wajar dahulu, kemudian \"terbalik dan darab\".",
          en: "Convert the mixed number to an improper fraction first, then \"flip and multiply\".",
        },
      };
    }

    case "time_unit_add_subtract": {
      const ctxTUAS = question.context as unknown as { factor: number; big: string; small: string; cSmall?: number; afterFirstTwo?: number; totalSmall?: number };
      // challenge: correctAnswer combines THREE durations, not two.
      if (ctxTUAS.cSmall !== undefined) {
        const { factor, big, small, afterFirstTwo, totalSmall } = ctxTUAS as { factor: number; big: string; small: string; afterFirstTwo: number; totalSmall: number };
        const fmt = (totalSmallV: number) => {
          const bigVal = Math.floor(totalSmallV / factor);
          const smallVal = totalSmallV % factor;
          if (bigVal === 0) return `${smallVal}${small}`;
          if (smallVal === 0) return `${bigVal}${big}`;
          return `${bigVal}${big} ${smallVal}${small}`;
        };
        if (answer === fmt(afterFirstTwo)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda berhenti selepas menambah dua tempoh pertama. Jangan lupa tambah tempoh ketiga juga.",
              en: "You stopped after adding the first two durations. Don't forget to add the third duration too.",
            },
          };
        }
        return {
          mistakeType: "time_carry_error",
          hint: {
            ms: `Tambahkan ketiga-tiga tempoh itu satu demi satu. Ingat: ${factor} ${small} = 1 ${big} — kumpul semula jika perlu selepas SETIAP penambahan.`,
            en: `Add all three durations one at a time. Remember: ${factor} ${small} = 1 ${big} — regroup if needed after EACH addition.`,
          },
        };
      }
      const { factor, big, small } = ctxTUAS as { factor: number; big: string; small: string };
      return {
        mistakeType: "time_carry_error",
        hint: {
          ms: `Ingat: ${factor} ${small} = 1 ${big}. Semak semula sama ada anda "simpan"/"pinjam" dengan betul.`,
          en: `Remember: ${factor} ${small} = 1 ${big}. Check whether you carried/borrowed correctly.`,
        },
      };
    }

    case "time_zones": {
      const ctxTZ = question.context as unknown as { cityAOffset: number; cityBOffset: number; startHour: number; flightHours?: number; arrivalHour?: number };
      // challenge: correctAnswer is the LOCAL arrival time of a flight
      // (duration + timezone shift combined), not a single GMT
      // adjustment applied to a stationary time.
      if (ctxTZ.flightHours !== undefined) {
        const { cityAOffset, cityBOffset, startHour, flightHours, arrivalHour } = ctxTZ as { cityAOffset: number; cityBOffset: number; startHour: number; flightHours: number; arrivalHour: number };
        const forgotShift = `${String(((startHour + flightHours) % 24 + 24) % 24).padStart(2, "0")}:00`;
        const forgotDuration = `${String(((startHour + (cityBOffset - cityAOffset)) % 24 + 24) % 24).padStart(2, "0")}:00`;
        if (answer === forgotShift) {
          return {
            mistakeType: "forgot_timezone_shift",
            hint: {
              ms: "Anda tambah tempoh penerbangan dengan betul, tetapi lupa laraskan mengikut beza GMT antara kedua-dua bandar.",
              en: "You added the flight duration correctly, but forgot to adjust for the GMT difference between the two cities.",
            },
          };
        }
        if (answer === forgotDuration) {
          return {
            mistakeType: "forgot_flight_duration",
            hint: {
              ms: "Anda laraskan mengikut GMT dengan betul, tetapi lupa tambah tempoh penerbangan itu.",
              en: "You adjusted for the GMT difference correctly, but forgot to add the flight duration.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambah tempoh penerbangan pada masa berlepas dahulu, kemudian laraskan mengikut beza GMT.",
            en: "Add the flight duration to the departure time first, then adjust for the GMT difference.",
          },
        };
      }
      const { cityAOffset, cityBOffset, startHour } = ctxTZ as { cityAOffset: number; cityBOffset: number; startHour: number };
      // reverseProblem: correctAnswer is a GMT offset, not a time.
      if (question.correctAnswer.startsWith("GMT")) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "GMT bandar destinasi = GMT bandar asal + beza jam yang diperhatikan.",
            en: "Destination city's GMT = origin city's GMT + the observed hour difference.",
          },
        };
      }
      const reversedHour = ((startHour - (cityBOffset - cityAOffset)) % 24 + 24) % 24;
      const reversed = `${String(reversedHour).padStart(2, "0")}:00`;
      if (answer === reversed) {
        return {
          mistakeType: "wrong_offset_direction",
          hint: {
            ms: "Semak semula ARAH pelarasan — jika bandar itu di GMT lebih tinggi, tambah jam; jika lebih rendah, tolak jam.",
            en: "Check the DIRECTION of the adjustment — if that city's GMT is higher, add hours; if lower, subtract hours.",
          },
        };
      }
      if (answer === `${String(((startHour % 24) + 24) % 24).padStart(2, "0")}:00`) {
        return {
          mistakeType: "forgot_to_convert",
          hint: {
            ms: "Anda lupa laraskan masa mengikut beza GMT antara kedua-dua bandar itu.",
            en: "You forgot to adjust the time by the GMT difference between the two cities.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Cari beza GMT antara kedua-dua bandar, kemudian tambah atau tolak beza itu daripada masa yang diberi.",
          en: "Find the GMT difference between the two cities, then add or subtract that difference from the given time.",
        },
      };
    }

    case "coordinate_distance": {
      const ctx = question.context as unknown as {
        coord1: number; coord2: number; scaleUnitMeters?: number; gridDistance?: number; unit?: string;
        leg1Grid?: number; leg2Grid?: number; totalGrid?: number; totalReal?: number;
      };
      // challenge: correctAnswer is the TOTAL real distance across a
      // two-leg journey, not a single scaled grid distance. Must be
      // checked BEFORE the "scaled" branch below since both contexts
      // carry a `scaleUnitMeters` field.
      if (ctx.leg1Grid !== undefined) {
        const { leg1Grid, scaleUnitMeters, totalGrid, totalReal } = ctx as { leg1Grid: number; scaleUnitMeters: number; totalGrid: number; totalReal: number };
        if (Number(answer) === leg1Grid * scaleUnitMeters) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri jarak sebenar bagi kaki perjalanan PERTAMA sahaja. Jangan lupa tambah kaki perjalanan kedua juga.",
              en: "You gave the real distance for the FIRST leg only. Don't forget to add the second leg too.",
            },
          };
        }
        if (Number(answer) === totalGrid) {
          return {
            mistakeType: "forgot_to_apply_scale",
            hint: {
              ms: `Anda jumlahkan jarak grid dengan betul tetapi lupa darab dengan skala (${scaleUnitMeters} m setiap unit).`,
              en: `You added the grid distances correctly but forgot to multiply by the scale (${scaleUnitMeters} m per unit).`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Cari jarak grid bagi SETIAP kaki perjalanan, tambahkan kedua-duanya, kemudian darab dengan skala.",
            en: "Find the grid distance for EACH leg of the journey, add them together, then multiply by the scale.",
          },
        };
      }
      // scaled: correctAnswer is a real-world distance (m/km via a map
      // scale), not the raw grid difference.
      if (ctx.scaleUnitMeters !== undefined) {
        if (Number(answer) === ctx.gridDistance) {
          return {
            mistakeType: "forgot_to_apply_scale",
            hint: {
              ms: `Darabkan jarak grid dengan skala (${ctx.scaleUnitMeters} m setiap unit) untuk dapat jarak sebenar.`,
              en: `Multiply the grid distance by the scale (${ctx.scaleUnitMeters} m per unit) to get the real distance.`,
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: `Jarak sebenar = jarak grid × skala. Semak juga sama ada anda perlu tukar m kepada ${ctx.unit}.`,
            en: `Real distance = grid distance × scale. Also check whether you need to convert m to ${ctx.unit}.`,
          },
        };
      }
      // reverseProblem: correctAnswer is a coordinate pair like "(4, 6)", not a number.
      if (question.correctAnswer.startsWith("(")) {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan jarak itu kepada nilai koordinat yang berubah bagi titik A untuk cari titik B (bukan tolak).",
            en: "Add the distance to point A's changing coordinate value to find point B (not subtract).",
          },
        };
      }
      if (Number(answer) === ctx.coord1 + ctx.coord2) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Jarak ialah BEZA antara dua koordinat, bukan jumlahnya.",
            en: "Distance is the DIFFERENCE between two coordinates, not their sum.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari beza antara dua koordinat yang berubah itu.", en: "Find the difference between the two changing coordinates." },
      };
    }

    case "mode_range_median_mean": {
      const ctx = question.context as unknown as Record<string, any>;
      // challenge: correctAnswer is the NEW range after a 6th score is
      // added, not one of the original 4 statistics.
      if (ctx.newRange !== undefined) {
        if (Number(answer) === ctx.oldRange) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda beri julat LAMA. Markah keenam itu mengubah nilai maksimum atau minimum — kira semula julat baharu.",
              en: "You gave the OLD range. The 6th score changes the maximum or minimum — recalculate the new range.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Semak semula sama ada markah baharu itu menjadi nilai MAKSIMUM atau MINIMUM baharu, kemudian kira julat = maks − min.",
            en: "Check whether the new score becomes the new MAXIMUM or MINIMUM, then calculate range = max − min.",
          },
        };
      }
      const { statType } = ctx as { statType: string };
      const stats = ctx as Record<string, string>;
      const confusedWith = Object.keys(stats).find((k) => ["mode", "range", "median", "mean"].includes(k) && k !== statType && stats[k] === answer);
      if (confusedWith) {
        return {
          mistakeType: "confused_statistic_type",
          hint: {
            ms: `Itu jawapan untuk ${confusedWith}, bukan ${statType}. Semak semula definisi setiap satu.`,
            en: `That's the answer for ${confusedWith}, not ${statType}. Double check the definition of each.`,
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: {
          ms: "Semak semula: mod=paling kerap, julat=maks−min, median=nilai tengah, min=jumlah÷bilangan.",
          en: "Check again: mode=most frequent, range=max−min, median=middle value, mean=sum÷count.",
        },
      };
    }

    case "credit_vs_cash": {
      const ctxCVC = question.context as { depositA?: number; totalA?: number; totalB?: number; diff?: number };
      // challenge: correctAnswer is the price difference between TWO
      // instalment plans, not the extra cost vs cash.
      if (ctxCVC.depositA !== undefined) {
        const { totalA, totalB, diff } = ctxCVC as { totalA: number; totalB: number; diff: number };
        if (answer === formatRM(totalA * 100) || answer === formatRM(totalB * 100)) {
          return {
            mistakeType: "gave_one_total_not_difference",
            hint: {
              ms: "Itu jumlah SATU kedai sahaja. Cari jumlah KEDUA-DUA pelan, kemudian tolak untuk cari beza.",
              en: "That's just ONE store's total. Find the total for BOTH plans, then subtract to find the difference.",
            },
          };
        }
        if (answer === formatRM((totalA + totalB) * 100)) {
          return {
            mistakeType: "added_instead_of_subtracted",
            hint: {
              ms: "Jangan tambah kedua-dua jumlah itu. Cari BEZA (tolak) antara jumlah Kedai A dan Kedai B.",
              en: "Don't add the two totals together. Find the DIFFERENCE (subtract) between Store A's and Store B's totals.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Kira jumlah keseluruhan bagi SETIAP pelan (pendahuluan + bulanan × bilangan bulan), kemudian tolak untuk cari beza.",
            en: "Calculate the total for EACH plan (deposit + monthly × number of months), then subtract to find the difference.",
          },
        };
      }
      return {
        mistakeType: "gave_credit_total_not_difference",
        hint: {
          ms: "Soalan minta LEBIHAN bayaran, bukan jumlah ansuran keseluruhan — tolak harga tunai daripada jumlah ansuran.",
          en: "The question asks for the EXTRA amount paid, not the full instalment total — subtract the cash price from the instalment total.",
        },
      };
    }

    case "insurance_takaful": {
      const ctxIT = question.context as { totalTakaful?: number; totalInsurance?: number };
      // challenge: correctAnswer is the TOTAL coverage of takaful plans
      // filtered from a valued list, not a single classification.
      if (ctxIT.totalTakaful !== undefined) {
        const { totalTakaful, totalInsurance } = ctxIT as { totalTakaful: number; totalInsurance: number };
        if (answer === `RM${totalTakaful + totalInsurance}`) {
          return {
            mistakeType: "summed_everything",
            hint: {
              ms: "Jangan jumlahkan SEMUA pelan. Kelaskan setiap pelan dahulu, kemudian jumlahkan hanya pelan TAKAFUL.",
              en: "Don't sum EVERY plan. Classify each plan first, then sum only the TAKAFUL ones.",
            },
          };
        }
        if (answer === `RM${totalInsurance}`) {
          return {
            mistakeType: "summed_wrong_group",
            hint: {
              ms: "Itu jumlah pelan Insurans, bukan Takaful. Semak semula pengelasan setiap pelan.",
              en: "That's the total of the Insurance plans, not Takaful. Double-check how you classified each plan.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Kelaskan setiap pelan sebagai Insurans atau Takaful dahulu, kemudian jumlahkan nilai perlindungan pelan TAKAFUL sahaja.",
            en: "Classify each plan as Insurance or Takaful first, then sum the coverage values of just the TAKAFUL ones.",
          },
        };
      }
      return {
        mistakeType: "insurance_takaful_misconception",
        hint: {
          ms: "Takaful berdasarkan prinsip Syariah (sumbangan bersama, tiada riba). Insurans konvensional dikendalikan syarikat dengan premium tetap.",
          en: "Takaful is based on Shariah principles (mutual contribution, no interest). Conventional insurance is company-run with a fixed premium.",
        },
      };
    }

    case "combined_length_mass": {
      const ctxCLM = question.context as unknown as { askLength: string; lengthACm?: number; massAG?: number; lengthPerPieceCm?: number; massPerPieceG?: number; pieces?: number };
      // challenge: correctAnswer combines TWO ropes before dividing, not
      // one.
      if (ctxCLM.lengthACm !== undefined) {
        return {
          mistakeType: "forgot_to_combine_ropes",
          hint: {
            ms: "Gabungkan Tali A dan Tali B DAHULU (tambah panjang atau berat kedua-duanya), kemudian bahagikan jumlah itu dengan bilangan bahagian.",
            en: "Combine Rope A and Rope B FIRST (add both their lengths or weights), then divide that total by the number of pieces.",
          },
        };
      }
      const { askLength } = question.context as unknown as { askLength: string };
      return {
        mistakeType: "mixed_up_measurement_quantity",
        hint: {
          ms: `Soalan ini minta ${askLength === "yes" ? "PANJANG" : "BERAT"} setiap bahagian — semak semula anda jawab kuantiti yang betul.`,
          en: `This question asks for the ${askLength === "yes" ? "LENGTH" : "WEIGHT"} of each piece — check you answered the right quantity.`,
        },
      };
    }

    case "combined_length_volume": {
      const ctxCLV = question.context as unknown as { askLength: string; lengthACm?: number };
      // challenge: correctAnswer combines TWO gardens' hose+fertiliser
      // before dividing, not one.
      if (ctxCLV.lengthACm !== undefined) {
        return {
          mistakeType: "forgot_to_combine_gardens",
          hint: {
            ms: "Gabungkan Taman A dan Taman B DAHULU (tambah kedua-dua panjang atau kedua-dua isipadu), kemudian bahagikan jumlah itu dengan bilangan bahagian.",
            en: "Combine Garden A and Garden B FIRST (add both lengths or both volumes), then divide that total by the number of sections.",
          },
        };
      }
      const { askLength } = ctxCLV as { askLength: string };
      return {
        mistakeType: "mixed_up_measurement_quantity",
        hint: {
          ms: `Soalan ini minta ${askLength === "yes" ? "PANJANG" : "ISIPADU"} setiap bahagian — semak semula anda jawab kuantiti yang betul.`,
          en: `This question asks for the ${askLength === "yes" ? "LENGTH" : "VOLUME"} of each section — check you answered the right quantity.`,
        },
      };
    }

    case "combined_mass_volume": {
      const ctxCMV = question.context as unknown as { askMass: string; massAG?: number };
      // challenge: correctAnswer combines TWO batters before dividing,
      // not one.
      if (ctxCMV.massAG !== undefined) {
        return {
          mistakeType: "forgot_to_combine_batters",
          hint: {
            ms: "Gabungkan Adunan A dan Adunan B DAHULU (tambah kedua-dua berat tepung atau kedua-dua isipadu susu), kemudian bahagikan jumlah itu dengan bilangan bahagian.",
            en: "Combine Batter A and Batter B FIRST (add both flour masses or both milk volumes), then divide that total by the number of batches.",
          },
        };
      }
      const { askMass } = ctxCMV as { askMass: string };
      return {
        mistakeType: "mixed_up_measurement_quantity",
        hint: {
          ms: `Soalan ini minta ${askMass === "yes" ? "BERAT TEPUNG" : "ISIPADU SUSU"} setiap bahagian — semak semula anda jawab kuantiti yang betul.`,
          en: `This question asks for the ${askMass === "yes" ? "MASS OF FLOUR" : "VOLUME OF MILK"} of each batch — check you answered the right quantity.`,
        },
      };
    }

    case "bar_graph": {
      const ctx = question.context as { variant: string; v0: number; v1: number; v2: number; v3: number; correct: number; iHigh?: number; iLow?: number; missingIndex?: number; doubleLow?: number; finalDiff?: number };
      const values = [ctx.v0, ctx.v1, ctx.v2, ctx.v3];
      // challenge: correct is highest-minus-double-lowest, a genuinely
      // different target than the plain total/difference/reverse variants.
      if (ctx.finalDiff !== undefined) {
        const plainDifference = values[ctx.iHigh as number] - values[ctx.iLow as number];
        if (Number(answer) === plainDifference) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda kira beza biasa sahaja. Gandakan dahulu nilai kumpulan PALING SEDIKIT, kemudian tolak daripada kumpulan PALING BANYAK.",
              en: "You calculated the plain difference. Double the LOWEST group's value first, then subtract from the HIGHEST group.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) gandakan (× 2) nilai kumpulan paling sedikit, (2) tolak hasil itu daripada kumpulan paling banyak.",
            en: "Two steps: (1) double (× 2) the lowest group's value, (2) subtract that from the highest group.",
          },
        };
      }
      // reverseProblem: correct is the missing bar's value, not a total/difference.
      if (ctx.variant === "reverse") {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "TOLAK jumlah tiga kumpulan yang diketahui daripada jumlah keseluruhan untuk cari kumpulan yang hilang.",
            en: "SUBTRACT the sum of the three known groups from the total to find the missing group.",
          },
        };
      }
      if (ctx.variant === "total") {
        const forgotOneOptions = values.map((_, i) => ctx.correct - values[i]);
        if (forgotOneOptions.includes(Number(answer))) {
          return {
            mistakeType: "forgot_one_bar",
            hint: {
              ms: "Semak semula: adakah anda tambah kesemua 4 kumpulan, atau terlepas satu?",
              en: "Double check: did you add up all 4 groups, or miss one?",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: { ms: "Cuba tambah semula nilai bagi kesemua 4 kumpulan.", en: "Try adding up the values for all 4 groups again." },
        };
      }
      if (Number(answer) === values[0] + values[1]) {
        return {
          mistakeType: "added_instead_of_subtracted",
          hint: {
            ms: "Soalan ini minta BEZA (perbezaan), bukan jumlah — tolak nilai yang lebih kecil daripada nilai yang lebih besar.",
            en: "This question asks for the DIFFERENCE, not a total — subtract the smaller value from the bigger one.",
          },
        };
      }
      return {
        mistakeType: "calculation_error",
        hint: { ms: "Cari nilai kumpulan tertinggi dan terendah, kemudian tolak.", en: "Find the highest and lowest group's values, then subtract." },
      };
    }

    case "pie_chart": {
      const ctx = question.context as { variant: string; total: number; denom: number; targetIndex?: number; iHigh?: number; iLow?: number; correct: number; highCount?: number; lowCount?: number; doubleLow?: number; finalDiff?: number };
      // challenge: correct is highest-minus-double-lowest, a genuinely
      // different target than the plain count/difference/reverse variants.
      if (ctx.finalDiff !== undefined) {
        if (Number(answer) === (ctx.highCount as number) - (ctx.lowCount as number)) {
          return {
            mistakeType: "stopped_at_intermediate_step",
            hint: {
              ms: "Anda kira beza biasa sahaja. Gandakan dahulu bilangan bagi kumpulan PALING SEDIKIT, kemudian tolak daripada kumpulan PALING RAMAI.",
              en: "You calculated the plain difference. Double the count for the FEWEST group first, then subtract from the MOST group.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Dua langkah: (1) gandakan (× 2) bilangan bagi kumpulan paling sedikit, (2) tolak hasil itu daripada kumpulan paling ramai.",
            en: "Two steps: (1) double (× 2) the count for the fewest group, (2) subtract that from the count for the most group.",
          },
        };
      }
      // reverseProblem: correct is the total surveyed, not a sector count/difference.
      if (ctx.variant === "reverse") {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "BAHAGIKAN bilangan sebenar dengan pecahan (pengangka÷penyebut) untuk cari jumlah keseluruhan, bukan darab.",
            en: "DIVIDE the actual count by the fraction (numerator÷denominator) to find the total, don't multiply.",
          },
        };
      }
      if (ctx.variant === "count") {
        const unitFractionOnly = ctx.total / ctx.denom;
        if (Number(answer) === unitFractionOnly && unitFractionOnly !== ctx.correct) {
          return {
            mistakeType: "treated_as_unit_fraction",
            hint: {
              ms: "Jangan anggap setiap petak carta pai bersamaan 1 bahagian sahaja — semak semula PECAHAN sebenar bagi kumpulan itu.",
              en: "Don't assume every pie slice is a single 1-part fraction — check the actual fraction shown for that group.",
            },
          };
        }
        return {
          mistakeType: "misread_pie_sector",
          hint: {
            ms: "Semak semula anda baca pecahan bagi kumpulan yang betul, kemudian darab dengan jumlah keseluruhan.",
            en: "Check you read the fraction for the correct group, then multiply it by the total.",
          },
        };
      }
      return {
        mistakeType: "added_instead_of_subtracted",
        hint: {
          ms: "Soalan ini minta BEZA (perbezaan), bukan jumlah — cari bilangan bagi setiap kumpulan dahulu, kemudian tolak.",
          en: "This question asks for the DIFFERENCE, not a total — find the count for each group first, then subtract.",
        },
      };
    }

    case "pictograph": {
      const ctx = question.context as { variant: string; unitsPerIcon: number; correct?: number; totalI?: number; combined?: number };
      // challenge: correctAnswer is the COMBINED total of TWO sellers,
      // not one seller's total or a difference between two.
      if (ctx.variant === "challenge") {
        const { unitsPerIcon, totalI, combined } = ctx as { unitsPerIcon: number; totalI: number; combined: number };
        if (answer === String(totalI)) {
          return {
            mistakeType: "stopped_at_one_seller",
            hint: {
              ms: "Itu jumlah SATU peniaga sahaja. Tukar kedua-dua peniaga kepada unit sebenar, kemudian tambahkan.",
              en: "That's just ONE seller's total. Convert both sellers to actual units, then add them together.",
            },
          };
        }
        return {
          mistakeType: "summed_icons_not_units",
          hint: {
            ms: `Tukar bilangan ikon kepada unit sebenar (darab dengan ${unitsPerIcon}) untuk SETIAP peniaga dahulu, kemudian tambahkan.`,
            en: `Convert icon counts to actual units (multiply by ${unitsPerIcon}) for EACH seller first, then add them together.`,
          },
        };
      }
      // reverseProblem: correct is the icon count, not the actual unit total.
      if (ctx.variant === "reverse") {
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: `BAHAGIKAN jumlah sebenar dengan kunci (${ctx.unitsPerIcon}) untuk cari bilangan ikon, bukan darab.`,
            en: `DIVIDE the actual total by the key (${ctx.unitsPerIcon}) to find the icon count, don't multiply.`,
          },
        };
      }
      if (ctx.variant === "count") {
        return {
          mistakeType: "forgot_pictograph_key",
          hint: {
            ms: `Jangan hanya kira bilangan ikon — darabkan bilangan ikon dengan kunci (setiap ikon = ${ctx.unitsPerIcon}) untuk dapat bilangan sebenar.`,
            en: `Don't just count the icons — multiply the icon count by the key (each icon = ${ctx.unitsPerIcon}) to get the actual count.`,
          },
        };
      }
      return {
        mistakeType: "subtracted_icons_not_units",
        hint: {
          ms: `Tukar bilangan ikon kepada unit sebenar (darab dengan ${ctx.unitsPerIcon}) untuk SETIAP peniaga dahulu, kemudian tolak.`,
          en: `Convert icon counts to actual units (multiply by ${ctx.unitsPerIcon}) for EACH seller first, then subtract.`,
        },
      };
    }

    case "line_pair_classify": {
      return {
        mistakeType: "line_relationship_misconception",
        hint: {
          ms: "SELARI = dua garis yang tidak akan bertemu walaupun disambung (jarak sentiasa sama). SERENJANG = dua garis yang bersilang tepat pada 90°.",
          en: "PARALLEL = two lines that never meet, even if extended (always the same distance apart). PERPENDICULAR = two lines that cross at exactly 90°.",
        },
      };
    }

    case "coordinates": {
      const ctxCoord = question.context as { x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number; correct?: string };
      // challenge: correctAnswer is the MIDPOINT between two named
      // points, not a single point read off a grid.
      if (ctxCoord.x1 !== undefined) {
        const { x1, y1, x2, y2 } = ctxCoord as { x1: number; y1: number; x2: number; y2: number };
        if (answer === `(${x1 + x2}, ${y1 + y2})`) {
          return {
            mistakeType: "forgot_to_halve",
            hint: {
              ms: "Anda tambah kedua-dua koordinat dengan betul, tetapi lupa BAHAGIKAN jumlah itu dengan 2 untuk cari titik tengah.",
              en: "You added both coordinates correctly, but forgot to DIVIDE that sum by 2 to find the midpoint.",
            },
          };
        }
        if (answer === `(${x1}, ${y1})`) {
          return {
            mistakeType: "used_one_point_only",
            hint: {
              ms: "Itu koordinat titik A sahaja. Guna KEDUA-DUA titik A dan B untuk cari titik tengah.",
              en: "That's just point A's coordinates. Use BOTH points A and B to find the midpoint.",
            },
          };
        }
        return {
          mistakeType: "calculation_error",
          hint: {
            ms: "Tambahkan nilai x kedua-dua titik dan bahagikan dengan 2. Buat perkara yang sama untuk nilai y.",
            en: "Add both points' x-values and divide by 2. Do the same for the y-values.",
          },
        };
      }
      const { x, y } = ctxCoord as { x: number; y: number };
      if (answer === `(${y}, ${x})`) {
        return {
          mistakeType: "swapped_x_and_y",
          hint: {
            ms: "Baca koordinat ATAS PANJANG (x) dahulu, kemudian NAIK (y). Susunan itu penting!",
            en: "Read coordinates ACROSS (x) first, then UP (y). The order matters!",
          },
        };
      }
      return {
        mistakeType: "misread_grid_position",
        hint: {
          ms: "Kira semula: berapa unit ke kanan (x), kemudian berapa unit ke atas (y) dari titik asalan?",
          en: "Recount: how many units to the right (x), then how many units up (y) from the origin?",
        },
      };
    }

    default:
      return {
        mistakeType: "unknown",
        hint: { ms: "Cuba semak semula jawapan anda.", en: "Try checking your answer again." },
      };
  }
}
