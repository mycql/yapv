import { ScaleLinear } from 'd3-scale';
import {
  DisplayConfig,
  Renderable,
  LabelType,
  LabelTypes,
  Label,
  LabelDisplayConfig,
  Line,
  Location,
  Coord,
  StringKeyValMap,
} from '../models';
import {
  normalizeToCanvas,
  toCartesianCoords,
  angleRadInBetweenSides,
  parseStyle,
  updateContextStyle,
  pathDraw,
} from '../util';

const defaultStyle: string = 'stroke: black; fill: black; font: 10px "Courier New", monospace;';

type DrawTextParams = {
  radius: number;
  location: Location;
  content: string;
  style: string;
  center: Coord;
  offset: Coord;
  line: boolean | Line;
  scale: ScaleLinear<number, number>;
  context: CanvasRenderingContext2D;
};

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

function drawLine(params: DrawTextParams, to: Coord, lineRad: number, arcMidRad: number): void {
  const { radius, style, center, line, context}: DrawTextParams = params;
  context.save();
  const useDefaultLine: boolean = typeof line === 'boolean' && line === true;
  const useCustomLine: boolean = typeof line === 'object';
  let lineStyle: string = style;
  context.beginPath();
  if (useDefaultLine) {
    const from: Coord = toCartesianCoords(center.x, center.y, radius, lineRad);
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
  } else if (useCustomLine) {
    const lineModel: Line = line as Line;
    const lineConfig: DisplayConfig = lineModel.displayConfig;
    if (lineConfig && lineConfig.style) {
      lineStyle = lineConfig.style;
    }
    const from: Coord = toCartesianCoords(center.x, center.y,
      radius, normalizeToCanvas(arcMidRad));
    context.moveTo(from.x, from.y);
    (lineModel.coords || []).forEach((lineOffset: Coord) => {
      context.lineTo(from.x + lineOffset.x, from.y + lineOffset.y);
    });
    context.lineTo(to.x, to.y);
  }
  context.restore();
  pathDraw(context, lineStyle, false);
}

function drawTextAlongArc(params: DrawTextParams): void {
  const { radius, location, content, style,
    center, offset, line, scale, context}: DrawTextParams = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
  const letterSpacing: number = parseInt(styleObj['letter-spacing'] || '0', 10);
  const hasStroke: boolean = typeof styleObj['stroke'] === 'string';
  const hasfill: boolean = typeof styleObj['fill'] === 'string';
  const labelRadius: number = radius + offset.y;
  // we need to update the context stye so we can measure the text properly
  context.save();
  updateContextStyle(context, styleObj, resolveStyle);
  const textMetrics: TextMetrics = context.measureText(content);
  const textWidth: number = textMetrics.width + ((content.length - 1) * letterSpacing);
  const textArcRad: number = angleRadInBetweenSides(radius, radius, textWidth);
  const textArcRadHalf: number = textArcRad / 2;
  const widthPerChar: number = textWidth / content.length;
  const rotateAngle: number = widthPerChar / radius;
  let angleRad: number = arcStartRad;
  switch (alignment) {
    case 'left':
      angleRad = arcStartRad;
      break;
    case 'right':
      angleRad = arcEndRad - textArcRad;
      break;
    case 'center':
    default:
      angleRad = arcMidRad - textArcRadHalf;
      break;
  }
  angleRad = angleRad + angleRadInBetweenSides(radius, radius, offset.x);
  const normAngleRad: number = normalizeToCanvas(angleRad);
  const coord: Coord = toCartesianCoords(center.x, center.y, labelRadius, normAngleRad);
  const { x, y }: Coord = coord;

  context.save();
  content.split('').forEach((symbol: string) => {
    context.rotate(rotateAngle);
    context.save();
    context.translate(x, y);
    context.rotate(angleRad);
    if (hasfill) {
      context.fillText(symbol, 0, 0);
    }
    if (hasStroke) {
      context.strokeText(symbol, 0, 0);
    }
    context.restore();
  });
  context.restore();
  context.restore();

  if (!line) {
    return;
  }
  const lineRad: number = normAngleRad + textArcRadHalf;
  const to: Coord = toCartesianCoords(center.x, center.y, labelRadius, lineRad);
  drawLine(params, to, lineRad, arcMidRad);
}

function drawTextAlongAxis(params: DrawTextParams): void {
  const { radius, location, content, style,
    center, offset, line, scale, context}: DrawTextParams = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
  const hasStroke: boolean = typeof styleObj['stroke'] === 'string';
  const hasfill: boolean = typeof styleObj['fill'] === 'string';
  let angleRad: number = 0;
  switch (alignment) {
    case 'left':
      angleRad = arcStartRad;
      break;
    case 'right':
      angleRad = arcEndRad;
      break;
    case 'center':
    default:
      angleRad = arcMidRad;
      break;
  }
  const normAngleRad: number = normalizeToCanvas(angleRad);
  const coord: Coord = toCartesianCoords(center.x, center.y, radius, normAngleRad);
  const x: number = coord.x + offset.x;
  const y: number = coord.y + offset.y;

  context.save();
  updateContextStyle(context, styleObj, resolveStyle);
  context.save();
  context.translate(x, y);
  if (hasfill) {
    context.fillText(content, 0, 0);
  }
  if (hasStroke) {
    context.strokeText(content, 0, 0);
  }
  context.restore();
  context.restore();

  if (!line) {
    return;
  }

  const lineRad: number = normalizeToCanvas(arcMidRad);
  const to: Coord = { x, y };
  drawLine(params, to, lineRad, arcMidRad);
}

export class LabelComponent implements Renderable<Label, LabelDisplayConfig, boolean> {

  public render(model: Label, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    const content: string = model.text;
    const displayConfig: LabelDisplayConfig = model.displayConfig;
    const center: Coord = { x: 0, y: 0 };
    const offset: Coord = { x: displayConfig.hOffset || 0, y: displayConfig.vOffset || 0 };
    const style: string = displayConfig.style || defaultStyle;
    const location: Location = model.location;
    const type: LabelType = displayConfig.type || LabelTypes.PATH;
    const radius: number = displayConfig.distance;
    const line: boolean | Line = model.line as boolean | Line;
    const drawParams: DrawTextParams = {
      center, content, context, line, location,
      offset, radius, scale, style,
    };

    switch (type) {
      case LabelTypes.PATH:
        drawTextAlongArc(drawParams);
        break;
      case LabelTypes.TEXT:
      default:
        drawTextAlongAxis(drawParams);
        break;
    }

    return Promise.resolve(true);
  }

}

export default new LabelComponent().render;
