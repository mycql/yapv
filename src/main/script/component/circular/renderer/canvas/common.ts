import { Coord, DefaultArcObject, StringKeyValMap } from '../../../models';
import { parseStyle, toCartesianCoords, updateContextStyle } from '../../../util';

function startsAndEndsAtSameCoord(config: DefaultArcObject): boolean {
  const { outerRadius, startAngle, endAngle } = config;
  const centerX: number = 0;
  const centerY: number = 0;
  const coord1: Coord = toCartesianCoords(centerX, centerY, outerRadius, startAngle);
  const coord2: Coord = toCartesianCoords(centerX, centerY, outerRadius, endAngle);
  const xRatio: number = Math.floor(coord1.x / coord2.x);
  const yRatio: number = Math.floor(coord1.y / coord2.y);
  return xRatio === 1 || yRatio === 1;
}

export function donut(context: CanvasRenderingContext2D, config: DefaultArcObject): void {
  const startAndEndIsSame: boolean = startsAndEndsAtSameCoord(config);
  const { innerRadius, outerRadius, startAngle, endAngle }: DefaultArcObject = config;
  const centerX: number = 0;
  const centerY: number = 0;
  context.arc(centerX, centerY, innerRadius, startAngle, endAngle);
  if (!startAndEndIsSame) {
    const connector1: Coord = toCartesianCoords(centerX, centerY, outerRadius, endAngle);
    context.lineTo(connector1.x, connector1.y);
  }
  context.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
  if (!startAndEndIsSame) {
    const connector2: Coord = toCartesianCoords(centerX, centerY, innerRadius, startAngle);
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
