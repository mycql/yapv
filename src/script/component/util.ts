import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';
import { Coord } from './models';

export type StringKeyValMap = { [key: string]: string };
export type StyleResolver = (styleProp: string, styleVal: string, context: CanvasRenderingContext2D) => void;
export enum Quadrant {
  FIRST, SECOND, THIRD, FOURTH
}

const _ANGLE_OFFSET: number = Math.PI + (Math.PI / 2);

export function parseStyle(style: string): StringKeyValMap {
  return style.split(';')
    .filter((styleEl: string) => styleEl.length > 0)
    .map((styleEl: string) => styleEl.trim().split(':'))
    .reduce((acc: StringKeyValMap, keyVal: string[]) => {
      acc[keyVal[0]] = keyVal[1].trim();
      return acc;
    }, {});
}

export function updateContextStyle(context: CanvasRenderingContext2D, style: string, resolve?: StyleResolver): StringKeyValMap {
  const styles: StringKeyValMap = parseStyle(style);
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
  return styles;
}

export function pathDraw(context: CanvasRenderingContext2D, style: string): void {
  context.save();
  const styles: StringKeyValMap = updateContextStyle(context, style);
  const fillRule: string = styles['fill-rule'];
  const strokeOpacity: string = styles['stroke-opacity'];
  const fillOpacity: string = styles['fill-opacity'];
  if (strokeOpacity) {
    context.globalAlpha = parseFloat(strokeOpacity);
  } else {
    context.globalAlpha = 1;
  }
  context.stroke();
  if (fillOpacity) {
    context.globalAlpha = parseFloat(fillOpacity);
  } else {
    context.globalAlpha = 1;
  }
  if (fillRule) {
    context.fill(fillRule);
  } else {
    context.fill();
  }
  context.restore();
}

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function toDegrees(radians: number): number {
  return radians / (Math.PI / 180);
}

export function getQuadrant(degrees: number): Quadrant {
  if (degrees >= 0 && degrees <= 90) {
    return Quadrant.FIRST;
  } else if (degrees > 90 && degrees <= 180) {
    return Quadrant.SECOND;
  } else if (degrees > 180 && degrees <= 270) {
    return Quadrant.THIRD;
  } else {
    return Quadrant.FOURTH;
  }
}

export function toCartesianCoords(centerX: number,
                                  centerY: number,
                                  radius: number,
                                  angleInRadians: number): Coord {
  return {
    x: centerX + (radius * Math.cos(_ANGLE_OFFSET + angleInRadians)),
    y: centerY + (radius * Math.sin(_ANGLE_OFFSET + angleInRadians))
  };
}

export {
  scaleLinear,
  arc
};