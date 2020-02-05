import {
  ComponentRenderer,
  DataToComponentModelFn,
  InHouseVectorMapRenderer,
  StringKeyValMap,
  TextMeasurer,
  VectorMap,
} from '../../../core/src/models';
import { resolveTextStyle, updateContextStyle } from '../../../core/src/util';
import { preserveAspectRatio } from './common';

import {
  AxisAndLabels,
  AxisRenderModel,
  LabelRenderModel,
  MapRenderModel,
  MarkerAndLabels,
  MarkerRenderModel,
  TrackRenderModel,
  TrackRenderModelComponents,
} from '../../../core/src/transformer/circular/types';

import renderTrack from './track';
import renderMarker from './marker';
import renderAxis from './axis';
import renderLabel from './label';

type ComponentObjectRenderer = ComponentRenderer<object, CanvasRenderingContext2D, boolean>;

type ModelRendererPair = {
  render: ComponentObjectRenderer;
  models: object[];
};

export type OrderedModels = {
  tracks: TrackRenderModel[];
  axes: AxisRenderModel[];
  markers: MarkerRenderModel[];
  labels: LabelRenderModel[];
};

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

function pairRendererWithModels(orderedModels: OrderedModels): ModelRendererPair[] {
  const renderPairs: ModelRendererPair[] = [
    {
      render: renderTrack as ComponentObjectRenderer,
      models: orderedModels.tracks,
    },
    {
      render: renderAxis as ComponentObjectRenderer,
      models: orderedModels.axes,
    },
    {
      render: renderMarker as ComponentObjectRenderer,
      models: orderedModels.markers,
    },
    {
      render: renderLabel as ComponentObjectRenderer,
      models: orderedModels.labels,
    },
  ];
  return renderPairs;
}

function canvasContextTextMeasurer(context: CanvasRenderingContext2D): TextMeasurer {
  return (text: string, style: StringKeyValMap) => {
    context.save();
    updateContextStyle(context, style, resolveTextStyle);
    const size: number = context.measureText(text).width;
    context.restore();
    return size;
  };
}

const render: InHouseVectorMapRenderer<MapRenderModel> = {
  key: 'circular',
  createRenderer: (transform: DataToComponentModelFn<MapRenderModel>) => {
    return (container: HTMLElement) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      container.appendChild(canvas);
      return (model: VectorMap): Promise<boolean> => {
        if (!context) {
          return Promise.resolve(false);
        }
        let { displayConfig } = model;
        displayConfig = {
          ...{
            viewBox: {
              height: displayConfig.width,
              width: displayConfig.width,
            },
          },
          ...displayConfig,
        };
        displayConfig.viewBox = preserveAspectRatio(displayConfig,
          displayConfig.viewBox, 'xMidYMid meet').dest;
        const { viewBox, width: viewWidth, height: viewHeight } = displayConfig;
        const { width, height } = viewBox;
        canvas.setAttribute('width', `${width}`);
        canvas.setAttribute('height', `${height}`);
        canvas.style.width = `${viewWidth}px`;
        canvas.style.height = `${viewHeight}px`;
        const x: number = width / 2;
        const y: number = height / 2;

        context.save();
        context.translate(x, y);
        context.clearRect(-x, -y, width, height);

        const measureText: TextMeasurer = canvasContextTextMeasurer(context);
        const renderModel: MapRenderModel = transform(model, measureText);
        const orderedModels: OrderedModels = orderModels(renderModel);
        const renderPairs: ModelRendererPair[] = pairRendererWithModels(orderedModels);

        renderPairs.forEach((renderPair: ModelRendererPair) => {
          renderPair.models.forEach((toRender: object) => {
            renderPair.render(toRender, context);
          });
        });

        context.restore();
        return Promise.resolve(true);
      };
    };
  },
};

export default render;
