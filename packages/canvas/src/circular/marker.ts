import { ComponentRenderer, Coord, Location } from '../../../core/src/models';
import { MarkerRenderModel } from '../../../core/src/transformer/circular/types';
import { pathDraw } from './common';

function drawLine(context: CanvasRenderingContext2D): (coord: Coord) => void {
  return (coord: Coord) => {
    context.lineTo(coord.x, coord.y);
  };
}

type Renderer = ComponentRenderer<MarkerRenderModel, CanvasRenderingContext2D, boolean>;
const MarkerRenderer: Renderer = (params: MarkerRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { center, style, anchorPositions, radii, anglesInRadians}: MarkerRenderModel = params;
  const { start: arcStart, end: arcEnd }: Location = anglesInRadians;
  context.beginPath();
  anchorPositions.start.forEach(drawLine(context));
  context.arc(center.x, center.y, radii.inner, arcStart, arcEnd);
  anchorPositions.end.forEach(drawLine(context));
  context.arc(center.x, center.y, radii.outer, arcEnd, arcStart, true);
  pathDraw(context, style);
  return Promise.resolve(true);
};

export default MarkerRenderer;
