import type { Bilingual } from "../i18n/dictionary";

export type QuestionType = "mcq" | "fill" | "drag" | "match" | "word_problem";

export type DiagramSpec =
  | { kind: "angle"; degrees: number }
  | { kind: "triangle"; base: number; height: number }
  | { kind: "point3"; angleA: number; angleB: number }
  | { kind: "circle"; radius: number }
  | { kind: "bar_chart"; labels: string[]; values: number[] }
  | { kind: "pie_chart"; segments: { label: string; numerator: number; denominator: number }[] }
  | { kind: "pictograph"; segments: { label: string; iconCount: number }[]; unitsPerIcon: number }
  | { kind: "line_pair"; relationship: "parallel" | "perpendicular" | "neither"; angleDeg: number }
  | { kind: "coordinate_grid"; x: number; y: number; gridSize: number }
  | { kind: "vertical_arithmetic"; operands: string[]; operator: "+" | "\u2212"; result: string; prefix?: string }
  | { kind: "long_multiplication"; multiplicand: string; multiplier: string; result: string }
  | { kind: "long_division"; dividend: string; divisor: number }
  | { kind: "straight_line_angles"; angleA: number }
  | { kind: "triangle_angles"; angleA: number; angleB: number }
  | {
      kind: "two_rectangles";
      a: { width: number; height: number; label: string };
      b: { width: number; height: number; label: string };
    }
  | { kind: "notched_rectangle"; outerWidth: number; outerHeight: number; notchWidth: number; notchHeight: number }
  | { kind: "rectangle"; width: number; height: number; unit?: string }
  | { kind: "two_point_grid"; x1: number; y1: number; x2: number; y2: number; gridSize: number }
  | { kind: "regular_polygon"; sides: number; eachAngle: number }
  | { kind: "cuboid"; length: number; width: number; height: number; unit?: string }
  | {
      kind: "two_cuboids";
      a: { length: number; width: number; height: number; label: string };
      b: { length: number; width: number; height: number; label: string };
    };

export interface GeneratedQuestion {
  /** Frozen snapshot — this exact object gets stored in attempts.question_snapshot_json */
  prompt: Bilingual;
  type: QuestionType;
  /** For mcq: the option list including the correct one, pre-shuffled */
  options?: string[];
  correctAnswer: string;
  /** Used by lib/mistakes/classify.ts to turn a wrong answer into a mistake_type */
  context: Record<string, number | string>;
  generatorKey: string;
  difficulty: number;
  /** Optional visual to render above the prompt. Add new "kind" variants
   * to DiagramSpec above as more diagram types are needed — keep each
   * renderer in its own component under components/student/diagrams/. */
  diagram?: DiagramSpec;
}

export interface GeneratorParams {
  [key: string]: unknown;
}

export type QuestionGenerator = (params: GeneratorParams) => GeneratedQuestion;
