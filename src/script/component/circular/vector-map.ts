import { ScaleLinear } from 'd3-scale';
import { scaleLinear } from '../util';
import {
  VectorMap,
  VectorMapDisplayConfig,
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

  constructor(private canvas: HTMLCanvasElement) { }

  public draw(model: VectorMap): Promise<boolean> {
    const range: Location = model.sequenceConfig.range;
    const scale: ScaleLinear<number, number> =
      scaleLinear().domain([range.start, range.end]).range([0, Math.PI * 2]);
    model.tracks.forEach((track: Track) => {
      track.parent = model;
      if (track.markers) {
        track.markers.forEach((marker: Marker) => {
          marker.parent = track;
          if (marker.labels) {
            marker.labels.forEach((label: Label) => label.parent = marker);
          }
        });
      }
      if (track.axes) {
        track.axes.forEach((axis: Axis) => axis.parent = track);
      }
    });
    return this.render(model, scale, this.canvas.getContext('2d'));
  }

  public render(model: VectorMap, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    return new Promise((rootResolve: (success: boolean) => void) => {
      context.translate(this.canvas.width / 2, this.canvas.height / 2);
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