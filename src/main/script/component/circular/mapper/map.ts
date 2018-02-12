import {
  Axis,
  AxisTickConfig,
  Label,
  Location,
  Marker,
  ScaleLinear,
  Track,
  VectorMap,
} from '../../models';
import { scaleLinear, deepClone, withAxisOffset } from '../../util';
import { TrackRenderModel } from './track';
import { MarkerRenderModel } from './marker';
import { AxisRenderModel } from './axis';
import { LabelRenderModel, TextMeasurer } from './label';
import mapTrack from './track';
import mapMarker from './marker';
import mapLabel from './label';
import mapAxis from './axis';

export type MarkerAndLabels = {
  marker: MarkerRenderModel;
  labels: LabelRenderModel[];
};

export type AxisAndLabels = {
  axis: AxisRenderModel;
  labels: LabelRenderModel[];
};

export type TrackRenderModelComponents = {
  track: TrackRenderModel;
  markers: MarkerAndLabels[];
  axes?: AxisAndLabels[];
};

export type MapRenderModel = {
  tracks: TrackRenderModelComponents[];
  labels: LabelRenderModel[];
};

export type OrderedModels = {
  tracks: TrackRenderModel[];
  axes: AxisRenderModel[];
  markers: MarkerRenderModel[];
  labels: LabelRenderModel[];
};

function arrayOrEmpty<T>(array: T[] | undefined): T[] {
  return array || [];
}

function toMarkerModels(markers: Marker[],
                        scale: ScaleLinear<number, number>,
                        measure: TextMeasurer,
                        trackDistance: number): MarkerAndLabels[] {
  return arrayOrEmpty(markers).map((marker: Marker) => {
    marker.displayConfig.distance = trackDistance;
    const markerModel: MarkerRenderModel = mapMarker(marker, scale);
    const labelModels: LabelRenderModel[] = arrayOrEmpty(marker.labels).map((label: Label) => {
      label.location = marker.location;
      label.displayConfig.distance = trackDistance;
      return mapLabel(label, scale, measure);
    });
    return { marker: markerModel, labels: labelModels };
  });
}

function toAxisModels(axes: Axis[] | undefined,
                      range: Location,
                      scale: ScaleLinear<number, number>,
                      measure: TextMeasurer,
                      trackDistance: number): AxisAndLabels[] {
  return arrayOrEmpty(axes).map((axis: Axis) => {
    axis.location = range;
    axis.displayConfig.distance += trackDistance;
    axis.displayConfig.scales.forEach((axisTickConfig: AxisTickConfig) => {
      const { label: labelConfig }: AxisTickConfig = axisTickConfig;
      labelConfig.distance = (labelConfig.distance || 0) + axis.displayConfig.distance;
    });
    const axisModel: AxisRenderModel = mapAxis(axis, scale, measure);
    const labelModels: LabelRenderModel[] = axisModel.labels.map((labels: Label[]) => {
      return labels.map((label: Label) => {
        return mapLabel(label, scale, measure);
      });
    }).reduce((acc: LabelRenderModel[], next: LabelRenderModel[]) => acc.concat(next), []);
    return { axis: axisModel, labels: labelModels };
  });
}

export function orderModels(renderModel: MapRenderModel): OrderedModels {
  const orderedModels: OrderedModels = {
    axes: [], labels: [], markers: [], tracks: [],
  };
  renderModel.tracks.reduce((acc: OrderedModels, trackComponents: TrackRenderModelComponents) => {
    acc.tracks.push(trackComponents.track);
    trackComponents.markers.forEach((markerAndLabels: MarkerAndLabels) => {
      acc.markers.push(markerAndLabels.marker);
      acc.labels = acc.labels.concat(markerAndLabels.labels);
    });
    (trackComponents.axes || []).forEach((axisAndLabels: AxisAndLabels) => {
      acc.axes.push(axisAndLabels.axis);
      acc.labels = acc.labels.concat(axisAndLabels.labels);
    });
    return acc;
  }, orderedModels);
  orderedModels.labels = orderedModels.labels.concat(renderModel.labels);
  return orderedModels;
}

export default function map(model: VectorMap, measure: TextMeasurer): MapRenderModel {
  model = deepClone(model);
  const range: Location = model.sequenceConfig.range;
  const scale: ScaleLinear<number, number> = scaleLinear().domain([range.start, range.end])
    .range([withAxisOffset(0), withAxisOffset(Math.PI * 2)]);

  const trackMarkersAxes: TrackRenderModelComponents[] = arrayOrEmpty(model.tracks).map((track: Track) => {
    const trackDistance: number = track.displayConfig.distance;
    const trackModel: TrackRenderModel = mapTrack(track, scale);
    const markers: MarkerAndLabels[] = toMarkerModels(track.markers, scale, measure, trackDistance);
    const axes: AxisAndLabels[] = toAxisModels(track.axes, range, scale, measure, trackDistance);
    return { track: trackModel, markers, axes };
  });
  const mapLabels: LabelRenderModel[] = arrayOrEmpty(model.labels).map((label: Label) => {
    label.displayConfig.distance = label.displayConfig.distance || 0;
    label.location = { start: 0, end: 0 };
    return mapLabel(label, scale, measure);
  });
  return { tracks: trackMarkersAxes, labels: mapLabels };
}
