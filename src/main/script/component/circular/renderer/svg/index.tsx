import core from './core';

import { Axis } from './axis';
import { Label } from './label';
import { Track } from './track';
import { PlasmidMap } from './map';

import { SizedDisplayConfig, StringKeyValMap, VectorMap } from '../../../models';

import { AxisRenderModel } from '../../mapper/axis';
import { LabelRenderModel, TextMeasurer } from '../../mapper/label';
import { AxisAndLabels, MapRenderModel, TrackRenderModelComponents } from '../../mapper/map';
import translateModel from '../../mapper/map';

import { updateContextStyle } from '../../../util';

const { h, app } = core;

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

function canvasContextTextMeasurer(context: CanvasRenderingContext2D): TextMeasurer {
  return (text: string, style: StringKeyValMap) => {
    context.save();
    updateContextStyle(context, style, resolveStyle);
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
    const { axes, track } = componentMap;
    const axisComponents = (axes || []).map((axisWithLabels: AxisAndLabels) => {
      const { axis, labels } = axisWithLabels;
      const labelComponents = createLabels(labels);
      return (
        <Axis {...axis}>
          {labelComponents}
        </Axis>
      );
    });
    return (
      <Track {...track}>
        {axisComponents}
      </Track>
    );
  });
}

function createLabels(labels: LabelRenderModel[]): JSX.Element[] {
  return labels.map((params: LabelRenderModel) => <Label {...params}></Label>);
}

export function render(container: HTMLElement, model: VectorMap): void {
  const context: CanvasRenderingContext2D = createCanvasContext();
  const textMeasure: TextMeasurer = canvasContextTextMeasurer(context);
  app({
    state: model,
    view: (state: VectorMap) => {
      const mapModel: MapRenderModel = translateModel(model, textMeasure);
      const tracks: JSX.Element[] = createTracks(mapModel.tracks);
      const labels: JSX.Element[] = createLabels(mapModel.labels);
      return (
        <PlasmidMap {...state.displayConfig}>
          {tracks}
          <g>
            {labels}
          </g>
        </PlasmidMap>
      );
    },
  }, container);
}
