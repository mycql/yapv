import {
  DefaultArcObject,
  RenderModelTransformer,
  ScaleLinear,
  StringKeyValMap,
  Track,
  TrackDisplayConfig,
} from '../../models';
import { parseStyle } from '../../util';

const defaultStyle: string = 'stroke: black; fill: transparent;';

export type TrackRenderModel = {
  annulus: DefaultArcObject;
  style: StringKeyValMap;
};

type Transformer = RenderModelTransformer<Track, TrackDisplayConfig, TrackRenderModel, {}>;
const TrackModelTransformer: Transformer = (model: Track, scale: ScaleLinear<number, number>): TrackRenderModel => {
  const { width, distance, style: styleStr }: TrackDisplayConfig = model.displayConfig;
  const halfWidth: number = width / 2;
  const style: StringKeyValMap = parseStyle(styleStr || defaultStyle);
  const annulus: DefaultArcObject = {
    innerRadius: distance - halfWidth,
    outerRadius: distance + halfWidth,
    startAngle: 0,
    endAngle: Math.PI * 2,
    padAngle: 0,
  };
  return { annulus, style };
};

export default TrackModelTransformer;
