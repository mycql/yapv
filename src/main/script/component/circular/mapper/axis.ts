import { ScaleLinear } from 'd3-scale';
import {
  Axis,
  AxisDisplayConfig,
  AxisTickConfig,
  Coord,
  DefaultArcObject,
  Location,
  Label,
  LabelDisplayConfig,
  RenderModelMapper,
  StringKeyValMap,
} from '../../models';
import { parseStyle, toCartesianCoords } from '../../util';

const defaultStyle: string = 'stroke: black; fill: gray;';

export type AnnulusRenderModel = {
  annulus: DefaultArcObject;
  style: StringKeyValMap;
};

export type TickRenderModel = Coord[];

export type ScaleRenderModel = {
  ticks: TickRenderModel[];
  style: StringKeyValMap;
};

export type AxisRenderModel = {
  axis: AnnulusRenderModel,
  scales: ScaleRenderModel[];
  labels: Label[][];
};

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

function mapAxis(displayConfig: AxisDisplayConfig,
                 scale: ScaleLinear<number, number>,
                 distanceFromTrack: number,
                 location: Location): AnnulusRenderModel {
  const style: StringKeyValMap = parseStyle(displayConfig.style || defaultStyle);
  const halfWidth: number = displayConfig.width / 2;
  const annulus: DefaultArcObject = {
    innerRadius: distanceFromTrack - halfWidth,
    outerRadius: distanceFromTrack + halfWidth,
    startAngle: scale(location.start),
    endAngle: scale(location.end),
    padAngle: 0,
  };
  return {
    annulus,
    style,
  };
}

function mapScales(tickModels: TickModel[],
                   scale: ScaleLinear<number, number>,
                   distanceFromTrack: number): ScaleRenderModel[] {
  const centerX: number = 0;
  const centerY: number = 0;
  return tickModels.map((tickModel: TickModel) => {
    const { config, ticks: digits }: TickModel = tickModel;
    const style: StringKeyValMap = parseStyle(config.style || defaultStyle);
    const halfWidth: number = config.width / 2;
    const distanceFromAxis: number = config.distance || 0;
    const tickDistance: number = distanceFromTrack + distanceFromAxis;
    const ticks: TickRenderModel[] = digits.map((digit: number) => {
      const innerRadius: number = tickDistance - halfWidth;
      const outerRadius: number = tickDistance + halfWidth;
      const angleInRadians: number = scale(digit);
      return [innerRadius, outerRadius].map((radius: number) => {
        return toCartesianCoords(centerX, centerY, radius, angleInRadians);
      });
    });
    return {
      ticks,
      style,
    };
  });
}

function mapLabels(tickModels: TickModel[],
                   scale: ScaleLinear<number, number>): Label[][] {
  return tickModels.filter(labeledScales).map((tickModel: TickModel) => {
    const { config, ticks }: TickModel = tickModel;
    return ticks.map(ticksAsLabels(config.label, scale));
  });
}

function labeledScales(model: TickModel): boolean {
  const config: AxisTickConfig = model.config;
  const shouldDrawLabels: boolean = config.label !== null &&
    typeof config.label === 'object';
  return shouldDrawLabels;
}

function ticksAsLabels(config: LabelDisplayConfig,
                       scale: ScaleLinear<number, number>): (digit: number) => Label {
  return (digit: number) => {
    return {
      text: digit.toString(),
      location: { start: digit, end: digit },
      displayConfig: config,
    };
  };
}

type Mapper = RenderModelMapper<Axis, AxisDisplayConfig, AxisRenderModel, {}>;
const AxisRenderMapper: Mapper = (model: Axis, scale: ScaleLinear<number, number>): AxisRenderModel => {
  const { displayConfig, location: mapLocation }: Axis = model;
  const { distance: distanceFromTrack, scales: scalesConfig }: AxisDisplayConfig = displayConfig;
  const ticks: TickModel[] = createTicks(scalesConfig, mapLocation);
  const axis: AnnulusRenderModel = mapAxis(displayConfig, scale, distanceFromTrack, mapLocation);
  const scales: ScaleRenderModel[] = mapScales(ticks, scale, distanceFromTrack);
  const labels: Label[][] = mapLabels(ticks, scale);
  return { axis, scales, labels };
};

export default AxisRenderMapper;
