import type { GeneratedQuestion } from "@/lib/questions/types";
import { AngleDiagram } from "@/components/student/diagrams/AngleDiagram";
import { TriangleDiagram } from "@/components/student/diagrams/TriangleDiagram";
import { AnglesAtPointDiagram } from "@/components/student/diagrams/AnglesAtPointDiagram";
import { CircleDiagram } from "@/components/student/diagrams/CircleDiagram";
import { BarChartDiagram } from "@/components/student/diagrams/BarChartDiagram";
import { PieChartDiagram } from "@/components/student/diagrams/PieChartDiagram";
import { PictographDiagram } from "@/components/student/diagrams/PictographDiagram";
import { LinePairDiagram } from "@/components/student/diagrams/LinePairDiagram";
import { CoordinateGridDiagram } from "@/components/student/diagrams/CoordinateGridDiagram";
import { VerticalArithmetic } from "@/components/student/diagrams/VerticalArithmetic";
import { LongMultiplicationDiagram } from "@/components/student/diagrams/LongMultiplicationDiagram";
import { LongDivisionDiagram } from "@/components/student/diagrams/LongDivisionDiagram";
import { StraightLineAnglesDiagram } from "@/components/student/diagrams/StraightLineAnglesDiagram";
import { TriangleAnglesDiagram } from "@/components/student/diagrams/TriangleAnglesDiagram";
import { TwoRectanglesDiagram } from "@/components/student/diagrams/TwoRectanglesDiagram";
import { NotchedRectangleDiagram } from "@/components/student/diagrams/NotchedRectangleDiagram";
import { RectangleDiagram } from "@/components/student/diagrams/RectangleDiagram";
import { TwoPointGridDiagram } from "@/components/student/diagrams/TwoPointGridDiagram";
import { RegularPolygonDiagram } from "@/components/student/diagrams/RegularPolygonDiagram";
import { CuboidDiagram } from "@/components/student/diagrams/CuboidDiagram";
import { TwoCuboidsDiagram } from "@/components/student/diagrams/TwoCuboidsDiagram";

/**
 * Single source of truth for "which diagram component renders which
 * `diagram.kind`". Every surface that shows a generated question
 * (QuestionPlayer for /practice, QuizPlayer for /quiz, ExamFlow for
 * /exam) renders through this instead of each keeping its own copy of
 * the switch — that's what let quiz and exam silently ship without any
 * diagrams at all for months after practice got them: the switch only
 * ever got added to QuestionPlayer, and nothing forced the other two
 * surfaces to stay in sync. Add new diagram kinds here once and every
 * surface picks them up automatically.
 */
export function QuestionDiagram({ diagram }: { diagram: GeneratedQuestion["diagram"] }) {
  if (!diagram) return null;

  switch (diagram.kind) {
    case "angle":
      return (
        <div className="mt-4">
          <AngleDiagram degrees={diagram.degrees} />
        </div>
      );
    case "triangle":
      return (
        <div className="mt-4">
          <TriangleDiagram base={diagram.base} height={diagram.height} />
        </div>
      );
    case "point3":
      return (
        <div className="mt-4">
          <AnglesAtPointDiagram angleA={diagram.angleA} angleB={diagram.angleB} />
        </div>
      );
    case "circle":
      return (
        <div className="mt-4">
          <CircleDiagram radius={diagram.radius} />
        </div>
      );
    case "bar_chart":
      return (
        <div className="mt-4">
          <BarChartDiagram labels={diagram.labels} values={diagram.values} />
        </div>
      );
    case "pie_chart":
      return (
        <div className="mt-4">
          <PieChartDiagram segments={diagram.segments} />
        </div>
      );
    case "pictograph":
      return (
        <div className="mt-4">
          <PictographDiagram segments={diagram.segments} unitsPerIcon={diagram.unitsPerIcon} />
        </div>
      );
    case "line_pair":
      return (
        <div className="mt-4">
          <LinePairDiagram relationship={diagram.relationship} angleDeg={diagram.angleDeg} />
        </div>
      );
    case "coordinate_grid":
      return (
        <div className="mt-4">
          <CoordinateGridDiagram x={diagram.x} y={diagram.y} gridSize={diagram.gridSize} />
        </div>
      );
    case "vertical_arithmetic":
      return (
        <div className="mt-4 flex justify-center">
          <VerticalArithmetic operands={diagram.operands} operator={diagram.operator} result={diagram.result} prefix={diagram.prefix} />
        </div>
      );
    case "long_multiplication":
      return (
        <div className="mt-4 flex justify-center">
          <LongMultiplicationDiagram multiplicand={diagram.multiplicand} multiplier={diagram.multiplier} result={diagram.result} />
        </div>
      );
    case "straight_line_angles":
      return (
        <div className="mt-4">
          <StraightLineAnglesDiagram angleA={diagram.angleA} />
        </div>
      );
    case "triangle_angles":
      return (
        <div className="mt-4">
          <TriangleAnglesDiagram angleA={diagram.angleA} angleB={diagram.angleB} />
        </div>
      );
    case "two_rectangles":
      return (
        <div className="mt-4">
          <TwoRectanglesDiagram a={diagram.a} b={diagram.b} />
        </div>
      );
    case "notched_rectangle":
      return (
        <div className="mt-4">
          <NotchedRectangleDiagram
            outerWidth={diagram.outerWidth}
            outerHeight={diagram.outerHeight}
            notchWidth={diagram.notchWidth}
            notchHeight={diagram.notchHeight}
          />
        </div>
      );
    case "long_division":
      return (
        <div className="mt-4 flex justify-center">
          <LongDivisionDiagram dividend={diagram.dividend} divisor={diagram.divisor} />
        </div>
      );
    case "rectangle":
      return (
        <div className="mt-4">
          <RectangleDiagram width={diagram.width} height={diagram.height} unit={diagram.unit} />
        </div>
      );
    case "two_point_grid":
      return (
        <div className="mt-4">
          <TwoPointGridDiagram x1={diagram.x1} y1={diagram.y1} x2={diagram.x2} y2={diagram.y2} gridSize={diagram.gridSize} />
        </div>
      );
    case "regular_polygon":
      return (
        <div className="mt-4">
          <RegularPolygonDiagram sides={diagram.sides} eachAngle={diagram.eachAngle} />
        </div>
      );
    case "cuboid":
      return (
        <div className="mt-4">
          <CuboidDiagram length={diagram.length} width={diagram.width} height={diagram.height} unit={diagram.unit} />
        </div>
      );
    case "two_cuboids":
      return (
        <div className="mt-4">
          <TwoCuboidsDiagram a={diagram.a} b={diagram.b} />
        </div>
      );
    default:
      return null;
  }
}
