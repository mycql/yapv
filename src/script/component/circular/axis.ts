import { ScaleLinear } from 'd3-scale';
import { DefaultArcObject } from 'd3-shape';
import { arc, pathDraw } from '../util';
import {
  RenderableWithLabels,
  RenderWithLabelsResult,
  Axis,
  AxisDisplayConfig,
  AxisTickConfig,
  Location,
  Label
} from '../models';

import renderLabel from './label';

const defaultStyle: string = 'stroke: black; fill: gray;';

function intervalToScales(tickInterVal: number, location: Location): Array<number> {
  const ticks: Array<number> = [];
  const { start, end }: Location = location;
  let tick: number = start === 1 ? start - 1 : start;
  while (tick <= end) {
    ticks.push(tick);
    tick += tickInterVal;
  }
  return ticks;
}

function totalToInterval(totalTicks: number, location: Location): number {
  const molLength: number = location.end - location.start;
  const numDigitsLength: number = molLength.toString().length,
        digits: Array<string> = [];
  for (let i: number = 0; i < numDigitsLength; i++) {
    if (i === 0) {
      digits.push('1');
    } else {
      digits.push('0');
    }
  }
  return (molLength - (molLength % parseInt(digits.join('')))) / totalTicks;
}

type TickModel = {
  config: AxisTickConfig,
  ticks: Array<number>
};

function createTicks(configs: Array<AxisTickConfig>, location: Location): Array<TickModel> {
  return (configs || []).map((config: AxisTickConfig) => {
    const tickTotal: number = config.total;
    const tickInterVal: number = config.interval;
    let ticks: Array<number> = config.ticks || [];
    if (ticks.length <= 0) {
      if (tickInterVal) {
        ticks = intervalToScales(tickInterVal, location);
      } else if (tickTotal) {
        ticks = intervalToScales(totalToInterval(tickTotal, location), location);
      }
    }
    return { config, ticks };
  });
}

function drawAxis(displayConfig: AxisDisplayConfig,
                  scale: ScaleLinear<number, number>,
                  context: CanvasRenderingContext2D,
                  distanceFromTrack: number,
                  location: Location): void {
  const style: string = displayConfig.style || defaultStyle;
  const halfWidth: number = displayConfig.width / 2;
  const arcConfig: DefaultArcObject = {
    innerRadius: distanceFromTrack - halfWidth,
    outerRadius: distanceFromTrack + halfWidth,
    startAngle: scale(location.start),
    endAngle: scale(location.end),
    padAngle: null,
  };
  context.beginPath();
  arc().context(context)(arcConfig);
  context.closePath();
  pathDraw(context, style);
}

function drawScales(tickModels: Array<TickModel>,
                    scale: ScaleLinear<number, number>,
                    context: CanvasRenderingContext2D,
                    distanceFromTrack: number): void {
  tickModels.forEach((tickModel: TickModel) => {
    const { config, ticks }: TickModel = tickModel;
    const style: string = config.style || defaultStyle;
    const halfWidth: number = config.width / 2;
    const distanceFromAxis: number = config.distance || 0;
    const tickDistance: number = distanceFromTrack + distanceFromAxis;
    ticks.forEach((tick: number) => {
      const arcConfig: DefaultArcObject = {
        innerRadius: tickDistance - halfWidth,
        outerRadius: tickDistance + halfWidth,
        startAngle: scale(tick),
        endAngle: scale(tick),
        padAngle: null,
      };
      context.beginPath();
      arc().context(context)(arcConfig);
      context.closePath();
      pathDraw(context, style);
    });
  });
}

function renderLabels(tickModels: Array<TickModel>,
                      scale: ScaleLinear<number, number>,
                      context: CanvasRenderingContext2D): Promise<boolean> {
  tickModels.forEach((tickModel: TickModel) => {
    const { config, ticks }: TickModel = tickModel;
    ticks.forEach((tick: number) => {
      const shoudDrawLabels: boolean = config.label !== null &&
        typeof config.label === 'object';
      if (shoudDrawLabels) {
        const label: Label = {
          text: tick.toString(),
          location: { start: tick, end: tick },
          displayConfig: config.label
        };
        renderLabel(label, scale, context);
      }
    });
  });
  return Promise.resolve(true);
}

export class AxisComponent implements RenderableWithLabels<Axis, AxisDisplayConfig> {

  public render(model: Axis, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<RenderWithLabelsResult> {
    const displayConfig: AxisDisplayConfig = model.displayConfig;
    const mapLocation: Location = model.location;
    const distanceFromTrack: number = displayConfig.distance;
    const tickModels: Array<TickModel> = createTicks(displayConfig.scales, mapLocation);
    drawAxis(displayConfig, scale, context, distanceFromTrack,  mapLocation);
    drawScales(tickModels, scale, context, distanceFromTrack);
    const result: RenderWithLabelsResult = {
      status: true,
      renderLabels: (): Promise<boolean> => renderLabels(tickModels, scale, context)
    };
    return Promise.resolve(result);
  }
}

export default AxisComponent.prototype.render;