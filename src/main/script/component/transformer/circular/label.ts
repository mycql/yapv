import {
  CharInfo,
  Coord,
  DisplayConfig,
  Label,
  LabelDisplayConfig,
  LabelType,
  LabelTypes,
  Line,
  Location,
  PI,
  RenderModelTransformer,
  ScaleLinear,
  StringKeyNumValMap,
  StringKeyValMap,
} from '../../models';
import {
  textContentWidth,
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
  charInfo: CharInfo;
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

function getCharWidths(symbols: string[],
                       styleObj: StringKeyValMap,
                       measure?: TextMeasurer): StringKeyNumValMap {
  const charWidths: StringKeyNumValMap = {};
  symbols.forEach((symbol: string) => {
    const width: number = charWidths[symbol];
    if (!width && measure) {
      charWidths[symbol] = measure(symbol, styleObj);
    }
  });
  return charWidths;
}

function connector(params: DrawTextModel, end: Coord, lineRad: number, arcMidRad: number): ConnectorRenderModel {
  const { radius, style, center, line }: DrawTextModel = params;
  const useDefaultLine: boolean = typeof line === 'boolean' && line === true;
  const useCustomLine: boolean = typeof line === 'object';
  let lineStyle: string = style;
  const to: Coord[] = [];
  let from: Coord = { x: center.x, y: center.y };
  if (useDefaultLine) {
    from = toCartesianCoords(center, radius, lineRad);
    to.push(end);
  } else if (useCustomLine) {
    const lineModel: Line = line as Line;
    const lineConfig: DisplayConfig = lineModel.displayConfig;
    if (lineConfig && lineConfig.style) {
      lineStyle = lineConfig.style;
    }
    from = toCartesianCoords(center, radius, arcMidRad);
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
    (PI.TWICE - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const charSpace: number = parseInt(styleObj['letter-spacing'] || '0', 10);
  const symbols: string[] = content.split('');
  const charWidths: StringKeyNumValMap = getCharWidths(symbols, styleObj, measure);
  const charInfo: CharInfo = { widths: charWidths, space: charSpace };
  const textWidth: number = textContentWidth(symbols, charInfo);
  const labelRadius: number = radius + offset.y;
  const textArcRad: number = angleRadInBetweenSides(radius, radius, textWidth);
  const textArcRadHalf: number = textArcRad / 2;
  const rotateAngle: number = (textWidth / content.length) / radius;
  const alignment: string = arcDiffRad < textArcRad ? 'middle' : styleObj['text-anchor'] || 'middle';
  let angleRad: number = arcStartRad;
  switch (alignment) {
    case 'start':
      angleRad = arcStartRad;
      break;
    case 'end':
      angleRad = arcEndRad - textArcRad;
      break;
    case 'middle':
    default:
      angleRad = arcMidRad - textArcRadHalf;
      break;
  }
  angleRad = angleRad + angleRadInBetweenSides(radius, radius, offset.x);
  const coord: Coord = toCartesianCoords(center, labelRadius, angleRad);

  const renderParams: LabelRenderModel = {
    type,
    label: {
      charInfo,
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
    const lineRad: number = angleRad + textArcRadHalf;
    const to: Coord = toCartesianCoords(center, labelRadius, lineRad);
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
    (PI.TWICE - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const styleObj: StringKeyValMap = parseStyle(style);
  const alignment: string = styleObj['text-anchor'] || 'middle';
  const charSpace: number = parseInt(styleObj['letter-spacing'] || '0', 10);
  const symbols: string[] = content.split('');
  const charWidths: StringKeyNumValMap = getCharWidths(symbols, styleObj, measure);
  const charInfo: CharInfo = { widths: charWidths, space: charSpace };
  let angleRad: number = 0;
  switch (alignment) {
    case 'start':
      angleRad = arcStartRad;
      break;
    case 'end':
      angleRad = arcEndRad;
      break;
    case 'middle':
    default:
      angleRad = arcMidRad;
      break;
  }

  const coord: Coord = toCartesianCoords(center, radius, angleRad);
  const x: number = coord.x + offset.x;
  const y: number = coord.y + offset.y;
  const position: Coord = { x, y };

  const renderParams: LabelRenderModel = {
    type,
    label: {
      charInfo,
      content,
      position,
      distance: Math.max(radius + offset.x, radius + offset.y),
      style: styleObj,
    },
  };

  if (line) {
    const lineRad: number = arcMidRad;
    const to: Coord = position;
    renderParams.connector = connector(params, to, lineRad, arcMidRad);
  }

  return renderParams;
}

type Transformer = RenderModelTransformer<Label, LabelDisplayConfig, LabelRenderModel, TextMeasurer>;
const LabelModelTransformer: Transformer = (model: Label,
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

export default LabelModelTransformer;
