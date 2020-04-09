import {
  Axis as AxisCore,
  Label as LabelCore,
  Location,
  Marker as MarkerCore,
  NormalizedComponentModel,
  Track as TrackCore,
  VectortMapDataNormalizer,
  VectorMapLayoutProvider,
  VectorMapLayoutProviderMaker,
} from '../../models/types';

import { AnnulusRenderModel, AxisRenderModel, ScaleRenderModel, TickRenderModel} from './axis';
import { ConnectorRenderModel, LabelRenderModel, TextRenderModel } from './label';
import { MarkerRenderModel } from './marker';
import { TrackRenderModel } from './track';

export type DataComponentModel = NormalizedComponentModel<Track, Axis, Marker, Label>;

export type DataNormalizer = VectortMapDataNormalizer<
  TrackRenderModel,
  AxisRenderModel,
  MarkerRenderModel,
  LabelRenderModel,
  Track,
  Axis,
  Marker,
  Label
>;

export type LayoutProvider = VectorMapLayoutProvider<
  TrackRenderModel,
  AxisRenderModel,
  MarkerRenderModel,
  LabelRenderModel
>;

export type LayoutProviderMaker = VectorMapLayoutProviderMaker<
  TrackRenderModel,
  AxisRenderModel,
  MarkerRenderModel,
  LabelRenderModel
>;

export type Track = {
  layout: LayoutProvider;
  range?: Location;
} & TrackCore<LayoutProvider>;

export type Marker = {
  layout: LayoutProvider;
} & MarkerCore<LayoutProvider>;

export type Axis = {
  layout: LayoutProvider;
} & AxisCore<LayoutProvider>;

export type Label = {
  layout: LayoutProvider;
  canvasContext: () => CanvasRenderingContext2D;
} & LabelCore<LayoutProvider>;

export {
  AnnulusRenderModel,
  AxisRenderModel,
  ScaleRenderModel,
  TickRenderModel,
  ConnectorRenderModel,
  LabelRenderModel,
  TextRenderModel,
  MarkerRenderModel,
  TrackRenderModel,
};
