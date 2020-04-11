import {
  AnchorDisplayConfig,
  Coord,
  Direction,
  Location,
  Marker,
  MarkerDisplayConfig,
  ScaleLinear,
  StringKeyValMap,
} from '../../models/types';
import { RenderModelTransformer } from './types';
import { Directions, PI } from '../../models';
import {
  angleRadInBetweenSides,
  arcLength,
  arcAngleRad,
  parseStyle,
  toCartesianCoords,
  squared,
} from '../../util';

const MIN_ARC_LENGTH: number = 1;
const defaultStyle: string = 'stroke: black; fill: gray;';

export type MarkerRenderModel = {
  center: Coord;
  radii: {
    inner: number;
    outer: number;
  };
  anchorPositions: {
    start: Coord[];
    end: Coord[];
  };
  anglesInRadians: Location;
  style: StringKeyValMap;
};

function computeAnchorAngle(radius: number, halfAnchorHeight: number, anchorWidth: number): number {
  const angleOppositeWidth: number = Math.sqrt(squared(anchorWidth) - squared(halfAnchorHeight));
  const halfAngle: number = Math.asin((angleOppositeWidth / 2) / radius);
  return halfAngle * 2;
}

function arcLengthGivenSide(radius: number, width: number): number {
  return arcLength(radius, angleRadInBetweenSides(radius, radius, width));
}

