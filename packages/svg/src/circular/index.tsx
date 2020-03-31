import * as core from 'hyperapp';
import { Actions, App } from './core';
import {
  DataToComponentModelFn,
  InHouseVectorMapRenderer,
  TextMeasurer,
  VectorMap,
} from '../core/models/types';

import { AxisComponent, AxisComponentMaker, AxisRenderer } from './axis';
import { LabelComponent, LabelComponentMaker, LabelRenderer } from './label';
import { MarkerComponent, MarkerComponentMaker, MarkerRenderer } from './marker';
import { TrackComponent, TrackComponentMaker, TrackRenderer } from './track';
import { PlasmidMapComponent, PlasmidMapComponentMaker, PlasmidMapRenderer } from './map';

import * as Transformer from '../core/transformer/circular/types';

import { canvasContextTextMeasurer } from '../core/util';

const { h, app } = core;

const Axis = AxisRenderer(h);
const Label = LabelRenderer(h);
const Marker = MarkerRenderer(h);
const Track = TrackRenderer(h);
const PlasmidMap = PlasmidMapRenderer(h);

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

function createCanvasContext(container: HTMLElement): CanvasRenderingContext2D {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.display = 'none';
  canvas.style.left = '-1000px';
  canvas.style.top = '-10000px';
  container.appendChild(canvas);
  return canvas.getContext('2d') as CanvasRenderingContext2D;
}

function createTracks(trackComponents: Transformer.TrackRenderModelComponents[]): JSX.Element[] {
  return trackComponents.map((componentMap: Transformer.TrackRenderModelComponents) => {
    const { axes, track, markers } = componentMap;
    const axisComponents = (axes || []).map((axisWithLabels: Transformer.AxisAndLabels) => {
      const { axis, labels } = axisWithLabels;
      const labelComponents = createLabels(labels);
      return (
        <Axis {...axis}>
          {labelComponents}
        </Axis>
      );
    });
    const markerComponents = (markers || []).map((markerWithLabels: Transformer.MarkerAndLabels) => {
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

function createLabels(labels: Transformer.LabelRenderModel[]): JSX.Element[] {
  return labels.map((params: Transformer.LabelRenderModel) => <Label {...params}></Label>);
}

type SVGVectorMapRenderer = {
  AxisComponent: AxisComponentMaker,
  LabelComponent: LabelComponentMaker,
  TrackComponent: TrackComponentMaker,
  MarkerComponent: MarkerComponentMaker,
  PlasmidMapComponent: PlasmidMapComponentMaker,
} & InHouseVectorMapRenderer<Transformer.MapRenderModel>;

const render: SVGVectorMapRenderer = {
  AxisComponent,
  LabelComponent,
  TrackComponent,
  MarkerComponent,
  PlasmidMapComponent,
  key: 'circular',
  createRenderer: (transform: DataToComponentModelFn<Transformer.MapRenderModel>) => {
    return (root: HTMLElement) => {
      const container: HTMLElement = document.createElement('div');
      root.appendChild(container);
      const context: CanvasRenderingContext2D = createCanvasContext(root);
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
        const mapModel: Transformer.MapRenderModel = transform(state, textMeasure);
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
    };
  },
};

export default render;
