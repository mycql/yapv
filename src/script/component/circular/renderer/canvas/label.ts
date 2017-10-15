import {
  RenderParams,
  LabelRenderParams,
  ConnectorRenderParams
} from '../../mapper/label';
import {
  ComponentRenderer,
  Coord,
  LabelType,
  LabelTypes
} from '../../../models';
import {
  updateContextStyle,
  pathDraw
} from '../../../util';

type RenderLabel = (params: LabelRenderParams, context: CanvasRenderingContext2D) => void;

function resolveStyle(styleProp: string, styleVal: string, context: CanvasRenderingContext2D): void {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  switch (styleProp) {
    case 'font':
      context.font = styleVal;
      break;
    default:
      break;
  }
}

function drawLine(params: ConnectorRenderParams, context: CanvasRenderingContext2D): void {
  context.save();
  context.beginPath();
  context.moveTo(params.from.x, params.from.y);
  params.to.forEach((to: Coord) => {
    context.lineTo(to.x, to.y);
  });
  context.restore();
  pathDraw(context, params.style, false);
}

function drawTextAlongArc(params: LabelRenderParams, context: CanvasRenderingContext2D): void {
  const { content, anglesInRadians: angles, position, style }: LabelRenderParams = params;
  const hasStroke: boolean = typeof style['stroke'] === 'string';
  const hasfill: boolean = typeof style['fill'] === 'string';
  context.save();
  updateContextStyle(context, style, resolveStyle);
  content.split('').forEach((symbol: string) => {
    context.rotate(angles.rotation);
    context.save();
    context.translate(position.x, position.y);
    context.rotate(angles.path);
    if (hasfill) {
      context.fillText(symbol, 0, 0);
    }
    if (hasStroke) {
      context.strokeText(symbol, 0, 0);
    }
    context.restore();
  });
  context.restore();
}

function drawTextAlongAxis(params: LabelRenderParams, context: CanvasRenderingContext2D): void {
  const { content, position, style }: LabelRenderParams = params;
  const hasStroke: boolean = typeof style['stroke'] === 'string';
  const hasfill: boolean = typeof style['fill'] === 'string';
  context.save();
  updateContextStyle(context, style, resolveStyle);
  context.translate(position.x, position.y);
  if (hasfill) {
    context.fillText(content, 0, 0);
  }
  if (hasStroke) {
    context.strokeText(content, 0, 0);
  }
  context.restore();
}

export class LabelRenderer implements ComponentRenderer<RenderParams, CanvasRenderingContext2D, boolean> {
  public render(params: RenderParams, context: CanvasRenderingContext2D): Promise<boolean> {
    const drawLabel: RenderLabel = [params.type].map((type: LabelType) =>
      type === LabelTypes.PATH ? drawTextAlongArc : drawTextAlongAxis)[0];
    drawLabel(params.label, context);
    if (params.connector) {
      drawLine(params.connector, context);
    }
    return Promise.resolve(true);
  }
}