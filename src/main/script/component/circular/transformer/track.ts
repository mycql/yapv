import {
  DefaultArcObject,
  Location,
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

type Transformer = RenderModelTransformer<Track, TrackDisplayConfig, TrackRenderModel, Location>;
const TrackModelTransformer: Transformer = (model: Track,
                                            scale: ScaleLinear<number, number>,
                                            range?: Location): TrackRenderModel => {
  const { width, distance, style: styleStr }: TrackDisplayConfig = model.displayConfig;
  const halfWidth: number = width / 2;
  const style: StringKeyValMap = parseStyle(styleStr || defaultStyle);
  const annulus: DefaultArcObject = {
    innerRadius: distance - halfWidth,
    outerRadius: distance + halfWidth,
    startAngle: range ? scale(range.start) : 0,
    endAngle: range ? scale(range.end) : Math.PI * 2,
    padAngle: 0,
  };
  return { annulus, style };
};

export default TrackModelTransformer;
