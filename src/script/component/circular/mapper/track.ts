import { ScaleLinear } from 'd3-scale';
import {
  DefaultArcObject,
  RenderModelMapper,
  StringKeyValMap,
  Track,
  TrackDisplayConfig,
} from '../../models';
import { parseStyle } from '../../util';

const defaultStyle: string = 'stroke: black; fill: white;';

export type TrackRenderModel = {
  annulus: DefaultArcObject;
  style: StringKeyValMap;
};

type Mapper = RenderModelMapper<Track, TrackDisplayConfig, TrackRenderModel, {}>;
const TrackRenderMapper: Mapper = (model: Track, scale: ScaleLinear<number, number>): TrackRenderModel => {
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

export default TrackRenderMapper;
