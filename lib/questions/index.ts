import { generateWholeNumbersAddition } from "./generators/wholeNumbers";
import { generateFractionsSameDenominator } from "./generators/fractions";
import { generateMoneyChange, generateMoneyAddSubtract, generateMoneyMultiplyDivide, generateSimpleInterest, generateProfitLoss, generateDiscount, generateServiceTax, generateDividend } from "./generators/money";
import { generatePerimeter } from "./generators/perimeter";
import { generateLikelihood } from "./generators/likelihood";
import { generateProportion } from "./generators/proportion";
import { generateAssetLiability } from "./generators/assetLiability";
import { generateDecimalAddSubtract } from "./generators/decimals";
import { generatePercentageOfQuantity } from "./generators/percentage";
import { generateTimeDuration, generateTimeAddSubtract, generateTimeUnitAddSubtract } from "./generators/time";
import { generateCoordinateDistance } from "./generators/coordinateDistance";
import { generateModeRangeMedianMean } from "./generators/statistics";
import { generateCreditVsCash } from "./generators/creditVsCash";
import { generateLengthAddSubtract } from "./generators/length";
import { generateUnitConvert } from "./generators/unitConvert";
import { generateFractionsPercentageConvert } from "./generators/fractionsPercentage";
import { generateFractionsMultiply } from "./generators/fractionsMultiply";
import { generateDecimalPercentageConvert, generatePercentageAddSubtract } from "./generators/percentage";
import { generateFractionsDivideMixedByWhole } from "./generators/fractionsDivideMixed";
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
import { generateCircumference } from "./generators/circumference";
import { generateAreaCircle } from "./generators/areaCircle";
import { generateWholeNumbersSubtraction } from "./generators/wholeNumbersSubtraction";
import { generateWholeNumbersMultiplication } from "./generators/wholeNumbersMultiplication";
import { generateWholeNumbersDivision } from "./generators/wholeNumbersDivision";
import { generateBarGraph } from "./generators/barGraph";
import { generateCoordinates } from "./generators/coordinates";
import { generateWholeNumbersDivisionY5 } from "./generators/wholeNumbersDivisionY5";
import { generateWholeNumbersMultiplicationY6 } from "./generators/wholeNumbersMultiplicationY6";
import { generateMixedOperations } from "./generators/mixedOperations";
import { generateWholeNumbersMultiplicationY4 } from "./generators/wholeNumbersMultiplicationY4";
import { generateWholeNumbersDivisionY4 } from "./generators/wholeNumbersDivisionY4";
import { generateWholeNumbersAdditionY5 } from "./generators/wholeNumbersAdditionY5";
import { generateWholeNumbersSubtractionY5 } from "./generators/wholeNumbersSubtractionY5";
import { generateWholeNumbersAdditionY6 } from "./generators/wholeNumbersAdditionY6";
import { generateWholeNumbersSubtractionY6 } from "./generators/wholeNumbersSubtractionY6";
import { generateFractionsSubtractSameDenominator } from "./generators/fractionsSubtract";
import { generateDecimalAddSubtractY4, generateDecimalMultiply, generateDecimalDivide } from "./generators/decimals";
import { generateFractionsDivideByWhole, generateFractionsDivideByFraction, generateFractionsDivideMixedByFraction } from "./generators/fractionsDivide";
import type { GeneratedQuestion, GeneratorParams } from "./types";

const REGISTRY: Record<string, (params: GeneratorParams) => GeneratedQuestion> = {
  whole_numbers_addition: generateWholeNumbersAddition,
  fractions_same_denominator: generateFractionsSameDenominator,
  money_change: generateMoneyChange,
  money_add_subtract: generateMoneyAddSubtract,
  money_multiply_divide: generateMoneyMultiplyDivide,
  simple_interest: generateSimpleInterest,
  profit_loss: generateProfitLoss,
  discount: generateDiscount,
  service_tax: generateServiceTax,
  dividend: generateDividend,
  likelihood: generateLikelihood,
  proportion: generateProportion,
  asset_liability: generateAssetLiability,
  perimeter: generatePerimeter,
  decimal_add_subtract: generateDecimalAddSubtract,
  percentage_of_quantity: generatePercentageOfQuantity,
  time_duration: generateTimeDuration,
  time_add_subtract: generateTimeAddSubtract,
  time_unit_add_subtract: generateTimeUnitAddSubtract,
  coordinate_distance: generateCoordinateDistance,
  mode_range_median_mean: generateModeRangeMedianMean,
  credit_vs_cash: generateCreditVsCash,
  length_add_subtract: generateLengthAddSubtract,
  unit_convert: generateUnitConvert,
  fractions_percentage_convert: generateFractionsPercentageConvert,
  fractions_multiply: generateFractionsMultiply,
  decimal_percentage_convert: generateDecimalPercentageConvert,
  percentage_add_subtract: generatePercentageAddSubtract,
  fractions_divide_mixed_by_whole: generateFractionsDivideMixedByWhole,
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
  circumference: generateCircumference,
  area_circle: generateAreaCircle,
  whole_numbers_subtraction: generateWholeNumbersSubtraction,
  whole_numbers_multiplication: generateWholeNumbersMultiplication,
  whole_numbers_division: generateWholeNumbersDivision,
  bar_graph: generateBarGraph,
  coordinates: generateCoordinates,
  whole_numbers_division_y5: generateWholeNumbersDivisionY5,
  whole_numbers_multiplication_y6: generateWholeNumbersMultiplicationY6,
  mixed_operations: generateMixedOperations,
  whole_numbers_multiplication_y4: generateWholeNumbersMultiplicationY4,
  whole_numbers_division_y4: generateWholeNumbersDivisionY4,
  whole_numbers_addition_y5: generateWholeNumbersAdditionY5,
  whole_numbers_subtraction_y5: generateWholeNumbersSubtractionY5,
  whole_numbers_addition_y6: generateWholeNumbersAdditionY6,
  whole_numbers_subtraction_y6: generateWholeNumbersSubtractionY6,
  fractions_subtract_same_denominator: generateFractionsSubtractSameDenominator,
  decimal_add_subtract_y4: generateDecimalAddSubtractY4,
  decimal_multiply: generateDecimalMultiply,
  decimal_divide: generateDecimalDivide,
  fractions_divide_by_whole: generateFractionsDivideByWhole,
  fractions_divide_by_fraction: generateFractionsDivideByFraction,
  fractions_divide_mixed_by_fraction: generateFractionsDivideMixedByFraction,
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
