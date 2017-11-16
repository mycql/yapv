import { ComponentRenderer } from '../../../models';
import { arc, pathDraw } from '../../../util';
import { TrackRenderModel } from '../../mapper/track';

type Renderer = ComponentRenderer<TrackRenderModel, CanvasRenderingContext2D, boolean>;
const TrackRenderer: Renderer = (params: TrackRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { annulus, style }: TrackRenderModel = params;
  context.beginPath();
  arc(context, annulus);
  context.closePath();
  pathDraw(context, style);
  return Promise.resolve(true);
};

export default TrackRenderer;