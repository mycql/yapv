import { Coord, LabelType } from '../core/models/types';
import { ComponentRenderer } from './types';
import { ConnectorRenderModel, Label, LabelRenderModel, TextRenderModel } from '../core/transformer/circular/types';
import { LabelTypes, PI } from '../core/models';
import { canvasContextTextMeasurer, resolveTextStyle, textContentWidth, updateContextStyle, withAxisOffset } from '../core/util';

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
const doRender: Renderer = (params: LabelRenderModel,
                            context: CanvasRenderingContext2D): Promise<boolean> => {
  const drawLabel: RenderLabel = [params.type].map((type: LabelType) =>
    type === LabelTypes.PATH ? drawTextAlongArc : drawTextAlongAxis)[0];
  drawLabel(params.label, context);
  if (params.connector) {
    drawLine(params.connector, context);
  }
  return Promise.resolve(true);
};

type Render = ComponentRenderer<Label, CanvasRenderingContext2D, boolean>;
export const render: Render = (props: Label, context: CanvasRenderingContext2D): Promise<boolean> => {
  const { layout, canvasContext } = props;
  const { scale } = layout;
  const params = layout.label(props, scale, canvasContextTextMeasurer(canvasContext()));
  return doRender(params, context);
};
