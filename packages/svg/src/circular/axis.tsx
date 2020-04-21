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
      const attrs = {
        d: path,
        style: cssProps,
      };
      // why an additional 'attrs' property? well, we
      // have Vue's not so portable 'h' implementation
      // to thank for that
      return (
        <path {...{...attrs, attrs: { ...attrs}}}></path>
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
              {scalePaths}
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
