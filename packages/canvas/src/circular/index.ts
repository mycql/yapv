import { InHouseVectorMapRenderer, VectorMap } from '../core/models/types';

import * as Transformer from '../core/transformer/circular/types';

import { arrayOrEmpty } from '../core/util';
import { preserveAspectRatio } from './common';

import { render as renderTrack } from './track';
import { render as renderMarker } from './marker';
import { render as renderAxis } from './axis';
import { render as renderLabel } from './label';
import renderMap from './map';

type GroupedComponentConfig = {
  tracks: Transformer.Track[];
  axes: Transformer.Axis[];
  markers: Transformer.Marker[];
  labels: Transformer.Label[];
};

function groupByComponent(componentModel: Transformer.DataComponentModel): GroupedComponentConfig {
  const groupedConfig: GroupedComponentConfig = {
    axes: [], labels: [], markers: [], tracks: [],
  };
  const { tracks, labels: vectorMapLabels } = componentModel;
  arrayOrEmpty(tracks).forEach((trackState) => {
    const { track, axes, markers } = trackState;
    groupedConfig.tracks.push(track);
    arrayOrEmpty(axes).forEach((axisState) => {
      const { axis, labels } = axisState;
      groupedConfig.axes.push(axis);
      groupedConfig.labels = groupedConfig.labels.concat(labels);
    });
    arrayOrEmpty(markers).forEach((markerState) => {
      const { marker, labels } = markerState;
      groupedConfig.markers.push(marker);
      groupedConfig.labels = groupedConfig.labels.concat(labels);
    });
  });
  groupedConfig.labels.push(...vectorMapLabels);
  return groupedConfig;
}

type CanvasVectorMapRenderer = InHouseVectorMapRenderer<
  Transformer.TrackRenderModel,
  Transformer.AxisRenderModel,
  Transformer.MarkerRenderModel,
  Transformer.LabelRenderModel,
  Transformer.Track,
  Transformer.Axis,
  Transformer.Marker,
  Transformer.Label
>;

const render: CanvasVectorMapRenderer = {
  key: 'circular',
  withLayout: (layoutCreator: Transformer.LayoutProviderMaker,
               convert: Transformer.DataNormalizer) => {
    return (container: HTMLElement) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      container.appendChild(canvas);
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas not supported!');
      }
      const canvasContext = () => context;
      return {
        render: (state: VectorMap): Promise<boolean> => {
          const componentModel: Transformer.DataComponentModel =
            convert(state, layoutCreator, canvasContext);
          const { vectorMap } = componentModel;
          const { displayConfig } = vectorMap;
          displayConfig.viewBox = preserveAspectRatio(displayConfig,
            displayConfig.viewBox, 'xMidYMid meet').dest;
          const components = groupByComponent(componentModel);
          renderMap(vectorMap, canvas);
          components.tracks.forEach((track) => renderTrack(track, context));
          components.axes.forEach((axis) => renderAxis(axis, context));
          components.markers.forEach((marker) => renderMarker(marker, context));
          components.labels.forEach((label) => renderLabel(label, context));
          context.restore();
          return Promise.resolve(true);
        },
        clear: (): Promise<boolean> => {
          container.removeChild(canvas);
          return Promise.resolve<boolean>(true);
        },
      };
    };
  },
};

export default render;
