import { Coord, DefaultArcObject } from '../../../models';
import { toCartesianCoords } from '../../../util';

type Positioned = { start: Coord; end: Coord; };

function toRing(radius: number): Positioned {
  const centerX = 0;
  const centerY = 0;
  return {
    start: toCartesianCoords(centerX, centerY, radius, 2 * Math.PI),
    end: toCartesianCoords(centerX, centerY, radius, 0),
  };
}

export function arcAsDonutPath(arc: DefaultArcObject): string {
  const { innerRadius, outerRadius } = arc;
  const innerRing: Positioned = toRing(innerRadius);
  const outerRing: Positioned = toRing(outerRadius);
  const path = [
    `M ${innerRing.start.x} ${innerRing.start.y}`,
    `A ${innerRadius} ${innerRadius} 0 1 0 ${innerRing.end.x} ${innerRing.end.y}`,
    `M ${outerRing.start.x} ${outerRing.start.y}`,
    `A ${outerRadius} ${outerRadius} 0 1 0 ${outerRing.end.x} ${outerRing.end.y}`,
  ].join(' ');
  return path;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2);
}
