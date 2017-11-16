import { ScaleLinear } from 'd3-scale';
import {
  Axis,
  AxisTickConfig,
  Label,
  Location,
  Marker,
  Track,
  VectorMap
} from '../../models';
import { scaleLinear, deepClone } from '../../util';
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
  labels: Array<LabelRenderModel>;
};

export type AxisAndLabels = {
  axis: AxisRenderModel;
  labels: Array<LabelRenderModel>;
};

export type TrackRenderModelComponents = {
  track: TrackRenderModel;
  markers: Array<MarkerAndLabels>;
  axes?: Array<AxisAndLabels>;
};

export type MapRenderModel = {
  tracks: Array<TrackRenderModelComponents>;
  labels: Array<LabelRenderModel>;
};

function arrayOrEmpty<T>(array: Array<T>): Array<T> {
  return array || [];
}

function toMarkerModels(markers: Array<Marker>,
                        scale: ScaleLinear<number, number>,
                        measure: TextMeasurer,
                        trackDistance: number): Array<MarkerAndLabels> {
  return arrayOrEmpty(markers).map((marker: Marker) => {
    marker.displayConfig.distance = trackDistance;
    const markerModel: MarkerRenderModel = mapMarker(marker, scale);
    const labelModels: Array<LabelRenderModel> = arrayOrEmpty(marker.labels).map((label: Label) => {
      label.location = marker.location;
      label.displayConfig.distance = trackDistance;
      return mapLabel(label, scale, measure);
    });
    return { marker: markerModel, labels: labelModels };
  });
}

function toAxisModels(axes: Array<Axis>,
                      range: Location,
                      scale: ScaleLinear<number, number>,
                      measure: TextMeasurer,
                      trackDistance: number): Array<AxisAndLabels> {
  return arrayOrEmpty(axes).map((axis: Axis) => {
    axis.location = range;
    axis.displayConfig.distance += trackDistance;
    axis.displayConfig.scales.forEach((axisTickConfig: AxisTickConfig) => {
      const { label: labelConfig }: AxisTickConfig = axisTickConfig;
      labelConfig.distance = (labelConfig.distance || 0) + axis.displayConfig.distance;
    });
    const axisModel: AxisRenderModel = mapAxis(axis, scale, measure);
    const labelModels: Array<LabelRenderModel> = axisModel.labels.map((labels: Array<Label>) => {
      return labels.map((label: Label) => {
        return mapLabel(label, scale, measure);
      });
    }).reduce((acc: Array<LabelRenderModel>, next: Array<LabelRenderModel>) => acc.concat(next), []);
    return { axis: axisModel, labels: labelModels };
  });
}

export default function map(model: VectorMap, measure: TextMeasurer): MapRenderModel {
  model = deepClone(model);
  const range: Location = model.sequenceConfig.range;
  const scale: ScaleLinear<number, number> = scaleLinear().domain([range.start, range.end])
                                                          .range([0, Math.PI * 2]);

  const trackMarkersAxes: Array<TrackRenderModelComponents> = arrayOrEmpty(model.tracks).map((track: Track) => {
    const trackDistance: number = track.displayConfig.distance;
    const trackModel: TrackRenderModel = mapTrack(track, scale);
    const markers: Array<MarkerAndLabels> = toMarkerModels(track.markers, scale, measure, trackDistance);
    const axes: Array<AxisAndLabels> = toAxisModels(track.axes, range, scale, measure, trackDistance);
    return { track: trackModel, markers, axes };
  });
  const mapLabels: Array<LabelRenderModel> = arrayOrEmpty(model.labels).map((label: Label) => {
    label.displayConfig.distance = label.displayConfig.distance || 0;
    label.location = { start: 0, end: 0 };
    return mapLabel(label, scale, measure);
  });
  return { tracks: trackMarkersAxes, labels: mapLabels };
}