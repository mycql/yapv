import { CSSProperties, ReactNode } from 'react';
import core from './core';
import { arcEndsCoords, Positioned } from './common';
import { MarkerRenderModel } from '../core/transformer/circular/types';
import { Coord, PI } from '../core/models';
import { toCamelCaseKeys } from '../core/util';

const { h } = core;

function anchorPaths(coords: Coord[], isBeginning: boolean): string[] {
  return coords.map((coord: Coord, index: number) => {
    const command: string = index === 0 && isBeginning ? 'M' : 'L';
    return `${command} ${coord.x} ${coord.y}`;
  });
}

export const Marker = (params: MarkerRenderModel, children: ReactNode[]) => {
  const { style, anchorPositions, radii, anglesInRadians} = params;
  const { start: startAngle, end: endAngle } = anglesInRadians;
  const { inner: innerRadius, outer: outerRadius } = radii;

  const markerStyle = {...style, ...{ 'fill-rule' : 'evenodd' }};
  const cssProps: CSSProperties = toCamelCaseKeys(markerStyle);
  const crossesOver: boolean = startAngle > endAngle;
  const arcLength: number = crossesOver ? (PI.TWICE - startAngle) + endAngle : endAngle - startAngle;
  const largeArcFlag: number = arcLength > PI.WHOLE ? 1 : 0;

  const innerRing: Positioned = arcEndsCoords(innerRadius, startAngle, endAngle);
  const outerRing: Positioned = arcEndsCoords(outerRadius, endAngle, startAngle);
  const paths = [
    ...anchorPaths(anchorPositions.start, true),
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerRing.end.x} ${innerRing.end.y}`,
    ...anchorPaths(anchorPositions.end, false),
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerRing.end.x} ${outerRing.end.y}`,
  ];

  const path: string = paths.join(' ');
  return (
    <g>
      <g>
        <path d={path} style={cssProps}></path>
      </g>
      <g>
        {children}
      </g>
    </g>
  );
};
