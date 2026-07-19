import type { Bilingual } from "../i18n/dictionary";

export type QuestionType = "mcq" | "fill" | "drag" | "match" | "word_problem";

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
}

export interface GeneratorParams {
  [key: string]: unknown;
}

export type QuestionGenerator = (params: GeneratorParams) => GeneratedQuestion;
