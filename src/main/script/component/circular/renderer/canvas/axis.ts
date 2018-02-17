import { ComponentRenderer, Coord } from '../../../models';
import { AxisRenderModel, AnnulusRenderModel, ScaleRenderModel, TickRenderModel } from '../../transformer/axis';
import { donut, pathDraw } from './common';

function drawAxis(params: AnnulusRenderModel, context: CanvasRenderingContext2D): void {
  const { annulus, style }: AnnulusRenderModel = params;
  context.beginPath();
  donut(context, annulus);
  context.closePath();
  pathDraw(context, style);
}

function drawScales(params: ScaleRenderModel, context: CanvasRenderingContext2D): void {
  const { style, ticks }: ScaleRenderModel = params;
  ticks.forEach((coords: TickRenderModel) => {
    context.beginPath();
    coords.forEach((coord: Coord, index: number) => {
      if (index === 0) {
        context.moveTo(coord.x, coord.y);
      } else {
        context.lineTo(coord.x, coord.y);
      }
    });
    context.closePath();
    pathDraw(context, style, false);
  });
}

type Renderer = ComponentRenderer<AxisRenderModel, CanvasRenderingContext2D, boolean>;
const AxisRenderer: Renderer = (params: AxisRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  drawAxis(params.axis, context);
  params.scales.forEach((scaleParams: ScaleRenderModel) =>
    drawScales(scaleParams, context));
  return Promise.resolve(true);
};

export default AxisRenderer;
