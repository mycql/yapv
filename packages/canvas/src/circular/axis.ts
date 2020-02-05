import { ComponentRenderer, Coord } from '../../../core/src/models';
import * as Transformer from '../../../core/src/transformer/circular/types';
import { donut, pathDraw } from './common';

function drawAxis(params: Transformer.AnnulusRenderModel, context: CanvasRenderingContext2D): void {
  const { annulus, style }: Transformer.AnnulusRenderModel = params;
  context.beginPath();
  donut(context, annulus);
  context.closePath();
  pathDraw(context, style);
}

function drawScales(params: Transformer.ScaleRenderModel, context: CanvasRenderingContext2D): void {
  const { style, ticks }: Transformer.ScaleRenderModel = params;
  ticks.forEach((coords: Transformer.TickRenderModel) => {
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

type Renderer = ComponentRenderer<Transformer.AxisRenderModel, CanvasRenderingContext2D, boolean>;
const AxisRenderer: Renderer = (params: Transformer.AxisRenderModel,
                                context: CanvasRenderingContext2D): Promise<boolean> => {
  drawAxis(params.axis, context);
  params.scales.forEach((scaleParams: Transformer.ScaleRenderModel) =>
    drawScales(scaleParams, context));
  return Promise.resolve(true);
};

export default AxisRenderer;
