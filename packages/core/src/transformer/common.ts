import {
  Location,
  VectorMapLayoutProviderMaker,
  VectorMapSeqConfig,
} from '../models/types';

function normalizeLocation(location: Location): Location {
  return {
    start: location.start,
    end: location.end + 1,
  };
}

/**
 * Scientific formats define locations for annotations
 * as inclusive ranges of bp positions. Example given a 4 bp
 * sequence, with cursor represented by '|'
 * |A|C|T|G|
 * 1 2 3 4 5
 * - A is at position 1
 * - G is at position 4
 * Positions are 1-based. So if we were to refer to the whole sequence and annotate it,
 * then, start = 1 end = 4.
 * However, in terms of rendering, we're not only representing
 * until the cursor at base 4, but actually until the end of
 * it, which is actually the start of base 5. Hence we
 * offset all end positions by 1
 */
export function normalizeProviderMaker<T, U, V, W>(providerMaker: VectorMapLayoutProviderMaker<T, U, V, W>):
  VectorMapLayoutProviderMaker<T, U, V, W> {
  return (sequenceConfig: VectorMapSeqConfig, canvasContextProvider?: () => CanvasRenderingContext2D) => {
    const normalizedConfig = {
      ...sequenceConfig,
    };
    if (normalizedConfig.length) {
      normalizedConfig.length = normalizedConfig.length + 1;
    }
    if (normalizedConfig.range) {
      normalizedConfig.range = {
        ...normalizedConfig.range,
        end: normalizedConfig.range.end + 1,
      };
    }
    const layout = providerMaker(normalizedConfig, canvasContextProvider);
    const { scale, canvasContext, clear, axis, label, marker, track } = layout;
    return {
      scale,
      canvasContext,
      clear,
      axis: (model, scaler) => {
        model = {
          ...model,
          location: normalizeLocation(model.location),
        };
        return axis(model, scaler);
      },
      label: (model, scaler, measurer) => {
        model = {
          ...model,
          location: normalizeLocation(model.location),
        };
        return label(model, scaler, measurer);
      },
      marker: (model, scaler) => {
        model = {
          ...model,
          location: normalizeLocation(model.location),
        };
        return marker(model, scaler);
      },
      track: (model, scaler, range) => {
        if (range) {
          range = normalizeLocation(range);
        }
        return track(model, scaler, range);
      },
    };
  };
}
