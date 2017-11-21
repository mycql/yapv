import { ComponentRenderer, DefaultArcObject } from '../../../models';
import { arc, pathDraw } from '../../../util';
import { AxisRenderModel, AnnulusRenderModel, ScaleRenderModel } from '../../mapper/axis';

function drawAxis(params: AnnulusRenderModel, context: CanvasRenderingContext2D): void {
  const { annulus, style }: AnnulusRenderModel = params;
  context.beginPath();
  arc(context, annulus);
  context.closePath();
  pathDraw(context, style);
}

function drawScales(params: ScaleRenderModel, context: CanvasRenderingContext2D): void {
  const { style, ticks }: ScaleRenderModel = params;
  ticks.forEach((tick: DefaultArcObject) => {
    context.beginPath();
    arc(context, tick);
    context.closePath();
    pathDraw(context, style);
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
