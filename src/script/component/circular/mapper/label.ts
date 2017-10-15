import { ScaleLinear } from 'd3-scale';
import {
  Coord,
  DisplayConfig,
  Label,
  LabelDisplayConfig,
  LabelType,
  LabelTypes,
  Line,
  Location,
  RenderModelMapper,
  StringKeyValMap,
} from '../../models';
import {
  normalizeToCanvas,
  toCartesianCoords,
  angleRadInBetweenSides,
  parseStyle
} from '../../util';

const defaultStyle: string = 'stroke: black; fill: black; font: 10px "Courier New", monospace;';

export type TextMeasurer = (text: string) => number;

export type LabelRenderParams = {
  content: string;
  position: Coord;
  style: StringKeyValMap;
  anglesInRadians?: {
    rotation: number;
    path: number;
  };
};

export type ConnectorRenderParams = {
  from: Coord;
  to: Array<Coord>;
  style: StringKeyValMap;
};

export type RenderParams = {
  type: LabelType,
  label: LabelRenderParams;
  connector?: ConnectorRenderParams;
};

type DrawTextParams = {
  type: LabelType,
  radius: number;
  location: Location;
  content: string;
  style: string;
  center: Coord;
  offset: Coord;
  line: boolean | Line;
  scale: ScaleLinear<number, number>;
  measure: TextMeasurer;
};

function connector(params: DrawTextParams, end: Coord, lineRad: number, arcMidRad: number): ConnectorRenderParams {
  const { radius, style, center, line }: DrawTextParams = params;
  const useDefaultLine: boolean = typeof line === 'boolean' && line === true;
  const useCustomLine: boolean = typeof line === 'object';
  let lineStyle: string = style;
  const to: Array<Coord> = [];
  let from: Coord = null;
  if (useDefaultLine) {
    from = toCartesianCoords(center.x, center.y, radius, lineRad);
    to.push(end);
  } else if (useCustomLine) {
    const lineModel: Line = (<Line>line);
    const lineConfig: DisplayConfig = lineModel.displayConfig;
    if (lineConfig && lineConfig.style) {
      lineStyle = lineConfig.style;
    }
    from = toCartesianCoords(center.x, center.y, radius, normalizeToCanvas(arcMidRad));
    (lineModel.coords || []).forEach((lineOffset: Coord) => {
      to.push({ x: from.x + lineOffset.x, y: from.y + lineOffset.y });
    });
    to.push(end);
  }
  return {
    from,
    to,
    style: parseStyle(lineStyle)
  };
}

function textAlongArc(params: DrawTextParams): RenderParams {
  const { radius, location, content, style, type,
    center, offset, line, scale, measure }: DrawTextParams = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
  const letterSpacing: number = parseInt(styleObj['letter-spacing'] || '0');
  const labelRadius: number = radius + offset.y;
  const contentWidth: number = measure(content);
  const textWidth: number = contentWidth + ((content.length - 1) * letterSpacing);
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

  const renderParams: RenderParams = {
    type,
    label: {
      content,
      position: coord,
      style: styleObj,
      anglesInRadians: {
        rotation: rotateAngle,
        path: angleRad
      }
    }
  };

  if (line) {
    const lineRad: number = normAngleRad + textArcRadHalf;
    const to: Coord = toCartesianCoords(center.x, center.y, labelRadius, lineRad);
    renderParams.connector = connector(params, to, lineRad, arcMidRad);
  }

  return renderParams;
}

function textAlongAxis(params: DrawTextParams): RenderParams {
  const { radius, location, content, style, type,
    center, offset, line, scale }: DrawTextParams = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
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
  const position: Coord = { x, y };

  const renderParams: RenderParams = {
    type,
    label: {
      content,
      position,
      style: styleObj
    }
  };

  if (line) {
    const lineRad: number = normalizeToCanvas(arcMidRad);
    const to: Coord = position;
    renderParams.connector = connector(params, to, lineRad, arcMidRad);
  }

  return renderParams;
}

export class LabelRenderMapper implements RenderModelMapper<Label, LabelDisplayConfig, RenderParams, TextMeasurer> {

  public map(model: Label, scale: ScaleLinear<number, number>, measure: TextMeasurer): Promise<RenderParams> {
    const content: string = model.text;
    const displayConfig: LabelDisplayConfig = model.displayConfig;
    const center: Coord = { x: 0, y: 0 };
    const offset: Coord = { x: displayConfig.hOffset || 0, y: displayConfig.vOffset || 0 };
    const style: string = displayConfig.style || defaultStyle;
    const location: Location = model.location;
    const type: LabelType = displayConfig.type || LabelTypes.PATH;
    const radius: number = displayConfig.distance;
    const line: boolean | Line = model.line;
    const drawParams: DrawTextParams = {
      radius, location, content, style, type,
      center, offset, line, scale, measure
    };

    const renderParams: RenderParams =
      [type].map((labelType: string) =>
        labelType === LabelTypes.PATH ?
          textAlongArc(drawParams) :
          textAlongAxis(drawParams))[0];

    return Promise.resolve(renderParams);
  }

}

export default LabelRenderMapper.prototype.map;