import { ScaleLinear } from 'd3-scale';
import { arc, pathDraw, normalizeToCanvas } from '../util';
import {
  DefaultArcObject,
  RenderableWithLabels,
  RenderWithLabelsResult,
  Axis,
  AxisDisplayConfig,
  AxisTickConfig,
  Location,
  Label,
} from '../models';

import renderLabel from './label';

const defaultStyle: string = 'stroke: black; fill: gray;';

function intervalToScales(tickInterVal: number, location: Location): number[] {
  const ticks: number[] = [];
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
  const numDigitsLength: number = molLength.toString().length;
  const digits: string[] = [];
  for (let i: number = 0; i < numDigitsLength; i++) {
    if (i === 0) {
      digits.push('1');
    } else {
      digits.push('0');
    }
  }
  return (molLength - (molLength % parseInt(digits.join(''), 10))) / totalTicks;
}

type TickModel = {
  config: AxisTickConfig;
  ticks: number[];
};

function createTicks(configs: AxisTickConfig[], location: Location): TickModel[] {
  return (configs || []).map((config: AxisTickConfig) => {
    const tickTotal: number | undefined = config.total;
    const tickInterVal: number | undefined = config.interval;
    let ticks: number[] = config.ticks || [];
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
    startAngle: normalizeToCanvas(scale(location.start)),
    endAngle: normalizeToCanvas(scale(location.end)),
    padAngle: 0,
  };
  context.beginPath();
  arc(context, arcConfig);
  context.closePath();
  pathDraw(context, style);
}

function drawScales(tickModels: TickModel[],
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
        startAngle: normalizeToCanvas(scale(tick)),
        endAngle: normalizeToCanvas(scale(tick)),
        padAngle: 0,
      };
      context.beginPath();
      arc(context, arcConfig);
      context.closePath();
      pathDraw(context, style);
    });
  });
}

function renderLabels(tickModels: TickModel[],
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
          displayConfig: config.label,
        };
        renderLabel(label, scale, context);
      }
    });
  });
  return Promise.resolve(true);
}

export class AxisComponent implements RenderableWithLabels<Axis, AxisDisplayConfig> {

  public render(model: Axis,
                scale: ScaleLinear<number, number>,
                context: CanvasRenderingContext2D): Promise<RenderWithLabelsResult> {
    const displayConfig: AxisDisplayConfig = model.displayConfig;
    const mapLocation: Location = model.location;
    const distanceFromTrack: number = displayConfig.distance;
    const tickModels: TickModel[] = createTicks(displayConfig.scales, mapLocation);
    drawAxis(displayConfig, scale, context, distanceFromTrack,  mapLocation);
    drawScales(tickModels, scale, context, distanceFromTrack);
    const result: RenderWithLabelsResult = {
      status: true,
      renderLabels: (): Promise<boolean> => renderLabels(tickModels, scale, context),
    };
    return Promise.resolve(result);
  }
}

export default AxisComponent.prototype.render;
