import { CharInfo, Coord, ScaleLinear, StringKeyValMap, TextMeasurer } from './models/types';

import { PI } from './models';

export type StyleResolver = (styleProp: string, styleVal: string, context: CanvasRenderingContext2D) => void;

export const _AXIS_OFFSET_RADIANS: number = -PI.HALF;

export function canvasContextTextMeasurer(context: CanvasRenderingContext2D): TextMeasurer {
  return (text: string, style: StringKeyValMap) => {
    context.save();
    updateContextStyle(context, style, resolveTextStyle);
    const size: number = context.measureText(text).width;
    context.restore();
    return size;
  };
}

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
    scale.domain = (values?: number[]): ScaleLinear<number, number> | number[] => {
      if (!values) {
        return domain;
      }
      answers = {};
      domain = values;
      return scale;
    };
    scale.range = (values?: number[]): ScaleLinear<number, number> | number[] => {
      if (!values) {
        return range;
      }
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
        context.lineCap = styleVal as CanvasLineCap;
        break;
      case 'stroke-linejoin':
        context.lineJoin = styleVal as CanvasLineJoin;
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

export function resolveTextStyle(styleProp: string, styleVal: string, context: CanvasRenderingContext2D): void {
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

export function toRadians(degrees: number): number {
  return degrees * (PI.WHOLE / 180);
}

export function toDegrees(radians: number): number {
  return radians / (PI.WHOLE / 180);
}

export function toCartesianCoords(center: Coord,
                                  radius: number,
                                  angleInRadians: number): Coord {
  const defaultIfTooSmall = (value: number): number => {
    if (value < 0 && value > -0.001) {
      return -0.001;
    }
    if (value > 0 && value < 0.001) {
      return 0.001;
    }
    return value;
  };
  return {
    x: defaultIfTooSmall(center.x + (radius * Math.cos(angleInRadians))),
    y: defaultIfTooSmall(center.y + (radius * Math.sin(angleInRadians))),
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

export function arcLength(radius: number, angleInRad: number): number {
  return radius * angleInRad;
}

export function arcAngleRad(radius: number, lengthOfArc: number): number {
  return lengthOfArc / radius;
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
