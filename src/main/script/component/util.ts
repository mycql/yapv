import { CharInfo, Coord, DefaultArcObject, PI, ScaleLinear, StringKeyValMap, PolarCoord } from './models';

export type StyleResolver = (styleProp: string, styleVal: string, context: CanvasRenderingContext2D) => void;

export const _AXIS_OFFSET_RADIANS: number = -PI.HALF;

export type Quadrant = {
  start: number;
  end: number;
};

export const Quadrants: {
  FIRST: Quadrant;
  SECOND: Quadrant;
  THIRD: Quadrant;
  FOURTH: Quadrant;
  fromCoord: (coord: Coord) => Quadrant;
  from: (angle: number) => Quadrant;
  same: (angle1: number, angle2: number) => boolean;
} = {
  FIRST: {
    start: 0,
    end: PI.HALF,
  },
  SECOND: {
    start: PI.HALF,
    end: PI.WHOLE,
  },
  THIRD: {
    start: PI.WHOLE,
    end: PI.WHOLE + PI.HALF,
  },
  FOURTH: {
    start: PI.WHOLE + PI.HALF,
    end: PI.TWICE,
  },
  fromCoord: (coord: Coord) => {
    const { x, y } = coord;
    if (x < 0 && y >= 0) {
      return Quadrants.SECOND;
    } else if (x >= 0 && y < 0) {
      return Quadrants.FOURTH;
    } else if (x < 0 && y < 0) {
      return Quadrants.THIRD;
    } else {
      return Quadrants.FIRST;
    }
  },
  from: (angle: number) => {
    let found: Quadrant = Quadrants.FIRST;
    for (const key in Quadrants) {
      if (Quadrants[key]) {
        const value: Quadrant = Quadrants[key];
        const inside: boolean = angle >= value.start && angle < value.end;
        if (inside) {
          found = value;
        }
      }
    }
    return found;
  },
  same: (angle1: number, angle2: number) => {
    return Quadrants.from(angle1) === Quadrants.from(angle2);
  },
};

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

/**
 * Converts the cartesian coordinates to polar coordinates
 * in the counter clockwise direction
 * @param target the cartesian coordinate to convert from
 * @param center the cartesian coordinate of the axis of rotation
 */
export function toPolarCoords(target: Coord, center?: Coord): PolarCoord {
  const normalizedTarget: Coord = center ? {
    x: target.x - center.x,
    y: target.y - center.y,
  } : target;
  const { x, y } = normalizedTarget;
  const radius = Math.sqrt(squared(x) + squared(y));
  const angleInRadians = ((computedAngle: number) => {
    const quadrant = Quadrants.fromCoord(normalizedTarget);
    const coordsSameSign = quadrant === Quadrants.FIRST ||
                           quadrant === Quadrants.THIRD;
    let angleOffset = quadrant.end;
    if (coordsSameSign) {
      angleOffset = quadrant.start;
    }
    return computedAngle + (coordsSameSign ? quadrant.start : quadrant.end);
  })(Math.atan(y / x));
  return { radius, angleInRadians };
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

export function debounce(func: (...args: any[]) => any, wait: number, immediate?: boolean) {
  let timeout: number | null;
  return (...args: any[]) => {
    const context = null; // this?
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout as number);
    timeout = (window || self).setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}
