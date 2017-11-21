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
  Label,
} from '../models';

import renderTrack from './track';
import renderLabel from './label';

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
    const ticks: AxisTickConfig[] = axis.displayConfig.scales || [];
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

function normalizeMapLabelConfig(label: Label): void {
  label.displayConfig.distance = label.displayConfig.distance || 0;
  label.location = { start: 0, end: 0 };
}

function renderSymbols(model: VectorMap,
                       scale: ScaleLinear<number, number>,
                       context: CanvasRenderingContext2D): Promise<RenderWithLabelsResult[]> {
  return Promise.all(model.tracks.map((track: Track) => {
    return new Promise((resolve: (result: Promise<RenderWithLabelsResult>) => void) => {
      requestAnimationFrame(() => {
        context.save();
        const result: Promise<RenderWithLabelsResult> =
          renderTrack(track, scale, context);
        context.restore();
        resolve(result);
      });
    });
  }));
}

function renderLabels(model: VectorMap,
                      scale: ScaleLinear<number, number>,
                      context: CanvasRenderingContext2D): (results: RenderWithLabelsResult[]) => Promise<boolean> {
  return (results: RenderWithLabelsResult[]) => {
    const renderResults: Array<Promise<boolean>> =
      results.filter((result: RenderWithLabelsResult) => typeof result.renderLabels === 'function')
             .map((result: RenderWithLabelsResult) => result.renderLabels())
             .concat((model.labels || []).map((label: Label) => renderLabel(label, scale, context)));
    return new Promise((resolve: (status: boolean) => void) =>  {
      Promise.all(renderResults).then(() => resolve(true));
    });
  };
}

export class VectorMapComponent implements Renderable<VectorMap, VectorMapDisplayConfig, boolean> {

  public draw(canvas: HTMLCanvasElement, model: VectorMap): Promise<boolean> {
    model = deepClone(model);
    const { width, height }: HTMLCanvasElement = canvas;
    const x: number = width / 2;
    const y: number = height / 2;
    const range: Location = model.sequenceConfig.range;
    const scale: ScaleLinear<number, number> = scaleLinear().domain([range.start, range.end])
                                                            .range([0, Math.PI * 2]);
    (model.tracks || []).forEach(normalizeTrackConfig(range));
    (model.labels || []).forEach(normalizeMapLabelConfig);
    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!context) {
      return Promise.resolve(false);
    }
    context.save();
    context.translate(x, y);
    context.clearRect(-x, -y, width, height);
    return new Promise((resolve: (status: boolean) => void) => {
      this.render(model, scale, context).then(() => {
        context.restore();
        resolve(true);
      });
    });
  }

  public render(model: VectorMap,
                scale: ScaleLinear<number, number>,
                context: CanvasRenderingContext2D): Promise<boolean> {
    return new Promise((rootResolve: (status: boolean) => void) => {
      renderSymbols(model, scale, context)
        .then(renderLabels(model, scale, context))
        .then(rootResolve);
    });
  }
}
