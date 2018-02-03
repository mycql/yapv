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
  parseStyle,
} from '../../util';

const defaultStyle: string = 'stroke: black; fill: black; font: 10px "Courier New", monospace;';

export type TextMeasurer = (text: string, style: StringKeyValMap) => number;

export type TextRenderModel = {
  content: string;
  distance: number;
  position: Coord;
  style: StringKeyValMap;
  anglesInRadians?: {
    rotation: number;
    path: Location;
  };
  charInfo?: {
    widths: { [key: string]: number };
    space: number;
  };
};

export type ConnectorRenderModel = {
  from: Coord;
  to: Coord[];
  style: StringKeyValMap;
};

export type LabelRenderModel = {
  type: LabelType,
  label: TextRenderModel;
  connector?: ConnectorRenderModel;
};

type DrawTextModel = {
  type: LabelType,
  radius: number;
  location: Location;
  content: string;
  style: string;
  center: Coord;
  offset: Coord;
  line: boolean | Line;
  scale: ScaleLinear<number, number>;
  measure: TextMeasurer | undefined;
};

function connector(params: DrawTextModel, end: Coord, lineRad: number, arcMidRad: number): ConnectorRenderModel {
  const { radius, style, center, line }: DrawTextModel = params;
  const useDefaultLine: boolean = typeof line === 'boolean' && line === true;
  const useCustomLine: boolean = typeof line === 'object';
  let lineStyle: string = style;
  const to: Coord[] = [];
  let from: Coord = { x: center.x, y: center.y };
  if (useDefaultLine) {
    from = toCartesianCoords(center.x, center.y, radius, lineRad);
    to.push(end);
  } else if (useCustomLine) {
    const lineModel: Line = line as Line;
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
    style: parseStyle(lineStyle),
  };
}

function textAlongArc(params: DrawTextModel): LabelRenderModel {
  const { radius, location, content, style, type,
    center, offset, line, scale, measure }: DrawTextModel = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
  const charSpace: number = parseInt(styleObj['letter-spacing'] || '0', 10);
  const labelRadius: number = radius + offset.y;
  const contentWidth: number = measure ? measure(content, styleObj) : 0;
  const textWidth: number = contentWidth + ((content.length - 1) * charSpace);
  const textArcRad: number = angleRadInBetweenSides(radius, radius, textWidth);
  const textArcRadHalf: number = textArcRad / 2;
  const charWidth: number = textWidth / content.length;
  const rotateAngle: number = charWidth / radius;
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

  const renderParams: LabelRenderModel = {
    type,
    label: {
      content,
      distance: labelRadius,
      position: coord,
      style: styleObj,
      anglesInRadians: {
        rotation: rotateAngle,
        path: {
          start: angleRad,
          end: angleRad + textArcRad,
        },
      },
    },
  };

  if (line) {
    const lineRad: number = normAngleRad + textArcRadHalf;
    const to: Coord = toCartesianCoords(center.x, center.y, labelRadius, lineRad);
    renderParams.connector = connector(params, to, lineRad, arcMidRad);
  }

  return renderParams;
}

function textAlongAxis(params: DrawTextModel): LabelRenderModel {
  const { radius, location, content, style, type,
    center, offset, line, scale, measure }: DrawTextModel = params;
  const crossesOver: boolean = location.start > location.end;
  const arcStartRad: number = scale(location.start);
  const arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (2 * Math.PI - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-align'] || 'center';
  const charSpace: number = parseInt(styleObj['letter-spacing'] || '0', 10);
  const charWidths: { [key: string]: number } = {};
  content.split('').forEach((symbol: string) => {
    const width: number = charWidths[symbol];
    if (!width && measure) {
      charWidths[symbol] = measure(symbol, styleObj);
    }
  });
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

  const renderParams: LabelRenderModel = {
    type,
    label: {
      charInfo: {
        widths: charWidths,
        space: charSpace,
      },
      content,
      position,
      distance: Math.max(radius + offset.x, radius + offset.y),
      style: styleObj,
    },
  };

  if (line) {
    const lineRad: number = normalizeToCanvas(arcMidRad);
    const to: Coord = position;
    renderParams.connector = connector(params, to, lineRad, arcMidRad);
  }

  return renderParams;
}

type Mapper = RenderModelMapper<Label, LabelDisplayConfig, LabelRenderModel, TextMeasurer>;
const LabelRenderMapper: Mapper = (model: Label,
                                   scale: ScaleLinear<number, number>,
                                   measure?: TextMeasurer): LabelRenderModel => {
  const content: string = model.text;
  const displayConfig: LabelDisplayConfig = model.displayConfig;
  const center: Coord = { x: 0, y: 0 };
  const offset: Coord = { x: displayConfig.hOffset || 0, y: displayConfig.vOffset || 0 };
  const style: string = displayConfig.style || defaultStyle;
  const location: Location = model.location;
  const type: LabelType = displayConfig.type || LabelTypes.PATH;
  const radius: number = displayConfig.distance;
  const line: boolean | Line = model.line as boolean | Line;
  const drawParams: DrawTextModel = {
    center, content, line, location, measure,
     offset, radius, scale, style, type,
  };

  const renderParams: LabelRenderModel =
    [type].map((labelType: string) =>
      labelType === LabelTypes.PATH ?
        textAlongArc(drawParams) :
        textAlongAxis(drawParams))[0];

  return renderParams;
};

export default LabelRenderMapper;
