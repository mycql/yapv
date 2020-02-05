import {
  ComponentRenderer,
  Coord,
  LabelType,
  LabelTypes,
  PI,
} from '../../../core/src/models';
import {
  resolveTextStyle,
  textContentWidth,
  updateContextStyle,
  withAxisOffset,
} from '../../../core/src/util';
import {
  ConnectorRenderModel,
  LabelRenderModel,
  TextRenderModel,
} from '../../../core/src/transformer/circular/types';

import { pathDraw } from './common';

type RenderLabel = (params: TextRenderModel, context: CanvasRenderingContext2D) => void;

function drawLine(params: ConnectorRenderModel, context: CanvasRenderingContext2D): void {
  context.save();
  context.beginPath();
  context.moveTo(params.from.x, params.from.y);
  params.to.forEach((to: Coord) => {
    context.lineTo(to.x, to.y);
  });
  context.restore();
  pathDraw(context, params.style, false);
}

function drawTextAlongArc(params: TextRenderModel, context: CanvasRenderingContext2D): void {
  const { content, anglesInRadians: angles, position, style }: TextRenderModel = params;
  const hasStroke: boolean = typeof style['stroke'] === 'string';
  const hasfill: boolean = typeof style['fill'] === 'string';
  context.save();
  updateContextStyle(context, style, resolveTextStyle);
  if (angles) {
    content.split('').forEach((symbol: string) => {
      context.rotate(angles.rotation);
      context.save();
      context.translate(position.x, position.y);
      context.rotate(angles.path.start + withAxisOffset(PI.WHOLE));
      if (hasfill) {
        context.fillText(symbol, 0, 0);
      }
      if (hasStroke) {
        context.strokeText(symbol, 0, 0);
      }
      context.restore();
    });
  }
  context.restore();
}

function drawTextAlongAxis(params: TextRenderModel, context: CanvasRenderingContext2D): void {
  type DrawText = (text: string, x: number, y: number, maxWidth?: number) => void;
  const { content, position, style, charInfo }: TextRenderModel = params;
  if (!charInfo) {
    return;
  }
  const { widths, space } = charInfo;
  const hasStroke: boolean = typeof style['stroke'] === 'string';
  const hasfill: boolean = typeof style['fill'] === 'string';
  if (!hasStroke && !hasfill) {
    return;
  }
  const drawTextFn: DrawText = hasStroke ? context.strokeText : context.fillText;
  context.save();
  updateContextStyle(context, style, resolveTextStyle);
  if (space > 0) {
    const symbols: string[] = content.split('');
    const textWidth: number = textContentWidth(symbols, charInfo);
    const xOffset: number = -(textWidth / 2);
    context.translate(position.x + xOffset, position.y);
    symbols.reduce((prevCharX: number, symbol: string, index: number) => {
      prevCharX = index !== 0 ? prevCharX + widths[symbols[index - 1]] + space : 0;
      drawTextFn.call(context, symbol, prevCharX, 0);
      return prevCharX;
    }, 0);
  } else {
    context.translate(position.x, position.y);
    drawTextFn.call(context, content, 0, 0);
  }
  context.restore();
}

type Renderer = ComponentRenderer<LabelRenderModel, CanvasRenderingContext2D, boolean>;
const LabelRenderer: Renderer = (params: LabelRenderModel, context: CanvasRenderingContext2D): Promise<boolean> => {
  const drawLabel: RenderLabel = [params.type].map((type: LabelType) =>
    type === LabelTypes.PATH ? drawTextAlongArc : drawTextAlongAxis)[0];
  drawLabel(params.label, context);
  if (params.connector) {
    drawLine(params.connector, context);
  }
  return Promise.resolve(true);
};

export default LabelRenderer;
