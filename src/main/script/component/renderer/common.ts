import {
  CollisionIndicator,
  CollisionStates,
  Coord,
  DefaultArcObject,
  Dimension,
  LabelTypes,
  Location,
  PI,
  PolarCoord,
  ScaleLinear,
  StringKeyValMap,
  CollisionState,
} from '../models';

import {
  createEvent,
  debounce,
  Quadrants,
  scaleLinear,
  toCartesianCoords,
  toDegrees,
  toPolarCoords,
  withAxisOffset,
  textContentWidth,
} from '../util';

import { MapRenderModel } from '../transformer/circular/map';
import { TextRenderModel, LabelRenderModel } from '../transformer/circular/label';
import { MarkerRenderModel } from '../transformer/circular/marker';

type ScaledDimension = {
  x: ScaleLinear<number, number> | null;
  y: ScaleLinear<number, number> | null;
};

type ScaledDimensionDefined = {
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
};

type MouseEventsState = {
  model: MapRenderModel | null;
  scale: ScaledDimension | null,
};

type TextMetricsResolver = {
  applyStyles(model: TextRenderModel): ClientRect;
  dispose(): void;
};

const CENTER: Coord = { x: 0, y: 0 };

const Events: { HOVER: string; } = {
  HOVER: 'yapv-hover',
};

function notEmpty(list: object[]): boolean {
  return list && list.length > 0;
}

function textHeightMetricsSVG(container: HTMLElement): TextMetricsResolver {
  const spanEl: HTMLSpanElement = document.createElement('span');
  spanEl.textContent = 'W';
  spanEl.style.position = 'fixed';
  spanEl.style.left = '-1000px';
  spanEl.style.top = '-1000px';
  container.appendChild(spanEl);

  return {
    applyStyles: (model: TextRenderModel) => {
      const { anglesInRadians, charInfo, content, distance, position, style } = model;
      for (const key in style) {
        if (!style[key]) {
          continue;
        }
        const value = style[key];
        spanEl.style[key] = value;
      }
      const height = spanEl.getBoundingClientRect().height;
      const width = textContentWidth(content.split(''), charInfo);
      const left = position.x - (width / 2);
      const bottom = position.y + (height / 2);
      const right = left + width;
      const top = bottom - height;
      return { bottom, height, left, right, top, width };
    },
    dispose: () => {
      container.removeChild(spanEl);
    },
  };
}

function textRectMetricsCanvas(container: HTMLElement): TextMetricsResolver {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  const dimension: Dimension = { width: 200, height: 200 };
  canvas.style.position = 'fixed';
  // canvas.style.left = `-${dimension.width}px`;
  // canvas.style.top = `-${dimension.height}px`;
  canvas.width = dimension.width;
  canvas.height = dimension.height;
  container.appendChild(canvas);

  return {
    applyStyles: (model: TextRenderModel) => {
      const { anglesInRadians, charInfo, content, distance, position, style } = model;
      const height = measureFontHeight(context, dimension, style['font']).height;
      const width = textContentWidth(content.split(''), charInfo);
      const left = position.x - (width / 2);
      const bottom = position.y + (height / 2);
      const right = left + width;
      const top = bottom - height;
      return { bottom, height, left, right, top, width };
    },
    dispose: () => {
      container.removeChild(canvas);
    },
  };
}

function measureFontHeight(context: CanvasRenderingContext2D, dimension: Dimension, fontStyle: string) {
  const { width: sourceWidth, height: sourceHeight } = dimension;
  context.save();
  context.clearRect(0, 0, sourceWidth, sourceHeight);
  context.font = fontStyle;
  // place the text somewhere
  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillText('fißgPauljMPÜÖÄ', 25, 5);

  // returns an array containing the sum of all pixels in a canvas
  // * 4 (red, green, blue, alpha)
  // [pixel1Red, pixel1Green, pixel1Blue, pixel1Alpha, pixel2Red ...]
  const data = context.getImageData(0, 0, sourceWidth, sourceHeight).data;

  let firstY = -1;
  let lastY = -1;

  for (let y = 0; y < sourceHeight; y++) {
      for (let x = 0; x < sourceWidth; x++) {
          const alpha = data[((sourceWidth * y) + x) * 4 + 3];
          if (alpha > 0) {
              firstY = y;
              break;
          }
      }
      if (firstY >= 0) {
          break;
      }
  }

  // loop through each row, this time beginning from the last row
  for (let y = sourceHeight; y > 0; y--) {
      for (let x = 0; x < sourceWidth; x++) {
          const alpha = data[((sourceWidth * y) + x) * 4 + 3];
          if (alpha > 0) {
              lastY = y;
              break;
          }
      }
      if (lastY >= 0) {
          break;
      }
  }
  context.clearRect(0, 0, sourceWidth, sourceHeight);
  context.restore();

  return {
    // The actual height
    height: lastY - firstY,
    // The first pixel
    firstPixel: firstY,
    // The last pixel
    lastPixel: lastY,
  };
}

export class MouseEventsListener implements EventListenerObject {

  public handleEvent: (evt: Event) => void;

  private state?: MouseEventsState | null;

