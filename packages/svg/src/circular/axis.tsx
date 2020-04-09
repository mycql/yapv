import { CSSProperties, ReactNode } from 'react';
import { ComponentMaker, H } from './types';
import { Coord } from '../core/models/types';
import { Axis as AxisBase, AxisRenderModel, ScaleRenderModel, TickRenderModel } from '../core/transformer/circular/types';
import { arcAsDonutPaths, resolveChildNodes } from './common';
import { toCamelCaseKeys } from '../core/util';

function scalesAsPaths(h: H) {
  return (scale: ScaleRenderModel): JSX.Element => {
    const scaleStyle = {...scale.style, ...{ 'fill-rule' : 'evenodd' }};
    const cssProps: CSSProperties = toCamelCaseKeys(scaleStyle);
    const scalePaths = scale.ticks.map((coords: TickRenderModel) => {
      const from: Coord = coords[0];
      const to: Coord = coords[1];
      const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
      return (
        <path d={path} style={cssProps}></path>
      );
    });
    return (
      <g>{scalePaths}</g>
    );
  };
}

const createRenderer: ComponentMaker<AxisRenderModel> = (h: H) => {
  return (params: AxisRenderModel, children: ReactNode[]) => {
    const { axis, scales } = params;
    const axisStyle = {...axis.style, ...{ 'fill-rule' : 'evenodd' }};
    const cssProps: CSSProperties = toCamelCaseKeys(axisStyle);
    const path = arcAsDonutPaths(axis.annulus).join(' ');
    const scalePaths = scales.map(scalesAsPaths(h));
    return (
      <g>
        <g>
          <path d={path} style={cssProps}></path>
        </g>
        <g>
          {scalePaths}
        </g>
        <g>
          {children}
        </g>
      </g>
    );
  };
};

export type Axis = {
  children?: ReactNode | ReactNode[];
} & AxisBase;
export type AxisComponentMaker = ComponentMaker<Axis> ;
export const AxisComponent: AxisComponentMaker = (h: H) => {
  const render = createRenderer(h);
  return (props: Axis, children: ReactNode[]) => {
    const { layout } = props;
    const { scale } = layout;
    const params = layout.axis(props, scale);
    const actualChildren: ReactNode[] = resolveChildNodes(props.children || children);
    return render(params, actualChildren);
  };
};
