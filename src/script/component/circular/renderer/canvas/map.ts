import { ComponentRenderer, StringKeyValMap, VectorMap } from '../../../models';
import { TextMeasurer } from '../../mapper/label';
import { updateContextStyle } from '../../../util';
import {
  AxisAndLabels,
  MapRenderModel,
  MarkerAndLabels,
  TrackRenderModelComponents
} from '../../mapper/map';

import { TrackRenderModel } from '../../mapper/track';
import { MarkerRenderModel } from '../../mapper/marker';
import { AxisRenderModel } from '../../mapper/axis';
import { LabelRenderModel } from '../../mapper/label';

import translateModel from '../../mapper/map';

import renderTrack from './track';
import renderMarker from './marker';
import renderAxis from './axis';
import renderLabel from './label';

type OrderedModels = {
  tracks: Array<TrackRenderModel>;
  axes: Array<AxisRenderModel>;
  markers: Array<MarkerRenderModel>;
  labels: Array<LabelRenderModel>;
};

type ModelRendererPair = {
  render: ComponentRenderer<Object, CanvasRenderingContext2D, boolean>;
  models: Array<Object>;
};

function resolveStyle(styleProp: string, styleVal: string, context: CanvasRenderingContext2D): void {
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  switch (styleProp) {
    case 'font':
      context.font = styleVal;
      break;
    default:
      break;
  }
}

export default function draw(canvas: HTMLCanvasElement, model: VectorMap): Promise<boolean> {
  const { width, height }: HTMLCanvasElement = canvas;
  const x: number = width / 2;
  const y: number = height / 2;

  const context: CanvasRenderingContext2D = canvas.getContext('2d');
  context.save();
  context.translate(x, y);
  context.clearRect(-x, -y, width, height);

  const measureText: TextMeasurer = (text: string, style: StringKeyValMap) => {
    context.save();
    updateContextStyle(context, style, resolveStyle);
    const size: number = context.measureText(text).width;
    context.restore();
    return size;
  };

  const renderModel: MapRenderModel = translateModel(model, measureText);
  const orderedModels: OrderedModels = {
    axes: [], labels: [], markers: [], tracks: []
  };
  renderModel.tracks.reduce((acc: OrderedModels, trackComponents: TrackRenderModelComponents) => {
    acc.tracks.push(trackComponents.track);
    trackComponents.markers.forEach((markerAndLabels: MarkerAndLabels) => {
      acc.markers.push(markerAndLabels.marker);
      acc.labels = acc.labels.concat(markerAndLabels.labels);
    });
    trackComponents.axes.forEach((axisAndLabels: AxisAndLabels) => {
      acc.axes.push(axisAndLabels.axis);
      acc.labels = acc.labels.concat(axisAndLabels.labels);
    });
    return acc;
  }, orderedModels);
  orderedModels.labels = orderedModels.labels.concat(renderModel.labels);

  const renderPairs: Array<ModelRendererPair> = [
    {
      render: renderTrack,
      models: orderedModels.tracks
    },
    {
      render: renderMarker,
      models: orderedModels.markers
    },
    {
      render: renderAxis,
      models: orderedModels.axes
    },
    {
      render: renderLabel,
      models: orderedModels.labels
    }
  ];

  renderPairs.forEach((renderPair: ModelRendererPair) => {
    renderPair.models.forEach((toRender: Object) => {
      renderPair.render(toRender, context);
    });
  });

  context.restore();
  return Promise.resolve(true);
}