  constructor(element: HTMLElement) {
    const textMetricsResolver: TextMetricsResolver = textRectMetricsCanvas(document.body);

    const rotateAngleLeft = (() => {
      const oneQuadrantToTheLeft = scaleLinear()
        .domain([Quadrants.FIRST.start, Quadrants.FIRST.end])
        .range([-PI.HALF, 0]);
      return (angleInRadians: number) => {
        return angleInRadians >= Quadrants.FIRST.start ?
          oneQuadrantToTheLeft(angleInRadians) : angleInRadians;
      };
    })();
    const onArcCollision: CollisionIndicator<DefaultArcObject, PolarCoord> =
      collidesArc({ start: withAxisOffset(0), end: withAxisOffset(PI.TWICE)});
    const onRectCollision: CollisionIndicator<ClientRect, Coord> = collidesRect;
    this.handleEvent = debounce((event: Event) => {
      if (!this.state) {
        return;
      }
      const { scale, model } = this.state;
      const { tracks, labels } = model as MapRenderModel;
      const { x: scaleX, y: scaleY } = scale as ScaledDimensionDefined;
      const mouseEvent: MouseEvent = event as MouseEvent;
      const { offsetX, offsetY } = mouseEvent;
      const x: number = scaleX(offsetX);
      const y: number = scaleY(offsetY);
      const target: HTMLElement = event.target as HTMLElement;
      const polarCoord: PolarCoord = toPolarCoords({ x, y });
      const mousePolar: PolarCoord = {
          radius: polarCoord.radius,
          angleInRadians: rotateAngleLeft(polarCoord.angleInRadians),
      };
      const mouseCartesian = toCartesianCoords(CENTER, mousePolar.radius, mousePolar.angleInRadians);
      const onLabelCollision = collidesLabel(mouseCartesian, mousePolar,
        onArcCollision, onRectCollision, textMetricsResolver);
      const collidedLabels: LabelRenderModel[] = labels.filter(onLabelCollision);
      const collidedModels: object[] = [];
      tracks.forEach((trackModel) => {
        trackModel.markers.forEach((marker) => {
          if (onArcCollision(marker.marker, mousePolar) === CollisionStates.HIT) {
            collidedModels.push(marker.marker);
          }
          const collidedMarkerLabels: LabelRenderModel[] = marker.labels.filter(onLabelCollision);
          if (notEmpty(collidedMarkerLabels)) {
            Array.prototype.push.apply(collidedLabels, collidedMarkerLabels);
          }
        });
      });
      if (notEmpty(collidedLabels)) {
        Array.prototype.push.apply(collidedModels, collidedLabels);
      }
      if (notEmpty(collidedModels)) {
        element.dispatchEvent(createEvent(Events.HOVER, collidedModels));
      }
    }, 1000 / 60, false);
  }

  set data(state: MouseEventsState) {
    this.cleanup();
    this.state = state;
  }

  private cleanup(): void {
    if (this.state) {
      this.state.model = null;
      if (this.state.scale) {
        this.state.scale.x = null;
        this.state.scale.y = null;
      }
      this.state.scale = null;
    }
    this.state = null;
  }
}

export const collidesLabel = (mouseCartesian: Coord,
                              mousePolar: PolarCoord,
                              onArcCollision: CollisionIndicator<DefaultArcObject, PolarCoord>,
                              onRectCollision: CollisionIndicator<ClientRect, Coord>,
                              textMetricsResolver: TextMetricsResolver) => {
  return (label: LabelRenderModel): boolean => {
    const { anglesInRadians, distance, position, style } = label.label;
    const textRect: ClientRect = textMetricsResolver.applyStyles(label.label);
    const { height: textHeight } = textRect;
    let collisionState: CollisionState = CollisionStates.NO_HIT;
    switch (label.type) {
      case LabelTypes.TEXT:
        collisionState = onRectCollision(textRect, mouseCartesian);
        break;
      case LabelTypes.PATH:
        if (anglesInRadians) {
          const halfTextHeight = textHeight / 2;
          const textArc: DefaultArcObject = {
            anglesInRadians: anglesInRadians.path,
            radii: {
              inner: distance - halfTextHeight,
              outer: distance + halfTextHeight,
            },
          };
          collisionState = onArcCollision(textArc, mousePolar);
        }
        break;
      default:
        break;
    }
    return collisionState === CollisionStates.HIT;
  };
};

export const collidesRect: CollisionIndicator<ClientRect, Coord> = (model: ClientRect, coord: Coord) => {
  const { bottom, left, right, top } = model;
  const hitsWidth = left <= coord.x && coord.x <= right;
  const hitsHeight = bottom >= coord.y && coord.y >= top;
  return hitsHeight && hitsWidth ? CollisionStates.HIT : CollisionStates.NO_HIT;
};

export const collidesArc: (angleLimits: Location) => CollisionIndicator<DefaultArcObject, PolarCoord> =
  (angleLimits: Location) => {
  return (model, coord) => {
    const { angleInRadians, radius } = coord;
    const { anglesInRadians, radii } = model;
    const { inner: innerRadius, outer: outerRadius } = radii;
    const { start: startAngle, end: endAngle } = anglesInRadians;
    const crossesOver = startAngle > endAngle;
    let hitsArc = false;
    const hitsRadii = innerRadius <= radius && radius <= outerRadius;
    if (crossesOver) {
      hitsArc = (startAngle <= angleInRadians && angleInRadians <= angleLimits.end) ||
                (angleLimits.start <= angleInRadians && angleInRadians <= endAngle);
    } else {
      hitsArc = startAngle <= angleInRadians && angleInRadians <= endAngle;
    }
    return hitsRadii && hitsArc ? CollisionStates.HIT : CollisionStates.NO_HIT;
  };
};
