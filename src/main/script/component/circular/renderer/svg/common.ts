import { Coord, DefaultArcObject, PI } from '../../../models';
import { toCartesianCoords } from '../../../util';

export type Quadrant = {
  start: number;
  end: number;
};

export const Quadrants: {
  FIRST: Quadrant;
  SECOND: Quadrant;
  THIRD: Quadrant;
  FOURTH: Quadrant;
  from: (angle: number) => Quadrant;
  same: (angle1: number, angle2: number) => boolean;
} = {
  FIRST: {
    start: 0,
    end: PI.HALF,
  },
  SECOND: {
    start: PI.HALF,
    end: PI.WHOLE,
  },
  THIRD: {
    start: PI.WHOLE,
    end: PI.WHOLE + PI.HALF,
  },
  FOURTH: {
    start: PI.WHOLE + PI.HALF,
    end: PI.TWICE,
  },
  from: (angle: number) => {
    let found: Quadrant = Quadrants.FIRST;
    for (const key in Quadrants) {
      if (Quadrants[key]) {
        const value: Quadrant = Quadrants[key];
        const inside: boolean = angle >= value.start && angle < value.end;
        if (inside) {
          found = value;
        }
      }
    }
    return found;
  },
  same: (angle1: number, angle2: number) => {
    return Quadrants.from(angle1) === Quadrants.from(angle2);
  },
};

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
                                startAngle: number = PI.TWICE,
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
