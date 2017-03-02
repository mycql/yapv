import { scaleLinear } from 'd3-scale';
import { arc } from 'd3-shape';

type StringKeyValMap = {[key: string]: string };

export function parseStyle(style: string): StringKeyValMap {
  return style.split(';')
    .filter((styleEl: string) => styleEl.length > 0)
    .map((styleEl: string) => styleEl.trim().split(':'))
    .reduce((acc: StringKeyValMap, keyVal: string[]) => {
      acc[keyVal[0]] = keyVal[1].trim();
      return acc;
    }, {});
}

export function updateContextStyle(context: CanvasRenderingContext2D, style: string): { [key: string]: string } {
  const styles: { [key: string]: string } = parseStyle(style);
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
  });
  return styles;
}

export function pathDraw(context: CanvasRenderingContext2D, style: string): void {
  context.save();
  const styles: { [key: string]: string } = updateContextStyle(context, style);
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

export {
  scaleLinear,
  arc,
};