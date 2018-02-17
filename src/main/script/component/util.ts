import { CharInfo, Coord, DefaultArcObject, ScaleLinear, StringKeyValMap } from './models';

export type StyleResolver = (styleProp: string, styleVal: string, context: CanvasRenderingContext2D) => void;

export const _AXIS_OFFSET_RADIANS: number = -(Math.PI / 2);

export function scaleLinear(): ScaleLinear<number, number> {
  return (() => {

    let domain: number[] = [];
    let range: number[] = [];
    let answers: { [key: string]: number } = {};

    const scale: any = (value: number): number => {
      let answer: number = answers[value.toString()];
      if (!answer) {
        answer = range[0] + ((range[1] - range[0]) * ((value - domain[0]) / (domain[1] - domain[0])));
        answers[value.toString()] = answer;
      }
      return answer;
    };
    scale.domain = (values: number[]): ScaleLinear<number, number> => {
      answers = {};
      domain = values;
      return scale;
    };
    scale.range = (values: number[]): ScaleLinear<number, number> => {
      answers = {};
      range = values;
      return scale;
    };
    return scale;
  })();
}

export function parseStyle(style: string): StringKeyValMap {
  return style.split(';')
    .filter((styleEl: string) => styleEl.length > 0)
    .map((styleEl: string) => styleEl.trim().split(':'))
    .reduce((acc: StringKeyValMap, keyVal: string[]) => {
      if (keyVal[1]) {
        acc[keyVal[0]] = keyVal[1].trim();
      }
      return acc;
    }, {});
}

export function toCamelCaseKeys(pairs: StringKeyValMap): StringKeyValMap {
  const result: StringKeyValMap = {};
  for (const key in pairs) {
    if (!pairs.hasOwnProperty(key)) {
      continue;
    }
    const val: string = pairs[key];
    const camelCased: string = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    result[camelCased] = val;
  }
  return result;
}

export function updateContextStyle(context: CanvasRenderingContext2D,
                                   styles: StringKeyValMap,
                                   resolve?: StyleResolver): void {
  Object.keys(styles).forEach((styleProp: string) => {
    const styleVal: string = styles[styleProp];
    switch (styleProp) {
      case 'fill':
        context.fillStyle = styleVal;
        break;
      case 'stroke':
        context.strokeStyle = styleVal;
        break;
      case 'stroke-width':
        context.lineWidth = parseFloat(styleVal);
        break;
      case 'stroke-linecap':
        context.lineCap = styleVal;
        break;
      case 'stroke-linejoin':
        context.lineJoin = styleVal;
        break;
      case 'stroke-miterlimit':
        context.miterLimit = parseFloat(styleVal);
        break;
      case 'stroke-dasharray':
        context.setLineDash(styleVal.split(',').map((val: string) => parseFloat(val)));
        break;
      case 'stroke-dashoffset':
        context.lineDashOffset = parseFloat(styleVal);
        break;
      default:
        break;
    }
    if (typeof resolve === 'function') {
      resolve(styleProp, styleVal, context);
    }
  });
}

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number): number {
  return radians / (Math.PI / 180);
}

export function toCartesianCoords(centerX: number,
                                  centerY: number,
                                  radius: number,
                                  angleInRadians: number): Coord {
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
}

export function withAxisOffset(angleInRadians: number): number {
  return _AXIS_OFFSET_RADIANS + angleInRadians;
}

export function angleRadInBetweenSides(adjacentSideA: number,
                                       adjacentSideB: number,
                                       oppositeSide: number): number {
  const squaredTotal: number = squared(adjacentSideA) +
                               squared(adjacentSideB) -
                               squared(oppositeSide);
  return Math.acos(squaredTotal / (2 * adjacentSideA * adjacentSideB));
}

export function deepClone<T extends object>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}

export function squared(value: number): number {
  return Math.pow(value, 2);
}

export function textContentWidth(symbols: string[], charInfo: CharInfo) {
  const { space, widths } = charInfo;
  const spaceWidth: number = (symbols.length - 1) * space;
  return symbols.reduce((total: number, symbol: string) => {
    return total + widths[symbol];
  }, spaceWidth);
}
