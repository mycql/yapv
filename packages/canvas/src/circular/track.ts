import { ComponentRenderer } from './types';
import { Track, TrackRenderModel } from '../core/transformer/circular/types';
import { donut, pathDraw } from './common';

type Renderer = ComponentRenderer<TrackRenderModel, CanvasRenderingContext2D, boolean>;
const doRender: Renderer = (params: TrackRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { annulus, style }: TrackRenderModel = params;
  context.beginPath();
  donut(context, annulus);
  context.closePath();
  pathDraw(context, style);
  return Promise.resolve(true);
};

type Render = ComponentRenderer<Track, CanvasRenderingContext2D, boolean>;
export const render: Render = (props: Track, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { layout, range } = props;
  const { scale } = layout;
  const params: TrackRenderModel = layout.track(props, scale, range);
  return doRender(params, context);
};
