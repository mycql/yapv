import { ScaleLinear } from 'd3-scale';
import { arc, pathDraw } from '../util';
import {
  DefaultArcObject,
  RenderableWithLabels,
  RenderWithLabelsResult,
  Track,
  TrackDisplayConfig,
  Marker,
  Axis
} from '../models';

import renderMarker from './marker';
import renderAxis from './axis';

const defaultStyle: string = 'stroke: black; fill: white;';

export class TrackComponent implements RenderableWithLabels<Track, TrackDisplayConfig> {

  public render(model: Track, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<RenderWithLabelsResult> {
    const displayConfig: TrackDisplayConfig = model.displayConfig;
    const halfWidth: number = displayConfig.width / 2;
    const style: string = displayConfig.style || defaultStyle;
    const arcConfig: DefaultArcObject = {
      innerRadius: displayConfig.distance - halfWidth,
      outerRadius: displayConfig.distance + halfWidth,
      startAngle: 0,
      endAngle: Math.PI * 2,
      padAngle: null,
    };
    context.beginPath();
    arc(context, arcConfig);
    context.closePath();
    pathDraw(context, style);
    let firstPass: Array<Promise<RenderWithLabelsResult>> = [];
    if (model.markers) {
      context.save();
      firstPass = firstPass.concat(model.markers.map((marker: Marker) => {
        return renderMarker(marker, scale, context);
      }));
      context.restore();
    }
    if (model.axes) {
      context.save();
      firstPass = firstPass.concat(model.axes.map((axis: Axis) => {
        return renderAxis(axis, scale, context);
      }));
      context.restore();
    }

    const result: RenderWithLabelsResult = {
      status: true,
      renderLabels: (): Promise<boolean> => {
        return new Promise((resolve: (status: boolean) => void) => {
          Promise.all(firstPass).then((results: Array<RenderWithLabelsResult>) => {
            const secondPass: Array<Promise<boolean>> =
              results.filter((renderResult: RenderWithLabelsResult) => typeof renderResult.renderLabels === 'function')
                .map((renderResult: RenderWithLabelsResult) => renderResult.renderLabels());
            Promise.all(secondPass).then(() => resolve(true));
          });
        });
      }
    };
    return Promise.resolve(result);
  }

}

export default TrackComponent.prototype.render;