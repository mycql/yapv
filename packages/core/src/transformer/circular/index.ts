import { Location, ScaleLinear, VectorMap } from '../../models/types';
import {
  Axis,
  DataNormalizer,
  Label,
  LayoutProviderMaker,
  Marker,
  Track,
} from './types';

import { PI } from '../../models';
import { arrayOrEmpty, createCanvas, scaleLinear, withAxisOffset, withDefaultViewBoxIfNotPresent } from '../../util';

import trackFn from './track';
import markerFn from './marker';
import labelFn from './label';
import axisFn from './axis';

const convert: DataNormalizer = (state: VectorMap,
                                 layoutCreator: LayoutProviderMaker,
                                 canvasContext: () => CanvasRenderingContext2D) => {
  const vectorMap: VectorMap =  withDefaultViewBoxIfNotPresent(state);
  const { sequenceConfig } = vectorMap;
  const { range } = sequenceConfig;
  const layout = layoutCreator(range, canvasContext);
  const tracks = arrayOrEmpty(state.tracks).map((trackState) => {
    const { displayConfig } = trackState;
    const { distance: trackDistance } = displayConfig;
    const track: Track = {
      ...trackState,
      range,
      layout,
    };
    const axes = arrayOrEmpty(trackState.axes).map((axisState) => {
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
      const axisLabelModels = layout.axis(axis, layout.scale).labels
        .reduce((acc, next) => acc.concat(next), []);
      const labels = arrayOrEmpty(axisLabelModels).map((labelState) => {
        const axisLabel: Label = {
          ...labelState,
          layout,
        };
        return axisLabel;
      });

      return { axis, labels };
    });

    const markers = arrayOrEmpty(trackState.markers).map((markerState) => {
      const { displayConfig: markerDisplayConfig, location: markerLocation } = markerState;
      const marker: Marker = {
        ...markerState,
        displayConfig: {
          ...markerDisplayConfig,
          distance: trackDistance,
        },
        layout,
      };
      const labels = arrayOrEmpty(marker.labels).map((labelState) => {
        const label: Label = {
          ...labelState,
          location: markerLocation,
          displayConfig: {
            ...labelState.displayConfig,
            distance: trackDistance,
          },
          layout,
        };
        return label;
      });
      return { marker, labels };
    });

    return { track, axes, markers };
  });

  const mapLabels = arrayOrEmpty(state.labels).map((labelState) => {
    const { displayConfig } = labelState;
    const label: Label = {
      ...labelState,
      displayConfig: {
        ...displayConfig,
        distance: displayConfig.distance || 0,
      },
      location: { start: 0, end: 0},
      layout,
    };
    return label;
  });
  return { vectorMap, tracks, labels: mapLabels };
};

const provideLayout: LayoutProviderMaker = (range: Location,
                                            canvasContextProvider?: () => CanvasRenderingContext2D) => {
  const scale: ScaleLinear<number, number> = scaleLinear()
    .domain([range.start, range.end])
    .range([withAxisOffset(0), withAxisOffset(PI.TWICE)]);
  let contextTuple: [() => CanvasRenderingContext2D, () => void];
  // why do we need to do this you ask? To render
  // labels, we need some way to measure their distance.
  // to do that, we use a canvas context to render text
  // offscreen and then measure them
  if (canvasContextProvider) {
    contextTuple = [
      canvasContextProvider,
      () => console.error('No cleanup needed'),
    ];
  } else {
    const canvas = createCanvas();
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas not supported!');
    }
    contextTuple = [
      (): CanvasRenderingContext2D => context,
      (): void => {
        (canvas as unknown) = null;
        (context as unknown) = null;
      },
    ];
  }
  const [ canvasContext, clear ] = contextTuple;
  return {
    scale,
    canvasContext,
    clear,
    marker: markerFn,
    track: trackFn,
    axis: axisFn,
    label: labelFn,
  };
};

export { convert, provideLayout };
