import { VectorMap } from '../core/models/types';
import { ComponentRenderer } from './types';

type Render = ComponentRenderer<VectorMap, HTMLCanvasElement, boolean>;
const render: Render = (props: VectorMap, canvas: HTMLCanvasElement): Promise<boolean> => {
  const context: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D;
  const { displayConfig } = props;
  const { viewBox, width: viewWidth, height: viewHeight } = displayConfig;
  const { width, height } = viewBox;
  canvas.setAttribute('width', `${width}`);
  canvas.setAttribute('height', `${height}`);
  canvas.style.width = `${viewWidth}px`;
  canvas.style.height = `${viewHeight}px`;
  const x: number = width / 2;
  const y: number = height / 2;

  context.save();
  context.translate(x, y);
  context.clearRect(-x, -y, width, height);

  return Promise.resolve<boolean>(true);
};

export default render;
