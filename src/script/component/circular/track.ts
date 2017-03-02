import { ScaleLinear } from 'd3-scale';
import { DefaultArcObject } from 'd3-shape';
import { arc, pathDraw } from '../util';
import { Renderable, Track, TrackDisplayConfig, Marker, Axis } from '../models';
import { MarkerComponent } from './marker';
import { AxisComponent } from './axis';

const defaultStyle: string = 'stroke: black; fill: white;';
const markerRenderer: MarkerComponent = new MarkerComponent();
const axisRenderer: AxisComponent = new AxisComponent();

export class TrackComponent implements Renderable<Track, TrackDisplayConfig> {

  public render(model: Track, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    const displayConfig: TrackDisplayConfig = model.displayConfig;
    const halfWidth: number = displayConfig.width / 2;
    const style: string = displayConfig.style || defaultStyle;
    const arcConfig: DefaultArcObject = {
      innerRadius: displayConfig.distance - halfWidth,
      outerRadius: displayConfig.distance + halfWidth,
      startAngle: 0,
      endAngle: Math.PI * 2,
      padAngle: null,
    };
    context.beginPath();
    arc().context(context)(arcConfig);
    context.closePath();
    pathDraw(context, style);
    context.save();
    model.markers.forEach((marker: Marker) => {
      markerRenderer.render(marker, scale, context);
    });
    context.restore();
    if (model.axes) {
      context.save();
      model.axes.forEach((axis: Axis) => {
        axisRenderer.render(axis, scale, context);
      });
      context.restore();
    }
    return Promise.resolve(true);
  }

}