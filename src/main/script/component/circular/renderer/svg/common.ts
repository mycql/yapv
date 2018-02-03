import { Coord, DefaultArcObject } from '../../../models';
import { toCartesianCoords } from '../../../util';

export type Positioned = { start: Coord; end: Coord; };

export function arcEndsCoords(radius: number, startAngle: number, endAngle: number): Positioned {
  const centerX = 0;
  const centerY = 0;
  return {
    start: toCartesianCoords(centerX, centerY, radius, startAngle),
    end: toCartesianCoords(centerX, centerY, radius, endAngle),
  };
}

export function arcAsDonutPaths(arc: DefaultArcObject,
                                startAngle: number = 2 * Math.PI,
                                endAngle: number = 0): string[] {
  const { innerRadius, outerRadius } = arc;
  const innerRing: Positioned = arcEndsCoords(innerRadius, startAngle, endAngle);
  const outerRing: Positioned = arcEndsCoords(outerRadius, startAngle, endAngle);
  const paths = [
    `M ${outerRing.start.x} ${outerRing.start.y}`,
    `A ${outerRadius} ${outerRadius} 0 1 0 ${outerRing.end.x} ${outerRing.end.y}`,
    `M ${innerRing.start.x} ${innerRing.start.y}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${innerRing.end.x} ${innerRing.end.y}`,
  ];
  return paths;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2);
}
