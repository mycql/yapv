import { ScaleLinear } from 'd3-scale';
import { DefaultArcObject, line} from 'd3-shape';
import { arc, pathDraw, toCartesianCoords } from '../util';
import {
  Renderable,
  Marker,
  MarkerDisplayConfig,
  AnchorDisplayConfig,
  Location,
  Direction,
  Directions,
  Coord
} from '../models';

const defaultStyle: string = 'stroke: black; fill: gray;';

function computeAnchorAngle(radius: number, halfAnchorHeight: number, anchorWidth: number): number {
  const angleOppositeWidth: number = Math.sqrt(Math.pow(anchorWidth, 2) - Math.pow(halfAnchorHeight, 2));
  const halfAngle: number = Math.asin((angleOppositeWidth / 2) / radius);
  return halfAngle * 2;
}

export class MarkerComponent implements Renderable<Marker, MarkerDisplayConfig> {

  public render(model: Marker, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
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
    let arcStartRad: number = scale(location.start);
    let arcEndRad: number = scale(location.end);
    if (anchorConfig && direction !== Directions.NONE) {
      const halfAnchorHeight: number = anchorConfig.height / 2;
      let anchorCoords: Array<Array<Coord>> = [];
      let offsetRad: number = 0,
          anchorStartRad: number = 0,
          anchorEndRad: number = 0;

      offsetRad = computeAnchorAngle(arcMidRadius, halfAnchorHeight, anchorConfig.width);

      switch (direction) {
        case Directions.FORWARD:
          anchorStartRad = arcEndRad - offsetRad;
          anchorEndRad = arcEndRad;
          arcEndRad = anchorStartRad;
          anchorCoords.push([
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorStartRad)
          ]);
          break;
        case Directions.REVERSE:
          anchorStartRad = arcStartRad;
          anchorEndRad = arcStartRad + offsetRad;
          arcStartRad = anchorEndRad;
          anchorCoords.push([
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorEndRad)
          ]);
          break;
        case Directions.BOTH:
          arcEndRad = arcEndRad - offsetRad;
          arcStartRad = arcStartRad + offsetRad;
          anchorStartRad = arcEndRad;
          anchorEndRad = arcEndRad + offsetRad;
          anchorCoords.push([
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorStartRad)
          ]);
          anchorStartRad = arcStartRad;
          anchorEndRad = arcStartRad - offsetRad;
          anchorCoords.push([
            toCartesianCoords(centerX, centerY, arcMidRadius + halfAnchorHeight, anchorStartRad),
            toCartesianCoords(centerX, centerY, arcMidRadius, anchorEndRad),
            toCartesianCoords(centerX, centerY, arcMidRadius - halfAnchorHeight, anchorStartRad)
          ]);
          break;
        case Directions.NONE:
        default:
          break;
      }
      context.beginPath();
      anchorCoords.forEach((coords: Array<Coord>) => {
        line<Coord>().x((coord: Coord) => coord.x)
                     .y((coord: Coord) => coord.y)
                     .context(context)(coords);
      });
      pathDraw(context, style);
    }

    const arcConfig: DefaultArcObject = {
      startAngle: arcStartRad,
      endAngle: arcEndRad,
      innerRadius: arcInnerRad,
      outerRadius: arcOuterRad,
      padAngle: null
    };
    context.beginPath();
    arc().context(context)(arcConfig);
    context.closePath();
    pathDraw(context, style);

    return Promise.resolve(true);
  }
}