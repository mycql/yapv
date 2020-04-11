import {
  DefaultArcObject,
  Location,
  ScaleLinear,
  StringKeyValMap,
  Track,
  TrackDisplayConfig,
} from '../../models/types';
import { RenderModelTransformer } from './types';
import { PI } from '../../models';
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
    anglesInRadians: {
      start: range ? scale(range.start) : 0,
      end: range ? scale(range.end) : PI.TWICE,
    },
    radii: {
      inner: distance - halfWidth,
      outer: distance + halfWidth,
    },
  };
  return { annulus, style };
};

export default TrackModelTransformer;
