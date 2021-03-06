import { CSSProperties, ReactNode } from 'react';
import { ComponentMaker, H, Positioned } from './types';
import { Coord } from '../core/models/types';
import { Marker as MarkerBase, MarkerRenderModel } from '../core/transformer/circular/types';
import { PI } from '../core/models';
import { toCamelCaseKeys } from '../core/util';
import { arcEndsCoords, resolveChildNodes } from './common';

function anchorPaths(coords: Coord[], isBeginning: boolean): string[] {
  return coords.map((coord: Coord, index: number) => {
    const command: string = index === 0 && isBeginning ? 'M' : 'L';
    return `${command} ${coord.x} ${coord.y}`;
  });
}

const createRenderer: ComponentMaker<MarkerRenderModel> = (h: H) => {
  return (params: MarkerRenderModel, children: ReactNode[]) => {
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
    const attrs = {
      d: path,
      style: cssProps,
    };
    // why an additional 'attrs' property? well, we
    // have Vue's not so portable 'h' implementation
    // to thank for that
    // also, Vue expects child elements to come in
    // the form of array, so there you go
    return (
      <g>
        {
          [
            <g>
              {
                [
                  <path {...{...attrs, attrs: { ...attrs}}}></path>,
                ]
              }
            </g>,
            <g>
              {children}
            </g>,
          ]
        }
      </g>
    );
  };
};

export type Marker = {
  children?: ReactNode | ReactNode[];
} & MarkerBase;
export type MarkerComponentMaker = ComponentMaker<Marker>;
export const MarkerComponent: MarkerComponentMaker = (h: H) => {
  const render = createRenderer(h);
  return (props: Marker, children: ReactNode[]) => {
    const { layout } = props;
    const { scale } = layout;
    const params = layout.marker(props, scale);
    const actualChildren: ReactNode[] = resolveChildNodes(props.children || children);
    return render(params, actualChildren);
  };
};
