import { ComponentRenderer, Coord, Location } from '../../../models';
import { pathDraw } from '../../../util';
import { MarkerRenderModel } from '../../mapper/marker';

type Renderer = ComponentRenderer<MarkerRenderModel, CanvasRenderingContext2D, boolean>;
const MarkerRenderer: Renderer = (params: MarkerRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { center, style, anchorPositions, radii, anglesInRadians}: MarkerRenderModel = params;
  const { start: arcStart, end: arcEnd }: Location = anglesInRadians;
  context.beginPath();
  anchorPositions.start.forEach((coord: Coord) => {
    context.lineTo(coord.x, coord.y);
    context.arc(center.x, center.y, radii.inner, arcStart, arcEnd);
  });
  anchorPositions.end.forEach((coord: Coord) => {
    context.lineTo(coord.x, coord.y);
    context.arc(center.x, center.y, radii.outer, arcEnd, arcStart, true);
  });
  pathDraw(context, style);
  return Promise.resolve(true);
};

export default MarkerRenderer;