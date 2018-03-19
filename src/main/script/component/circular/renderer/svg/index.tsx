import '../../../polyfills';

import core from './core';
import { Actions, App, View} from './core';

import { Axis } from './axis';
import { Label } from './label';
import { Marker } from './marker';
import { Track } from './track';
import { PlasmidMap } from './map';

import { StringKeyValMap, VectorMap } from '../../../models';

import { LabelRenderModel, TextMeasurer } from '../../transformer/label';
import { AxisAndLabels, MapRenderModel, MarkerAndLabels, TrackRenderModelComponents } from '../../transformer/map';
import translateModel from '../../transformer/map';

import { resolveTextStyle, updateContextStyle } from '../../../util';

const { h, app } = core;

const DEFAULT_STATE: VectorMap = {
  displayConfig: {
    height: 0,
    style: '',
    width: 0,
    viewBox: {
      height: 0,
      width: 0,
    },
  },
  sequenceConfig: {
    range: {
      end: 0, start: 0,
    },
  },
  tracks: [],
};

function canvasContextTextMeasurer(context: CanvasRenderingContext2D): TextMeasurer {
  return (text: string, style: StringKeyValMap) => {
    context.save();
    updateContextStyle(context, style, resolveTextStyle);
    const size: number = context.measureText(text).width;
    context.restore();
    return size;
  };
}

function createCanvasContext(): CanvasRenderingContext2D {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.left = '-1000px';
  canvas.style.top = '-10000px';
  document.body.appendChild(canvas);
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function createTracks(trackComponents: TrackRenderModelComponents[]): JSX.Element[] {
  return trackComponents.map((componentMap: TrackRenderModelComponents) => {
    const { axes, track, markers } = componentMap;
    const axisComponents = (axes || []).map((axisWithLabels: AxisAndLabels) => {
      const { axis, labels } = axisWithLabels;
      const labelComponents = createLabels(labels);
      return (
        <Axis {...axis}>
          {labelComponents}
        </Axis>
      );
    });
    const markerComponents = (markers || []).map((markerWithLabels: MarkerAndLabels) => {
      const { marker, labels } = markerWithLabels;
      const labelComponents = createLabels(labels);
      return (
        <Marker {...marker}>
          {labelComponents}
        </Marker>
      );
    });
    return (
      <Track {...track}>
        {axisComponents}
        {markerComponents}
      </Track>
    );
  });
}

function createLabels(labels: LabelRenderModel[]): JSX.Element[] {
  return labels.map((params: LabelRenderModel) => <Label {...params}></Label>);
}

function render(container: HTMLElement): (model: VectorMap) => Promise<boolean> {
  const context: CanvasRenderingContext2D = createCanvasContext();
  const textMeasure: TextMeasurer = canvasContextTextMeasurer(context);
  const application: App = app as App;
  const actions: Actions = {
    render: (value: VectorMap) => value,
  };
  const view = (state: VectorMap = DEFAULT_STATE) => {
    let { displayConfig } = state;
    displayConfig = {
      ...{
        viewBox: {
          height: displayConfig.width,
          width: displayConfig.width,
        },
      },
      ...displayConfig,
    };
    const mapModel: MapRenderModel = translateModel(state, textMeasure);
    const tracks: JSX.Element[] = createTracks(mapModel.tracks);
    const labels: JSX.Element[] = createLabels(mapModel.labels);
    return (
      <PlasmidMap {...displayConfig}>
        {tracks}
        <g>
          {labels}
        </g>
      </PlasmidMap>
    );
  };
  const actionables = application(DEFAULT_STATE, actions, view, container);
  return (model: VectorMap): Promise<boolean> => {
    actionables.render(model);
    return Promise.resolve(true);
  };
}

export default render;
