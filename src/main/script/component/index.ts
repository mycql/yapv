import { DataToComponentModelFn, InHouseVectorMapRenderer, RenderFn, VectorMap, VectorMapRenderer } from './models';

import circularTransform from './transformer/circular/map';

const InHouseTransformers: { [key: string]: DataToComponentModelFn<any>} = {
  circular: circularTransform,
};

type MapRenderer = VectorMapRenderer | InHouseVectorMapRenderer<any>;

export type YapvViewer = {
  use: (renderer: MapRenderer) => YapvViewer;
  draw: RenderFn;
  clear: () => Promise<void>;
};

export type YapvBase = {
  create: (container: HTMLElement) => YapvViewer;
};

const baseImpl: YapvBase = {
  create: (container: HTMLElement) => {
    let doRender: VectorMapRenderer;
    let renderFn: RenderFn;
    const viewer: YapvViewer = {
      use: (renderer: MapRenderer) => {
        viewer.clear();
        const isBuiltIn: boolean = typeof renderer === 'object';
        if (isBuiltIn) {
          const inHouseRenderer = (renderer as InHouseVectorMapRenderer<object>);
          const { key, createRenderer } = inHouseRenderer;
          doRender = createRenderer(InHouseTransformers[key]);
        } else {
          doRender = renderer as VectorMapRenderer;
        }
        renderFn = doRender(container);
        return viewer;
      },
      draw: (model: VectorMap) => {
        return renderFn(model);
      },
      clear: () => {
        while (container.hasChildNodes()) {
          const { lastChild } = container;
          if (lastChild) {
            container.removeChild(lastChild);
          }
        }
        return Promise.resolve();
      },
    };
    return viewer;
  },
};

export default baseImpl;
