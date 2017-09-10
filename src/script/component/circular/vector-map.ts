import { ScaleLinear } from 'd3-scale';
import { scaleLinear, deepClone } from '../util';
import {
  VectorMap,
  VectorMapDisplayConfig,
  AxisTickConfig,
  Renderable,
  Location,
  Track,
  Marker,
  Axis,
  Label
} from '../models';
import { TrackComponent } from './track';
import { LabelComponent } from './label';

const trackRenderer: TrackComponent = new TrackComponent();
const labelRenderer: LabelComponent = new LabelComponent();

export class VectorMapComponent implements Renderable<VectorMap, VectorMapDisplayConfig> {

  public draw(canvas: HTMLCanvasElement, model: VectorMap): Promise<boolean> {
    model = deepClone(model);
    const range: Location = model.sequenceConfig.range;
    const scale: ScaleLinear<number, number> =
      scaleLinear().domain([range.start, range.end]).range([0, Math.PI * 2]);
    model.tracks.forEach((track: Track) => {
      if (track.markers) {
        track.markers.forEach((marker: Marker) => {
          marker.displayConfig.distance = track.displayConfig.distance;
          if (marker.labels) {
             marker.labels.forEach((label: Label) => {
              label.location = marker.location;
              label.displayConfig.distance = track.displayConfig.distance;
            });
          }
        });
      }
      if (track.axes) {
        track.axes.forEach((axis: Axis) => {
          const axisDistCenter: number = axis.displayConfig.distance +
            track.displayConfig.distance;
          axis.location = model.sequenceConfig.range;
          axis.displayConfig.distance = axisDistCenter;
          const ticks: Array<AxisTickConfig> = axis.displayConfig.scales || [];
          ticks.forEach((tick: AxisTickConfig) => {
            if (tick.label) {
              tick.label.distance = (tick.label.distance || 0) + axisDistCenter;
            }
          });
        });
      }
    });
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    context.translate(canvas.width / 2, canvas.height / 2);
    return this.render(model, scale, context);
  }

  public render(model: VectorMap, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    return new Promise((rootResolve: (success: boolean) => void) => {
      const trackPromises: Array<Promise<boolean>> = model.tracks.map((track: Track) => {
        return new Promise((resolve: (success: boolean) => void) => {
          requestAnimationFrame(() => {
            context.save();
            trackRenderer.render(track, scale, context);
            context.restore();
            resolve(true);
          });
        });
      });
      Promise.all(trackPromises).then(() => {
        model.tracks.forEach((track: Track) => {
          track.markers.forEach((marker: Marker) => {
            if (marker.labels) {
              context.save();
              marker.labels.forEach((label: Label) =>
                labelRenderer.render(label, scale, context));
              context.restore();
            }
          });
        });
        rootResolve(true);
      });
    });
  }
}