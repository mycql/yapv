import { ScaleLinear } from 'd3-scale';
import { scaleLinear } from '../util';
import { VectorMap, VectorMapDisplayConfig, Renderable, Location, Track, Marker, Axis } from '../models';
import { TrackComponent } from './track';

const trackRenderer: TrackComponent = new TrackComponent();

export class VectorMapComponent implements Renderable<VectorMap, VectorMapDisplayConfig> {

  constructor(private canvas: HTMLCanvasElement) { }

  public draw(model: VectorMap): Promise<boolean> {
    const range: Location = model.sequenceConfig.range;
    const scale: ScaleLinear<number, number> =
      scaleLinear().domain([range.start, range.end]).range([0, Math.PI * 2]);
    model.tracks.forEach((track: Track) => {
      track.parent = model;
      if (track.markers) {
        track.markers.forEach((marker: Marker) => marker.parent = track);
      }
      if (track.axes) {
        track.axes.forEach((axis: Axis) => axis.parent = track);
      }
    });
    return this.render(model, scale, this.canvas.getContext('2d'));
  }

  public render(model: VectorMap, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    context.translate(this.canvas.width / 2, this.canvas.height / 2);
    model.tracks.forEach((track: Track) => {
      requestAnimationFrame(() => {
        context.save();
        trackRenderer.render(track, scale, context);
        context.restore();
      });
    });
    return Promise.resolve(true);
  }
}