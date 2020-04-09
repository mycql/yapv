import {
  InHouseVectorMapRenderer,
  Location,
  RenderFn,
  VectorMap,
  VectortMapDataNormalizer,
  VectorMapLayoutProviderMaker,
  VectorMapRenderer,
} from './models/types';
import { LayoutProvider as CircularLayoutProvider } from './transformer/circular/types';

import {
  provideLayout as provideCircularLayoutTransforms,
  convert as convertCircular,
} from './transformer/circular';

const providers: { [key: string]: [
  VectorMapLayoutProviderMaker<any, any, any, any>,
  VectortMapDataNormalizer<any, any, any, any, any, any, any, any>,
]} = {
  circular: [provideCircularLayoutTransforms, convertCircular],
};

type GenericVectorMapRenderer = InHouseVectorMapRenderer<any, any, any, any>;

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
        const { key, withLayout } = renderer;
        const [ layoutProvider, converter ] = providers[key];
        const doRender: VectorMapRenderer = withLayout(layoutProvider, converter);
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
