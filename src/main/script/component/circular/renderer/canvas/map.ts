import {
  ComponentRenderer,
  StringKeyValMap,
  SizedDisplayConfig,
  VectorMap,
} from '../../../models';
import { updateContextStyle } from '../../../util';

import { TextMeasurer } from '../../transformer/label';
import {
  AxisAndLabels,
  MapRenderModel,
  MarkerAndLabels,
  TrackRenderModelComponents,
} from '../../transformer/map';

import { TrackRenderModel } from '../../transformer/track';
import { MarkerRenderModel } from '../../transformer/marker';
import { AxisRenderModel } from '../../transformer/axis';
import { LabelRenderModel } from '../../transformer/label';
import { OrderedModels, orderModels } from '../../transformer/map';

import translateModel from '../../transformer/map';

import renderTrack from './track';
import renderMarker from './marker';
import renderAxis from './axis';
import renderLabel from './label';

type ComponentObjectRenderer = ComponentRenderer<object, CanvasRenderingContext2D, boolean>;

type ModelRendererPair = {
  render: ComponentObjectRenderer;
  models: object[];
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
    updateContextStyle(context, style, resolveStyle);
    const size: number = context.measureText(text).width;
    context.restore();
    return size;
  };
}

export default function render(container: HTMLElement): (model: VectorMap) => Promise<boolean> {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  container.appendChild(canvas);
  return (model: VectorMap): Promise<boolean> => {
    const { width, height }: SizedDisplayConfig = model.displayConfig;
    canvas.setAttribute('width', `${width}`);
    canvas.setAttribute('height', `${height}`);
    const x: number = width / 2;
    const y: number = height / 2;

    const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!context) {
      return Promise.resolve(false);
    }
    context.save();
    context.translate(x, y);
    context.clearRect(-x, -y, width, height);

    const measureText: TextMeasurer = canvasContextTextMeasurer(context);
    const renderModel: MapRenderModel = translateModel(model, measureText);
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
}
