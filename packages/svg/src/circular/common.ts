import { ReactNode } from 'react';
import { Coord, DefaultArcObject } from '../core/models/types';
import { Positioned } from './types';
import { PI } from '../core/models';
import { toCartesianCoords } from '../core/util';

export function arcEndsCoords(radius: number, startAngle: number, endAngle: number): Positioned {
  const center: Coord = { x: 0, y: 0 };
  return {
    start: toCartesianCoords(center, radius, startAngle),
    end: toCartesianCoords(center, radius, endAngle),
  };
}

export function arcAsDonutPaths(arc: DefaultArcObject,
                                startAngle: number = PI.TWICE,
                                endAngle: number = 0): string[] {
  const { radii } = arc;
  const { inner: innerRadius, outer: outerRadius } = radii;
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

export function isEmpty(obj: any): boolean {
  for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        return false;
      }
  }
  return true;
}

export function resolveChildNodes(children?: ReactNode | ReactNode[]): ReactNode[] {
  let actualChildren: ReactNode[];
  if (!Array.isArray(children)) {
    if (isEmpty(children)) {
      actualChildren = [];
    } else {
      actualChildren = [children];
    }
  } else {
    actualChildren = children;
  }
  return actualChildren;
}
