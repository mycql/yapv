import { ReactNode } from 'react';
import { ComponentMaker, H } from './types';
import { VectorMap as VectorMapBase, ViewDisplayConfig } from '../core/models/types';

import { resolveChildNodes } from './common';

const createRenderer: ComponentMaker<ViewDisplayConfig> = (h: H) => {
  return (params: ViewDisplayConfig, children: ReactNode[]) => {
    const { width, height } = params;
    const { width: viewWidth, height: viewHeight } = params.viewBox;
    const transform: string = `translate(${viewWidth / 2}, ${viewHeight / 2})`;
    const attrs = {
      height,
      width,
      'viewBox': `0 0 ${viewWidth} ${viewHeight}`,
      'preserveAspectRatio': 'xMidYMid meet',
      'shape-rendering': 'geometricPrecision ',
      'text-rendering': 'optimizeLegibility',
      'version': '1.1',
      'xmlns': 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    };
    const gAttrs = {
      transform,
    };
    // why an additional 'attrs' property? well, we
    // have Vue's not so portable 'h' implementation
    // to thank for that.
    // also, Vue expects child elements to come in
    // the form of array, so there you go
    return (
      <svg {...{...attrs, attrs: { ...attrs}}}>
        {
          [
            <g {...{...gAttrs, attrs: { ...gAttrs}}}>
              {children}
            </g>,
          ]
        }
      </svg>
    );
  };
};

export type VectorMap = {
  children?: ReactNode | ReactNode[];
} & VectorMapBase;
export type PlasmidMapComponentMaker = ComponentMaker<VectorMap>;
export const PlasmidMapComponent: PlasmidMapComponentMaker = (h: H) => {
  const render = createRenderer(h);
  return (props: VectorMap, children: ReactNode[]) => {
    const { displayConfig } = props;
    const actualChildren: ReactNode[] = resolveChildNodes(props.children || children);
    return render(displayConfig, actualChildren);
  };
};
