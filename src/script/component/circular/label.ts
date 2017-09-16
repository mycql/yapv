import { ScaleLinear } from 'd3-scale';
import {
  Renderable,
  LabelType,
  LabelTypes,
  Label,
  LabelDisplayConfig,
  Location,
  Coord
} from '../models';
import {
  StringKeyValMap,
  normalizeToCanvas,
  toCartesianCoords,
  angleRadInBetweenSides,
  updateContextStyle,
} from '../util';

const defaultStyle: string = 'stroke: black; fill: black; font: 10px "Courier New", monospace;';

type DrawTextParams = {
  radius: number;
  location: Location;
  content: string;
  styleObj: StringKeyValMap;
  center: Coord;
  offset: Coord;
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

function drawTextAlongArc(params: DrawTextParams): void {
  const { radius, location, content, styleObj,
          center, offset, scale, context}: DrawTextParams = params;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcLengthRad: number = Math.abs(arcEndRad - arcStartRad);
  const alignment: string = styleObj['text-align'] || 'center';
  const letterSpacing: number = parseInt(styleObj['letter-spacing'] || '0');
  const hasStroke: boolean = typeof styleObj['stroke'] === 'string';
  const hasfill: boolean = typeof styleObj['fill'] === 'string';
  const textMetrics: TextMetrics = context.measureText(content);
  const textWidth: number = textMetrics.width + ((content.length - 1) * letterSpacing);
  const widthPerChar: number = textWidth / content.length;
  let angleRad: number = arcStartRad;
  switch (alignment) {
    case 'left':
      angleRad = arcStartRad;
      break;
    case 'right':
      angleRad = arcEndRad - (textWidth / radius);
      break;
    case 'center':
    default:
      angleRad = arcStartRad + (arcLengthRad / 2) - ((textWidth / 2) / radius);
      break;
  }
  const rotateAngle: number = widthPerChar / radius;
  const labelRadius: number = radius + offset.y;
  angleRad = angleRad + angleRadInBetweenSides(labelRadius, labelRadius, offset.x);
  const normAngleRad: number = normalizeToCanvas(angleRad);
  const coord: Coord = toCartesianCoords(center.x, center.y, labelRadius, normAngleRad);
  const { x, y }: Coord = coord;
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
}

function drawTextAlongAxis(params: DrawTextParams): void {
  const { radius, location, content, styleObj,
          center, offset, scale, context}: DrawTextParams = params;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcLengthRad: number = Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcLengthRad / 2);
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
  context.translate(x, y);
  if (hasfill) {
    context.fillText(content, 0, 0);
  }
  if (hasStroke) {
    context.strokeText(content, 0, 0);
  }
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
    const styleObj: StringKeyValMap = updateContextStyle(context, style, resolveStyle);
    const drawParams: DrawTextParams = {
      radius, location, content, styleObj,
      center, offset, scale, context
    };
    context.save();
    switch (type) {
      case LabelTypes.PATH:
        drawTextAlongArc(drawParams);
        break;
      case LabelTypes.TEXT:
      default:
        drawTextAlongAxis(drawParams);
        break;
    }
    context.restore();
    return Promise.resolve(true);
  }

}

export default LabelComponent.prototype.render;