import { ScaleLinear } from 'd3-scale';
import { DefaultArcObject } from 'd3-shape';
import { arc, pathDraw } from '../util';
import { Renderable, Marker, DisplayConfig, Track, TrackDisplayConfig, Location } from '../models';

const defaultStyle: string = 'stroke: black; fill: gray;';

export class MarkerComponent implements Renderable<Marker, DisplayConfig> {

  public render(model: Marker, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    const displayConfig: DisplayConfig = model.displayConfig;
    const parent: Track = <Track>model.parent;
    const parentConfig: TrackDisplayConfig = parent.displayConfig;
    const location: Location = model.location;
    const halfWidth: number = displayConfig.width / 2;
    const style: string = displayConfig.style || defaultStyle;
    const arcConfig: DefaultArcObject = {
      innerRadius: parentConfig.distance - halfWidth,
      outerRadius: parentConfig.distance + halfWidth,
      startAngle: scale(location.start),
      endAngle: scale(location.end),
      padAngle: null,
    };
    context.beginPath();
    arc().context(context)(arcConfig);
    context.closePath();
    pathDraw(context, style);
    return Promise.resolve(true);
  }
}