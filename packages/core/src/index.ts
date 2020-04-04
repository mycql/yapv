import { DataToComponentModelFn, InHouseVectorMapRenderer, Location, RenderFn, VectorMap, VectorMapRenderer } from './models/types';
import { LayoutProvider as CircularLayoutProvider } from './transformer/circular/types';

import { mapData as mapAsCircularData, provideLayout as provideCircularLayoutTransforms } from './transformer/circular';

const dataTransformers: { [key: string]: DataToComponentModelFn<any>} = {
  circular: mapAsCircularData,
};

type GenericVectorMapRenderer = InHouseVectorMapRenderer<object, object, object, object, object>;

export type YapvViewer = {
  use: (renderer: GenericVectorMapRenderer) => YapvViewer;
  draw: RenderFn;
  clear: () => Promise<void>;
};

export type YapvBase = {
  create: (container: HTMLElement) => YapvViewer;
  layout: {
    circular: (range: Location) => CircularLayoutProvider;
  };
};

const baseImpl: YapvBase = {
  create: (container: HTMLElement) => {
    let renderFn: RenderFn;
    const viewer: YapvViewer = {
      use: (renderer: GenericVectorMapRenderer) => {
        viewer.clear();
        const { key, createRenderer, withLayout } = renderer;
        const doRender: VectorMapRenderer = withLayout ?
          withLayout(provideCircularLayoutTransforms) :
          createRenderer(dataTransformers[key]);
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
  layout: {
    circular: provideCircularLayoutTransforms,
  },
};

export default baseImpl;
