import { ScaleLinear } from 'd3-scale';
import {
  Axis,
  AxisDisplayConfig,
  AxisTickConfig,
  DefaultArcObject,
  Location,
  Label,
  LabelDisplayConfig,
  RenderModelMapper,
  StringKeyValMap
} from '../../models';
import { normalizeToCanvas, parseStyle } from '../../util';
import { LabelRenderModel, TextMeasurer } from './label';
import mapLabel from './label';

const defaultStyle: string = 'stroke: black; fill: gray;';

export type AnnulusRenderModel = {
  annulus: DefaultArcObject;
  style: StringKeyValMap;
};

export type ScaleRenderModel = {
  ticks: Array<DefaultArcObject>;
  style: StringKeyValMap;
};

export type AxisRenderModel = {
  axis: AnnulusRenderModel,
  scales: Array<ScaleRenderModel>;
  labels: Array<Array<LabelRenderModel>>;
};

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

function mapAxis(displayConfig: AxisDisplayConfig,
                 scale: ScaleLinear<number, number>,
                 distanceFromTrack: number,
                 location: Location): AnnulusRenderModel {
  const style: StringKeyValMap = parseStyle(displayConfig.style || defaultStyle);
  const halfWidth: number = displayConfig.width / 2;
  const annulus: DefaultArcObject = {
    innerRadius: distanceFromTrack - halfWidth,
    outerRadius: distanceFromTrack + halfWidth,
    startAngle: normalizeToCanvas(scale(location.start)),
    endAngle: normalizeToCanvas(scale(location.end)),
    padAngle: null,
  };
  return {
    annulus,
    style
  };
}

function mapScales(tickModels: Array<TickModel>,
                   scale: ScaleLinear<number, number>,
                   distanceFromTrack: number): Array<ScaleRenderModel> {
  return tickModels.map((tickModel: TickModel) => {
    const { config, ticks: digits }: TickModel = tickModel;
    const style: StringKeyValMap = parseStyle(config.style || defaultStyle);
    const halfWidth: number = config.width / 2;
    const distanceFromAxis: number = config.distance || 0;
    const tickDistance: number = distanceFromTrack + distanceFromAxis;
    const ticks: Array<DefaultArcObject> = digits.map((digit: number) => {
      return {
        innerRadius: tickDistance - halfWidth,
        outerRadius: tickDistance + halfWidth,
        startAngle: normalizeToCanvas(scale(digit)),
        endAngle: normalizeToCanvas(scale(digit)),
        padAngle: null,
      };
    });
    return {
      ticks,
      style
    }
  });
}

function mapLabels(tickModels: Array<TickModel>,
                   scale: ScaleLinear<number, number>,
                   measureText: TextMeasurer): Array<Array<LabelRenderModel>> {
  return tickModels.filter(labeledScales).map((tickModel: TickModel) => {
    const { config, ticks }: TickModel = tickModel;
    return ticks.map(ticksAsLabels(config.label, scale, measureText));
  });
}

function labeledScales(model: TickModel): boolean {
  const config: AxisTickConfig = model.config;
  const shouldDrawLabels: boolean = config.label !== null &&
    typeof config.label === 'object';
  return shouldDrawLabels;
}

function ticksAsLabels(config: LabelDisplayConfig,
                       scale: ScaleLinear<number, number>,
                       measureText: TextMeasurer): (digit: number) => LabelRenderModel {
  return (digit: number) => {
    const label: Label = {
      text: digit.toString(),
      location: { start: digit, end: digit },
      displayConfig: config
    };
    return mapLabel(label, scale, measureText);
  };
}

type Mapper = RenderModelMapper<Axis, AxisDisplayConfig, AxisRenderModel, TextMeasurer>;
const AxisRenderMapper: Mapper = (model: Axis, scale: ScaleLinear<number, number>, measureText: TextMeasurer): AxisRenderModel => {
  const { displayConfig, location: mapLocation }: Axis = model;
  const { distance: distanceFromTrack, scales: scalesConfig }: AxisDisplayConfig = displayConfig;
  const ticks: Array<TickModel> = createTicks(scalesConfig, mapLocation);
  const axis: AnnulusRenderModel = mapAxis(displayConfig, scale, distanceFromTrack, mapLocation);
  const scales: Array<ScaleRenderModel> = mapScales(ticks, scale, distanceFromTrack);
  const labels: Array<Array<LabelRenderModel>> = mapLabels(ticks, scale, measureText);
  return { axis, scales, labels };
};

export default AxisRenderMapper;