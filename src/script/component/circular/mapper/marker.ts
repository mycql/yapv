import { ScaleLinear } from 'd3-scale';
import {
  AnchorDisplayConfig,
  Coord,
  Direction,
  Directions,
  Label,
  Location,
  Marker,
  MarkerDisplayConfig,
  RenderModelMapper,
  StringKeyValMap
} from '../../models';
import {
  normalizeToCanvas,
  parseStyle,
  toCartesianCoords,
  squared
} from '../../util';
import { LabelRenderModel, TextMeasurer } from './label';
import mapLabel from './label';

const defaultStyle: string = 'stroke: black; fill: gray;';

export type MarkerRenderModel = {
  center: Coord;
  radii: {
    inner: number;
    outer: number;
  };
  anchorPositions: {
    start: Array<Coord>;
    end: Array<Coord>;
  };
  anglesInRadians: Location;
  labels: Array<LabelRenderModel>;
  style: StringKeyValMap;
};

function computeAnchorAngle(radius: number, halfAnchorHeight: number, anchorWidth: number): number {
  const angleOppositeWidth: number = Math.sqrt(squared(anchorWidth) - squared(halfAnchorHeight));
  const halfAngle: number = Math.asin((angleOppositeWidth / 2) / radius);
  return halfAngle * 2;
}

type Mapper = RenderModelMapper<Marker, MarkerDisplayConfig, MarkerRenderModel, TextMeasurer>;
const MarkerRenderMapper: Mapper = (model: Marker, scale: ScaleLinear<number, number>, measure: TextMeasurer): MarkerRenderModel => {
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
  return {
    center: {
      x: centerX,
      y: centerY
    },
    radii: {
      inner: arcInnerRad,
      outer: arcOuterRad
    },
    anchorPositions: {
      start: anchorCoords[0],
      end: anchorCoords[1]
    },
    anglesInRadians: {
      start: arcStartRad,
      end: arcEndRad
    },
    labels: model.labels.map((label: Label) =>
      mapLabel(label, scale, measure)),
    style: parseStyle(style)
  };
};

export default MarkerRenderMapper;