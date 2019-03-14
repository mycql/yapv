import yapvBase from './component';
import canvas from './component/renderer/canvas';
import svg from './component/renderer/svg';

export default {
  canvas: {
    ...canvas,
  },
  svg: {
    ...svg,
  },
  ...yapvBase,
};
