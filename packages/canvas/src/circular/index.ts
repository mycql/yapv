import {
  ComponentRenderer,
  DataToComponentModelFn,
  InHouseVectorMapRenderer,
  TextMeasurer,
  VectorMap,
} from '../core/models/types';

import {
  Axis,
  AxisAndLabels,
  AxisRenderModel,
  Label,
  LabelRenderModel,
  LayoutProvider,
  LayoutProviderMaker,
  MapRenderModel,
  Marker,
  MarkerAndLabels,
  MarkerRenderModel,
  Track,
  TrackRenderModel,
  TrackRenderModelComponents,
} from '../core/transformer/circular/types';

import { arrayOrEmpty, canvasContextTextMeasurer, withDefaultViewBoxIfNotPresent } from '../core/util';
import { preserveAspectRatio } from './common';

import trackRender, { render as renderTrack } from './track';
import markerRender, { render as renderMarker } from './marker';
import axisRender, { render as renderAxis } from './axis';
import labelRender, { render as renderLabel } from './label';
import renderMap from './map';

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
      render: trackRender as ComponentObjectRenderer,
      models: orderedModels.tracks,
    },
    {
      render: axisRender as ComponentObjectRenderer,
      models: orderedModels.axes,
    },
    {
      render: markerRender as ComponentObjectRenderer,
      models: orderedModels.markers,
    },
    {
      render: labelRender as ComponentObjectRenderer,
      models: orderedModels.labels,
    },
  ];
  return renderPairs;
}

type GroupedComponentConfig = {
  tracks: Track[];
  axes: Axis[];
  markers: Marker[];
  labels: Label[];
};

function groupByComponent(vectorMap: VectorMap,
                          layout: LayoutProvider,
                          canvasContext: () => CanvasRenderingContext2D): GroupedComponentConfig {
  const groupedConfig: GroupedComponentConfig = {
    axes: [], labels: [], markers: [], tracks: [],
  };
  const { sequenceConfig } = vectorMap;
  const { range } = sequenceConfig;
  arrayOrEmpty(vectorMap.tracks).reduce((acc: GroupedComponentConfig, trackState) => {
    const { displayConfig } = trackState;
    const { distance: trackDistance } = displayConfig;
    const track: Track = {
      ...trackState,
      layout,
      range,
    };
    acc.tracks.push(track);
    arrayOrEmpty(trackState.axes).forEach((axisState) => {
      const { displayConfig: axisDisplayConfig } = axisState;
      const { scales } = axisDisplayConfig;
      const axisDistance: number = trackDistance + axisDisplayConfig.distance;
      const axis: Axis = {
        ...axisState,
        displayConfig: {
          ...axisDisplayConfig,
          distance: axisDistance,
          scales: scales.map((scaleState) => {
            const { label: scaleLabel } = scaleState;
            return {
              ...scaleState,
              label: scaleLabel ? {
                ...scaleLabel,
                distance: (scaleLabel.distance || 0) + axisDistance,
              } : undefined,
            };
          }),
        },
        location: range,
        layout,
      };
      acc.axes.push(axis);
      const axisLabels = layout.axis(axis, layout.scale).labels
        .reduce((acc1, next) => acc1.concat(next), [])
        .map((labelState): Label => {
          return {
            ...labelState,
            layout,
            canvasContext,
          };
        });
      acc.labels = acc.labels.concat(axisLabels);
    });
    arrayOrEmpty(track.markers).forEach((markerState) => {
      const { displayConfig: markerDisplayConfig, location: markerLocation } = markerState;
      const marker: Marker = {
        ...markerState,
        displayConfig: {
          ...markerDisplayConfig,
          distance: trackDistance,
        },
        layout,
      };
      acc.markers.push(marker);
      const markerLabels = arrayOrEmpty(marker.labels).map((labelState): Label => {
        return {
          ...labelState,
          location: markerLocation,
          displayConfig: {
            ...labelState.displayConfig,
            distance: trackDistance,
          },
          layout,
          canvasContext,
        };
      });
      acc.labels = acc.labels.concat(markerLabels);
    });
    return acc;
  }, groupedConfig);
  arrayOrEmpty(vectorMap.labels).forEach((labelState) => {
    const { displayConfig } = labelState;
    const label: Label = {
      ...labelState,
      displayConfig: {
        ...displayConfig,
        distance: displayConfig.distance || 0,
      },
      location: { start: 0, end: 0},
      layout,
      canvasContext,
    };
    groupedConfig.labels.push(label);
  });
  return groupedConfig;
}

type CanvasVectorMapRenderer = InHouseVectorMapRenderer<
  MapRenderModel,
  TrackRenderModel,
  AxisRenderModel,
  MarkerRenderModel,
  LabelRenderModel
>;

const render: CanvasVectorMapRenderer = {
  key: 'circular',
  withLayout: (layoutCreator: LayoutProviderMaker) => {
    return (container: HTMLElement) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      container.appendChild(canvas);
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas not supported!');
      }
      const canvasContext = () => context;
      return (state: VectorMap): Promise<boolean> => {
        const vectorMap: VectorMap =  withDefaultViewBoxIfNotPresent(state);
        const { displayConfig } = vectorMap;
        const { viewBox } = displayConfig;
        displayConfig.viewBox = preserveAspectRatio(displayConfig, viewBox, 'xMidYMid meet').dest;
        const { sequenceConfig } = vectorMap;
        const { range } = sequenceConfig;
        const layout = layoutCreator(range);
        const components = groupByComponent(vectorMap, layout, canvasContext);
        renderMap(vectorMap, canvas);
        components.tracks.forEach((track) => renderTrack(track, context));
        components.axes.forEach((axis) => renderAxis(axis, context));
        components.markers.forEach((marker) => renderMarker(marker, context));
        components.labels.forEach((label) => renderLabel(label, context));
        context.restore();
        return Promise.resolve(true);
      };
    };
  },
  createRenderer: (transform: DataToComponentModelFn<MapRenderModel>) => {
    return (container: HTMLElement) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      container.appendChild(canvas);
      return (state: VectorMap): Promise<boolean> => {
        if (!context) {
          return Promise.resolve(false);
        }
        const vectorMap: VectorMap =  withDefaultViewBoxIfNotPresent(state);
        const { displayConfig } = vectorMap;
        const { viewBox } = displayConfig;
        displayConfig.viewBox = preserveAspectRatio(displayConfig, viewBox, 'xMidYMid meet').dest;

        renderMap(vectorMap, canvas);

        const measureText: TextMeasurer = canvasContextTextMeasurer(context);
        const renderModel: MapRenderModel = transform(vectorMap, measureText);
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
