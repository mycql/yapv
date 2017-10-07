import { ScaleLinear } from 'd3-scale';
import {
  pathDraw,
  toCartesianCoords,
  normalizeToCanvas,
  squared
} from '../util';
import {
  RenderableWithLabels,
  RenderWithLabelsResult,
  Marker,
  Label,
  MarkerDisplayConfig,
  AnchorDisplayConfig,
  Location,
  Direction,
  Directions,
  Coord
} from '../models';

import renderLabel from './label';

const defaultStyle: string = 'stroke: black; fill: gray;';

function computeAnchorAngle(radius: number, halfAnchorHeight: number, anchorWidth: number): number {
  const angleOppositeWidth: number = Math.sqrt(squared(anchorWidth) - squared(halfAnchorHeight));
  const halfAngle: number = Math.asin((angleOppositeWidth / 2) / radius);
  return halfAngle * 2;
}

function renderLabels(model: Marker, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
  if (model.labels) {
    context.save();
    model.labels.forEach((label: Label) =>
      renderLabel(label, scale, context));
    context.restore();
  }
  return Promise.resolve(true);
}

export class MarkerComponent implements RenderableWithLabels<Marker, MarkerDisplayConfig> {

  public render(model: Marker, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<RenderWithLabelsResult> {
    const centerX: number = 0, centerY: number = 0;
    const displayConfig: MarkerDisplayConfig = model.displayConfig;
    const anchorConfig: AnchorDisplayConfig = displayConfig.anchor;
    const direction: Direction = model.direction || Directions.NONE;
    const location: Location = model.location;
    const halfWidth: number = displayConfig.width / 2;
    const style: string = displayConfig.style || defaultStyle;
    const arcMidRadius: number = displayConfig.distance;
    const arcInnerRad: number = arcMidRadius - halfWidth;
    const arcOuterRad: number = arcMidRadius + halfWidth;
    const halfAnchorHeight: number = anchorConfig ? anchorConfig.height / 2 : halfWidth;
    let arcStartRad: number = normalizeToCanvas(scale(location.start));
    let arcEndRad: number = normalizeToCanvas(scale(location.end));
    let anchorCoords: Array<Array<Coord>> = [];
    let offsetRad: number = 0,
        anchorStartRad: number = 0,
        anchorEndRad: number = 0;

    if (anchorConfig && direction !== Directions.NONE) {
      offsetRad = computeAnchorAngle(arcMidRadius, halfAnchorHeight, anchorConfig.width);
    }
    switch (direction) {
      case Directions.FORWARD:
        anchorStartRad = arcEndRad - offsetRad;
        anchorEndRad = arcEndRad;
        arcEndRad = anchorStartRad;
        anchorCoords.push(
          [
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, arcStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, arcStartRad)
          ],
          [
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, anchorStartRad)
          ]
        );
        break;
      case Directions.REVERSE:
        anchorStartRad = arcStartRad;
        anchorEndRad = arcStartRad + offsetRad;
        arcStartRad = anchorEndRad;
        anchorCoords.push(
          [
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, anchorEndRad),
          ],
          [
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, arcEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, arcEndRad)
          ]
        );
        break;
      case Directions.BOTH:
        anchorStartRad = arcStartRad;
        anchorEndRad = arcStartRad + offsetRad;
        arcStartRad = anchorEndRad;
        anchorCoords.push(
          [
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, anchorEndRad),
          ]
        );
        arcStartRad = anchorEndRad;
        anchorStartRad = arcEndRad - offsetRad;
        anchorEndRad = arcEndRad;
        arcEndRad = anchorStartRad;
        anchorCoords.push(
          [
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, anchorStartRad)
          ]
        );
        break;
      case Directions.NONE:
      default:
        anchorCoords.push(
          [
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, arcStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, arcStartRad)
          ],
          [
            toCartesianCoords(centerX, centerY, arcMidRadius - halfWidth, arcEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius + halfWidth, arcEndRad)
          ]
        );
        break;
    }

    context.beginPath();
    anchorCoords.forEach((coords: Array<Coord>, index: number) => {
      coords.forEach((coord: Coord) => {
        context.lineTo(coord.x, coord.y);
      });
      if (index === 0) {
        context.arc(centerX, centerY, arcInnerRad, arcStartRad, arcEndRad);
      } else {
        context.arc(centerX, centerY, arcOuterRad, arcEndRad, arcStartRad, true);
      }
    });
    pathDraw(context, style);

    const result: RenderWithLabelsResult = {
      status: true,
      renderLabels: (): Promise<boolean> => renderLabels(model, scale, context)
    };
    return Promise.resolve(result);
  }
}

export default MarkerComponent.prototype.render;