import { generateWholeNumbersAddition } from "./generators/wholeNumbers";
import { generateFractionsSameDenominator } from "./generators/fractions";
import { generateMoneyChange } from "./generators/money";
import { generatePerimeter } from "./generators/perimeter";
import { generateDecimalAddSubtract } from "./generators/decimals";
import { generatePercentageOfQuantity } from "./generators/percentage";
import { generateTimeDuration } from "./generators/time";
import { generateAverage } from "./generators/average";
import { generateSimplifyRatio } from "./generators/ratio";
import { generateVolume } from "./generators/volume";
import { generateAreaRectangle } from "./generators/areaRectangle";
import { generateAnglesStraightLine } from "./generators/anglesStraightLine";
import { generateAreaComposite } from "./generators/areaComposite";
import { generateAnglesTriangleSum } from "./generators/anglesTriangleSum";
import { generateAnglesClassify } from "./generators/anglesClassify";
import { generateAreaTriangle } from "./generators/areaTriangle";
import { generateAnglesAtPoint } from "./generators/anglesAtPoint";
import type { GeneratedQuestion, GeneratorParams } from "./types";

const REGISTRY: Record<string, (params: GeneratorParams) => GeneratedQuestion> = {
  whole_numbers_addition: generateWholeNumbersAddition,
  fractions_same_denominator: generateFractionsSameDenominator,
  money_change: generateMoneyChange,
  perimeter: generatePerimeter,
  decimal_add_subtract: generateDecimalAddSubtract,
  percentage_of_quantity: generatePercentageOfQuantity,
  time_duration: generateTimeDuration,
  average: generateAverage,
  simplify_ratio: generateSimplifyRatio,
  volume: generateVolume,
  area_rectangle: generateAreaRectangle,
  angles_straight_line: generateAnglesStraightLine,
  area_composite: generateAreaComposite,
  angles_triangle_sum: generateAnglesTriangleSum,
  angles_classify: generateAnglesClassify,
  area_triangle: generateAreaTriangle,
  angles_at_point: generateAnglesAtPoint,
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
