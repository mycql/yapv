import yapvBase from '../packages/core/src';
import canvas from '../packages/canvas/src';
import svg from '../packages/svg/src';

export default {
  canvas: {
    ...canvas,
  },
  svg: {
    ...svg,
  },
  ...yapvBase,
};
