import { ScaleLinear } from 'd3-scale';
import { DefaultArcObject } from 'd3-shape';
import { arc, pathDraw } from '../util';
import { Renderable, Axis, AxisDisplayConfig, AxisTickConfig, Track, TrackDisplayConfig, VectorMap, Location } from '../models';

const defaultStyle: string = 'stroke: black; fill: gray;';

function intervalToScales(tickInterVal: number, location: Location): Array<number> {
  const ticks: Array<number> = [];
  let tick: number = location.start;
  while (tick <= location.end) {
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

function drawAxis(displayConfig: AxisDisplayConfig,
                  distanceFromTrack: number,
                  scale: ScaleLinear<number, number>,
                  context: CanvasRenderingContext2D,
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

function drawScales(displayConfig: AxisDisplayConfig,
                    distanceFromTrack: number,
                    scale: ScaleLinear<number, number>,
                    context: CanvasRenderingContext2D,
                    location: Location): void {
  const tickOptions: Array<AxisTickConfig> = displayConfig.scales;
  if (!tickOptions) {
    return;
  }
  tickOptions.forEach((tickConfig: AxisTickConfig) => {
    const tickTotal: number = tickConfig.total;
    const tickInterVal: number = tickConfig.interval;
    let ticks: Array<number> = tickConfig.ticks || [];
    if (ticks.length <= 0) {
      if (tickInterVal) {
        ticks = intervalToScales(tickInterVal, location);
      } else if (tickTotal) {
        ticks = intervalToScales(totalToInterval(tickTotal, location), location);
      }
    }
    const style: string = tickConfig.style || defaultStyle;
    const halfWidth: number = tickConfig.width / 2;
    const distanceFromAxis: number = tickConfig.distance || 0;
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

export class AxisComponent implements Renderable<Axis, AxisDisplayConfig> {

  public render(model: Axis, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean> {
    const displayConfig: AxisDisplayConfig = model.displayConfig;
    const track: Track = <Track>model.parent;
    const trackConfig: TrackDisplayConfig = track.displayConfig;
    const vectorMap: VectorMap = <VectorMap>track.parent;
    const mapLocation: Location = vectorMap.sequenceConfig.range;
    const distanceFromTrack: number = trackConfig.distance + displayConfig.distance;
    drawAxis(displayConfig,  distanceFromTrack, scale, context, mapLocation);
    drawScales(displayConfig, distanceFromTrack, scale, context, mapLocation);
    return Promise.resolve(true);
  }
}