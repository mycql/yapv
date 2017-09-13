import { ScaleLinear } from 'd3-scale';
import { scaleLinear, deepClone } from '../util';
import {
  VectorMap,
  VectorMapDisplayConfig,
  AxisTickConfig,
  Renderable,
  RenderWithLabelsResult,
  Location,
  Track,
  Marker,
  Axis,
  Label
} from '../models';
import renderTrack from './track';

function normalizeMarkerConfig(trackDistance: number): (marker: Marker) => void {
  return (marker: Marker) => {
    marker.displayConfig.distance = trackDistance;
    if (marker.labels) {
       marker.labels.forEach((label: Label) => {
        label.location = marker.location;
        label.displayConfig.distance = trackDistance;
      });
    }
  };
}

function normalizeAxisConfig(trackDistance: number, range: Location): (axis: Axis) => void {
  return (axis: Axis) => {
    const axisDistCenter: number = axis.displayConfig.distance + trackDistance;
    axis.location = range;
    axis.displayConfig.distance = axisDistCenter;
    const ticks: Array<AxisTickConfig> = axis.displayConfig.scales || [];
    ticks.forEach((tick: AxisTickConfig) => {
      if (tick.label) {
        tick.label.distance = (tick.label.distance || 0) + axisDistCenter;
      }
    });
  };
}

function normalizeTrackConfig(range: Location): (track: Track) => void {
  return (track: Track) => {
    const distance: number = track.displayConfig.distance;
    if (track.markers) {
      track.markers.forEach(normalizeMarkerConfig(distance));
    }
    if (track.axes) {
      track.axes.forEach(normalizeAxisConfig(distance, range));
    }
  };
}

export class VectorMapComponent implements Renderable<VectorMap, VectorMapDisplayConfig, boolean> {

  public draw(canvas: HTMLCanvasElement, model: VectorMap): Promise<boolean> {
    model = deepClone(model);
    const range: Location = model.sequenceConfig.range;
    const scale: ScaleLinear<number, number> = scaleLinear().domain([range.start, range.end])
                                                            .range([0, Math.PI * 2]);
    model.tracks.forEach(normalizeTrackConfig(range));
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    context.translate(canvas.width / 2, canvas.height / 2);
    return this.render(model, scale, context);
  }

  public render(model: VectorMap, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    return new Promise((rootResolve: (status: boolean) => void) => {
      const tracksRenderedResults: Array<Promise<RenderWithLabelsResult>> = model.tracks.map((track: Track) => {
        return new Promise((resolve: (result: Promise<RenderWithLabelsResult>) => void) => {
          requestAnimationFrame(() => {
            context.save();
            const result: Promise<RenderWithLabelsResult> =
              renderTrack(track, scale, context);
            context.restore();
            resolve(result);
          });
        });
      });
      Promise.all(tracksRenderedResults).then((results: Array<RenderWithLabelsResult>) => {
        const labelsRenderedResult: Array<Promise<boolean>> =
          results.filter((result: RenderWithLabelsResult) => typeof result.renderLabels === 'function')
                 .map((result: RenderWithLabelsResult) => result.renderLabels());
        Promise.all(labelsRenderedResult).then(() => rootResolve(true));
      });
    });
  }
}