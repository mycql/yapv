import * as core from 'hyperapp';
import { Actions, App } from './types';
import { InHouseVectorMapRenderer, VectorMap } from '../core/models/types';

import { AxisComponent, AxisComponentMaker } from './axis';
import { LabelComponent, LabelComponentMaker } from './label';
import { MarkerComponent, MarkerComponentMaker } from './marker';
import { TrackComponent, TrackComponentMaker } from './track';
import { PlasmidMapComponent, PlasmidMapComponentMaker } from './map';

import * as Transformer from '../core/transformer/circular/types';

import { arrayOrEmpty } from '../core/util';

const { h, app } = core;

const VectorAxis = AxisComponent(h);
const VectorLabel = LabelComponent(h);
const VectorMarker = MarkerComponent(h);
const VectorTrack = TrackComponent(h);
const VectorMapCanvas = PlasmidMapComponent(h);

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

function createCanvas(): HTMLCanvasElement {
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.display = 'none';
  canvas.style.left = '-1000px';
  canvas.style.top = '-10000px';
  return canvas;
}

type SVGVectorMapRenderer = {
  AxisComponent: AxisComponentMaker,
  LabelComponent: LabelComponentMaker,
  TrackComponent: TrackComponentMaker,
  MarkerComponent: MarkerComponentMaker,
  PlasmidMapComponent: PlasmidMapComponentMaker,
} & InHouseVectorMapRenderer<
  Transformer.TrackRenderModel,
  Transformer.AxisRenderModel,
  Transformer.MarkerRenderModel,
  Transformer.LabelRenderModel,
  Transformer.Track,
  Transformer.Axis,
  Transformer.Marker,
  Transformer.Label
>;

const render: SVGVectorMapRenderer = {
  AxisComponent,
  LabelComponent,
  TrackComponent,
  MarkerComponent,
  PlasmidMapComponent,
  key: 'circular',
  withLayout: (layoutCreator: Transformer.LayoutProviderMaker,
               convert: Transformer.DataNormalizer) => {
    return (root: HTMLElement) => {
      const container: HTMLElement = document.createElement('div');
      root.appendChild(container);
      const canvas = createCanvas();
      root.appendChild(canvas);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Canvas not supported!');
      }
      const canvasContext = () => context;
      const application: App = app as App;
      const actions: Actions = {
        render: (value: VectorMap) => value,
      };
      const view = (state: VectorMap = DEFAULT_STATE) => {
        const componentModel: Transformer.DataComponentModel =
          convert(state, layoutCreator, canvasContext);
        const { vectorMap, tracks, labels: vectorMapLabels } =
          componentModel;
        return (
          <VectorMapCanvas {...vectorMap}>
            {
              arrayOrEmpty(tracks).map((trackState) => {
                const { track, axes, markers } = trackState;
                return (
                  <VectorTrack {...track}>
                    {
                      arrayOrEmpty(axes).map((axisState) => {
                        const { axis, labels } = axisState;
                        return (
                          <VectorAxis {...axis}>
                            {
                              arrayOrEmpty(labels).map((label) => {
                                return <VectorLabel {...label}/>;
                              })
                            }
                          </VectorAxis>
                        );
                      })
                    }
                    {
                      arrayOrEmpty(markers).map((markerState) => {
                        const { marker, labels } = markerState;
                        return (
                          <VectorMarker {...marker}>
                            {
                              arrayOrEmpty(labels).map((label) => {
                                return <VectorLabel {...label}/>;
                              })
                            }
                          </VectorMarker>
                        );
                      })
                    }
                  </VectorTrack>
                );
              })
            }
            <g>
              {
                arrayOrEmpty(vectorMapLabels).map((label) => {
                  return <VectorLabel {...label}/>;
                })
              }
            </g>
          </VectorMapCanvas>
        );
      };
      const actionables = application(DEFAULT_STATE, actions, view, container);
      return {
        render: (model: VectorMap): Promise<boolean> => {
          actionables.render(model);
          return Promise.resolve(true);
        },
        clear: (): Promise<boolean> => {
          root.removeChild(canvas);
          root.removeChild(container);
          return Promise.resolve<boolean>(true);
        },
      };
    };
  },
};

export default render;
