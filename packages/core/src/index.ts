import {
  ComponentRenderer,
  InHouseVectorMapRenderer,
  RenderFn,
  VectorMap,
  VectortMapDataNormalizer,
  VectorMapLayoutProviderMaker,
  VectorMapRenderer,
  VectorMapSeqConfig,
} from './models/types';
import {
  LayoutProvider as CircularLayoutProvider,
  LayoutProviderMaker as CircularLayoutProviderMaker,
} from './transformer/circular/types';

import {
  provideLayout as provideCircularLayout,
  convert as convertCircular,
} from './transformer/circular';

import { normalizeProviderMaker } from './transformer/common';

const provideCircular: CircularLayoutProviderMaker = normalizeProviderMaker(provideCircularLayout);

const providers: { [key: string]: [
  VectorMapLayoutProviderMaker<any, any, any, any>,
  VectortMapDataNormalizer<any, any, any, any, any, any, any, any>,
]} = {
  circular: [provideCircular, convertCircular],
};

type GenericVectorMapRenderer = InHouseVectorMapRenderer<any, any, any, any>;

export type YapvViewer = {
  use: (renderer: GenericVectorMapRenderer) => YapvViewer;
  draw: RenderFn;
  clear: () => Promise<boolean>;
};

export type YapvBase = {
  create: (container: HTMLElement) => YapvViewer;
  layout: {
    circular: (sequenceConfig: VectorMapSeqConfig) => CircularLayoutProvider;
  };
};

const baseImpl: YapvBase = {
  create: (container: HTMLElement) => {
    let component: ComponentRenderer;
    let initialClearState: Promise<boolean> | null;
    const viewer: YapvViewer = {
      use: (renderer: GenericVectorMapRenderer) => {
        initialClearState = viewer.clear().finally(() => {
          const { key, withLayout } = renderer;
          const [ layoutProvider, converter ] = providers[key];
          const doRender: VectorMapRenderer = withLayout(layoutProvider, converter);
          component = doRender(container);
          return Promise.resolve<boolean>(true);
        });
        return viewer;
      },
      draw: (model: VectorMap) => {
        if (initialClearState) {
          return initialClearState.finally(() => {
            initialClearState = null;
            return component.render(model);
          });
        } else {
          return component.render(model);
        }
      },
      clear: () => {
        if (!component) {
          return Promise.resolve<boolean>(false);
        }
        return component.clear();
      },
    };
    return viewer;
  },
  layout: {
    circular: provideCircular,
  },
};

export default baseImpl;
