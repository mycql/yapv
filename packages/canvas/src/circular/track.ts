import { ComponentRenderer } from '../core/models/types';
import { TrackRenderModel } from '../core/transformer/circular/types';
import { donut, pathDraw } from './common';

type Renderer = ComponentRenderer<TrackRenderModel, CanvasRenderingContext2D, boolean>;
const TrackRenderer: Renderer = (params: TrackRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { annulus, style }: TrackRenderModel = params;
  context.beginPath();
  donut(context, annulus);
  context.closePath();
  pathDraw(context, style);
  return Promise.resolve(true);
};

export default TrackRenderer;
