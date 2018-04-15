import { Coord, DefaultArcObject, Dimension, StringKeyValMap } from '../../../models';
import { parseStyle, toCartesianCoords, updateContextStyle } from '../../../util';

function startsAndEndsAtSameCoord(config: DefaultArcObject): boolean {
  const { anglesInRadians, radii } = config;
  const { outer: outerRadius } = radii;
  const { start: startAngle, end: endAngle } = anglesInRadians;
  const center: Coord = { x: 0, y: 0 };
  const coord1: Coord = toCartesianCoords(center, outerRadius, startAngle);
  const coord2: Coord = toCartesianCoords(center, outerRadius, endAngle);
  const xRatio: number = Math.floor(coord1.x / coord2.x);
  const yRatio: number = Math.floor(coord1.y / coord2.y);
  return xRatio === 1 || yRatio === 1;
}

export function donut(context: CanvasRenderingContext2D, config: DefaultArcObject): void {
  const { anglesInRadians, radii } = config;
  const { inner: innerRadius, outer: outerRadius } = radii;
  const { start: startAngle, end: endAngle } = anglesInRadians;
  const startAndEndIsSame: boolean = startsAndEndsAtSameCoord(config);
  const center: Coord = { x: 0, y: 0 };
  context.arc(center.x, center.y, innerRadius, startAngle, endAngle);
  if (!startAndEndIsSame) {
    const connector1: Coord = toCartesianCoords(center, outerRadius, endAngle);
    context.lineTo(connector1.x, connector1.y);
  }
  context.arc(center.x, center.y, outerRadius, endAngle, startAngle, true);
  if (!startAndEndIsSame) {
    const connector2: Coord = toCartesianCoords(center, innerRadius, startAngle);
    context.lineTo(connector2.x, connector2.y);
  }
}

export function pathDraw(context: CanvasRenderingContext2D,
                         style: string | StringKeyValMap,
                         fill: boolean = true): void {
  const styles: StringKeyValMap = typeof style === 'string' ? parseStyle(style) : style;
  const fillRule: string = styles['fill-rule'];
  const strokeOpacity: string = styles['stroke-opacity'];
  const fillOpacity: string = styles['fill-opacity'];
  context.save();
  updateContextStyle(context, styles);
  if (strokeOpacity) {
    context.globalAlpha = parseFloat(strokeOpacity);
  } else {
    context.globalAlpha = 1;
  }
  context.stroke();
  if (fill) {
    if (fillOpacity) {
      context.globalAlpha = parseFloat(fillOpacity);
    } else {
      context.globalAlpha = 1;
    }
    if (fillRule) {
      context.fill(fillRule as CanvasFillRule);
    } else {
      context.fill();
    }
  }
  context.restore();
}

export type PreserveAspectRatioResult = {
  src: Dimension & Coord;
  dest: Dimension & Coord;
};

export function preserveAspectRatio(source: Dimension,
                                    destination: Dimension,
                                    userString: string): PreserveAspectRatioResult {
  const { width: srcWidth, height: srcHeight } = source;
  const { width: destinationW, height: destinationH } = destination;
    // we should keep the whole source
  const aRMeet = (args: string[]): PreserveAspectRatioResult => {
    const srcRatio = (srcHeight / srcWidth);
    const destRatio = (destinationH / destinationW);
    const resultWidth = destRatio < srcRatio ? destinationW : destinationH / srcRatio;
    const resultHeight = destRatio < srcRatio ? destinationW * srcRatio : destinationH;
    const getPos = (arg: string, res: number, dest: number) => {
      const max = Math.max(res, dest);
      const min = Math.min(res, dest);
      switch (arg) {
        case 'Mid':
          return (max - min) / 2;
        case 'Max':
          return max - min;
        case 'Min':
        default:
          return 0;
      }
    };
    return {
      src: {
        x: 0,
        y: 0,
        width: srcWidth,
        height: srcHeight,
      },
      dest: {
        x: getPos(args[0], resultWidth, destinationW),
        y: getPos(args[1], resultHeight, destinationH),
        width: resultWidth,
        height: resultHeight,
      },
    };
  };

  // we should slice the larger part
  const aRSlice = (args: string[]): PreserveAspectRatioResult => {
    let resultWidth = 0;
    let resultHeight = 0;
    const a = () => {
      resultWidth = destinationW;
      resultHeight = srcHeight * destinationW / srcWidth;
    };
    const b = () => {
      resultWidth = srcWidth * destinationH / srcHeight;
      resultHeight = destinationH;
    };
    if (destinationW > destinationH) {
      a();
      if (destinationH > resultHeight) {
        b();
      }
    } else if (destinationW === destinationH) {
      if (srcWidth > srcHeight) {
        b();
      } else {
        a();
      }
    } else {
      b();
      if (destinationW > resultWidth) {
        a();
      }
    }
    const getPos = (arg: string, res: number, dest: number, src: number) => {
      switch (arg) {
        case 'Mid':
          return (res - dest) / 2 * (src / res);
        case 'Max':
          return (res - dest) * (src / res);
        default:
        case 'Min':
          return 0;
      }
    };
    const x = getPos(args[0], resultWidth, destinationW, srcWidth);
    const y = getPos(args[1], resultHeight, destinationH, srcHeight);
    return {
      src: {
        x,
        y,
        width: srcWidth - x,
        height: srcHeight - y,
      },
      dest: {
        x: 0,
        y: 0,
        width: resultWidth - (x * (resultWidth / srcWidth)),
        height: resultHeight - (y * (resultHeight / srcHeight)),
      },
    };
  };
  // if an invalid string or none is set as the preserveAspectRatio,
  // this should be considered as "xMidYMid meet"
  const defaultObj = aRMeet(['Mid', 'Mid']);
  if (!userString) {
    return defaultObj;
  } else {
    const args = userString.trim().split(' ');
    const minMidMax = args[0].replace('x', '').split('Y');
    switch (args[args.length - 1]) {
      case 'meet':
        return aRMeet(minMidMax);
      case 'slice':
        return aRSlice(minMidMax);
      default:
        return defaultObj;
    }
  }
}
