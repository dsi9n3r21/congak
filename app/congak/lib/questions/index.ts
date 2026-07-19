import { generateWholeNumbersAddition } from "./generators/wholeNumbers";
import { generateFractionsSameDenominator } from "./generators/fractions";
import { generateMoneyChange } from "./generators/money";
import type { GeneratedQuestion, GeneratorParams } from "./types";

const REGISTRY: Record<string, (params: GeneratorParams) => GeneratedQuestion> = {
  whole_numbers_addition: generateWholeNumbersAddition,
  fractions_same_denominator: generateFractionsSameDenominator,
  money_change: generateMoneyChange,
};

/**
 * Generates a fresh randomized question from a question_templates row.
 * `config` is the template's generator_config_json (min/max/denominators/etc),
 * merged with the requested question `type` so one template config can
 * still be reused for both an mcq and a fill variant if needed.
 */
export function generateQuestion(
  generatorKey: string,
  config: GeneratorParams,
  type: string
): GeneratedQuestion {
  const generator = REGISTRY[generatorKey];
  if (!generator) {
    throw new Error(`Unknown generator_key: ${generatorKey}`);
  }
  return generator({ ...config, type });
}