type Transformer = RenderModelTransformer<Marker, MarkerDisplayConfig, MarkerRenderModel, {}>;
const MarkerModelTransformer: Transformer = (model: Marker,
                                             scale: ScaleLinear<number, number>): MarkerRenderModel => {
  const center: Coord = { x: 0, y: 0 };
  const displayConfig: MarkerDisplayConfig = model.displayConfig;
  let direction: Direction = model.direction || Directions.NONE;
  const location: Location = model.location;
  const halfWidth: number = displayConfig.width / 2;
  const styleString: string = displayConfig.style || defaultStyle;
  const style: StringKeyValMap = parseStyle(styleString);
  const arcMidRadius: number = displayConfig.distance;
  const arcInnerRad: number = arcMidRadius - halfWidth;
  const arcOuterRad: number = arcMidRadius + halfWidth;
  let anchorConfig: AnchorDisplayConfig | undefined = displayConfig.anchor;
  if (!anchorConfig && direction !== Directions.NONE) {
    anchorConfig = {
      width: displayConfig.width,
      height: displayConfig.width,
      style: styleString,
    };
  }
  const halfAnchorHeight: number = anchorConfig ? anchorConfig.height / 2 : halfWidth;
  const crossesOver: boolean = location.start > location.end;
  let arcStartRad: number = scale(location.start);
  let arcEndRad: number = scale(location.end);
  const arcDiffRad: number = crossesOver ?
    (PI.TWICE - arcStartRad) + arcEndRad : Math.abs(arcEndRad - arcStartRad);
  const arcMidRad: number = arcStartRad + (arcDiffRad / 2);
  const arcLen: number = arcLength(arcMidRadius, arcDiffRad);
  if (anchorConfig) {
    let isLessThanAnchor: boolean = false;
    switch (direction) {
      case Directions.FORWARD:
      case Directions.REVERSE:
        isLessThanAnchor = arcLen <
          arcLengthGivenSide(arcMidRadius, anchorConfig.width);
        break;
      case Directions.BOTH:
        isLessThanAnchor = arcLen <
          arcLengthGivenSide(arcMidRadius, 2 * anchorConfig.width);
        break;
      case Directions.NONE:
      default:
        break;
    }
    if (isLessThanAnchor) {
      direction = Directions.NONE;
    }
  }
  const isLessThanMin: boolean = arcLen <= MIN_ARC_LENGTH;
  if (isLessThanMin) {
    const arcLengthRad: number = arcAngleRad(arcMidRadius, MIN_ARC_LENGTH);
    arcStartRad = arcMidRad - (arcLengthRad / 2);
    arcEndRad = arcStartRad + arcLengthRad;
    direction = Directions.NONE;
  }
  const anchorCoords: Coord[][] = [];
  let offsetRad: number = 0;
  let anchorStartRad: number = 0;
  let anchorEndRad: number = 0;

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
          toCartesianCoords(center, arcMidRadius + halfWidth, arcStartRad),
          toCartesianCoords(center, arcMidRadius - halfWidth, arcStartRad),
        ],
        [
          toCartesianCoords(center, arcMidRadius - halfWidth, anchorStartRad),
          toCartesianCoords(center, arcMidRadius - halfAnchorHeight, anchorStartRad),
          toCartesianCoords(center, arcMidRadius, anchorEndRad),
          toCartesianCoords(center, arcMidRadius + halfAnchorHeight, anchorStartRad),
          toCartesianCoords(center, arcMidRadius + halfWidth, anchorStartRad),
        ],
      );
      break;
    case Directions.REVERSE:
      anchorStartRad = arcStartRad;
      anchorEndRad = arcStartRad + offsetRad;
      arcStartRad = anchorEndRad;
      anchorCoords.push(
        [
          toCartesianCoords(center, arcMidRadius + halfWidth, anchorEndRad),
          toCartesianCoords(center, arcMidRadius + halfAnchorHeight, anchorEndRad),
          toCartesianCoords(center, arcMidRadius, anchorStartRad),
          toCartesianCoords(center, arcMidRadius - halfAnchorHeight, anchorEndRad),
          toCartesianCoords(center, arcMidRadius - halfWidth, anchorEndRad),
        ],
        [
          toCartesianCoords(center, arcMidRadius - halfWidth, arcEndRad),
          toCartesianCoords(center, arcMidRadius + halfWidth, arcEndRad),
        ],
      );
      break;
    case Directions.BOTH:
      anchorStartRad = arcStartRad;
      anchorEndRad = arcStartRad + offsetRad;
      arcStartRad = anchorEndRad;
      anchorCoords.push(
        [
          toCartesianCoords(center, arcMidRadius + halfWidth, anchorEndRad),
          toCartesianCoords(center, arcMidRadius + halfAnchorHeight, anchorEndRad),
          toCartesianCoords(center, arcMidRadius, anchorStartRad),
          toCartesianCoords(center, arcMidRadius - halfAnchorHeight, anchorEndRad),
          toCartesianCoords(center, arcMidRadius - halfWidth, anchorEndRad),
        ],
      );
      arcStartRad = anchorEndRad;
      anchorStartRad = arcEndRad - offsetRad;
      anchorEndRad = arcEndRad;
      arcEndRad = anchorStartRad;
      anchorCoords.push(
        [
          toCartesianCoords(center, arcMidRadius - halfWidth, anchorStartRad),
          toCartesianCoords(center, arcMidRadius - halfAnchorHeight, anchorStartRad),
          toCartesianCoords(center, arcMidRadius, anchorEndRad),
          toCartesianCoords(center, arcMidRadius + halfAnchorHeight, anchorStartRad),
          toCartesianCoords(center, arcMidRadius + halfWidth, anchorStartRad),
        ],
      );
      break;
    case Directions.NONE:
    default:
      anchorCoords.push(
        [
          toCartesianCoords(center, arcMidRadius + halfWidth, arcStartRad),
          toCartesianCoords(center, arcMidRadius - halfWidth, arcStartRad),
        ],
        [
          toCartesianCoords(center, arcMidRadius - halfWidth, arcEndRad),
          toCartesianCoords(center, arcMidRadius + halfWidth, arcEndRad),
        ],
      );
      break;
  }
  return {
    style,
    center,
    radii: {
      inner: arcInnerRad,
      outer: arcOuterRad,
    },
    anchorPositions: {
      start: anchorCoords[0],
      end: anchorCoords[1],
    },
    anglesInRadians: {
      start: arcStartRad,
      end: arcEndRad,
    },
  };
};

export default MarkerModelTransformer;
