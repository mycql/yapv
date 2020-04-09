import { CSSProperties, ReactNode } from 'react';
import { ComponentMaker, H } from './types';
import { Track as TrackBase, TrackRenderModel } from '../core/transformer/circular/types';

import { arcAsDonutPaths, resolveChildNodes } from './common';
import { toCamelCaseKeys } from '../core/util';

const createRenderer: ComponentMaker<TrackRenderModel> = (h: H) => {
  return (params: TrackRenderModel, children: ReactNode[]) => {
    const trackStyle = {...params.style, ...{ 'fill-rule': 'evenodd' }};
    const cssProps: CSSProperties = toCamelCaseKeys(trackStyle);
    const path = arcAsDonutPaths(params.annulus).join(' ');
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
};

export type Track = {
  children?: ReactNode | ReactNode[];
} & TrackBase;
export type TrackComponentMaker = ComponentMaker<Track>;
export const TrackComponent: TrackComponentMaker = (h: H) => {
  const render = createRenderer(h);
  return (props: Track, children: ReactNode[]) => {
    const { layout, range } = props;
    const { scale } = layout;
    const params: TrackRenderModel = layout.track(props, scale, range);
    const actualChildren: ReactNode[] = resolveChildNodes(props.children || children);
    return render(params, actualChildren);
  };
};
