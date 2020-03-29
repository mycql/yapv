import { Location, ScaleLinear } from '../../models/types';
import { LayoutProvider } from './types';

import { PI } from '../../models';
import { scaleLinear, withAxisOffset } from '../../util';

import track from './track';
import marker from './marker';
import label from './label';
import axis from './axis';
import mapData from './map';

const provideLayout: (range: Location) => LayoutProvider = (range: Location) => {
  const scale: ScaleLinear<number, number> = scaleLinear()
    .domain([range.start, range.end])
    .range([withAxisOffset(0), withAxisOffset(PI.TWICE)]);
  return {
    scale,
    marker,
    track,
    axis,
    label,
  };
};

export { mapData, provideLayout };
