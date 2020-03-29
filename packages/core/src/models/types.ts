export type ScaleLinear<T, U> = {
  (value: T): U;
  domain<V = ScaleLinear<T, U>>(values?: T[]): V;
  range<V = ScaleLinear<T, U>>(values?: U[]): V;
};

export type StringKeyValMap = { [key: string]: string };

export type StringKeyNumValMap = { [key: string]: number };

export type CollisionState = 1 | 0;

export type CollisionIndicator<T extends object, U extends object> = (model: T, target: U) => CollisionState;

export type CharInfo = {
  widths: StringKeyNumValMap;
  space: number;
};

export type DefaultArcObject = {
  anglesInRadians: Location;
  radii: {
    inner: number;
    outer: number;
  };
};

export type Coord = { x: number, y: number };
export type PolarCoord = { radius: number, angleInRadians: number; };

export type Location = {
  start: number;
  end: number;
};

export type Dimension = {
  width: number;
  height: number;
};

export type DisplayConfig = {
  width: number;
  style: string;
};

export type SpacedDispayConfig = {
  /**
   * Distance of the center of the the target component
   * to a reference point:
   * For circular, the center of the vector
   * For linear, the center of the main axis
   */
  distance: number;
} & DisplayConfig;

export type SizedDisplayConfig = DisplayConfig & Dimension;

export type ViewDisplayConfig = {
  viewBox: Dimension;
} & SizedDisplayConfig;

export type ComponentModel<T extends DisplayConfig, U> = {
  displayConfig: T;
  layout?: U;
};

export type LocatableComponentModel<T extends DisplayConfig, U> = {
  location: Location;
} & ComponentModel<T, U>;

export type LineComponentModel<T> = {
  coords?: Coord[];
} & ComponentModel<DisplayConfig, T>;

export type Line<T = {}> = LineComponentModel<T>;

export type LabelType = 'path' | 'text';

export type LabelDisplayConfig = {
  vOffset?: number;
  hOffset?: number;
  type: LabelType;
} & SpacedDispayConfig;

export type LabelComponentModel<T> = {
  text: string;
  line?: boolean | Line;
} & LocatableComponentModel<LabelDisplayConfig, T>;

export type Label<T = {}> = LabelComponentModel<T>;

export type Direction = '+' | '-' | '#' | '*';

export type AnchorDisplayConfig = SizedDisplayConfig;

export type MarkerDisplayConfig = {
  anchor?: AnchorDisplayConfig;
} & SpacedDispayConfig;

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export type MarkerComponentModel<T> = {
  direction: Direction;
} & LocatableComponentModel<MarkerDisplayConfig, T>;

export type Marker<T = {}> = {
  labels?: Label[];
} & MarkerComponentModel<T>;

export type TrackDisplayConfig = SpacedDispayConfig;

export type AxisTickConfig = {
  /**
   * Vertical distance of each scale marker to
   * the center of the axis on which it is
   * to be displayed
   */
  distance: number;
  /**
   * Specifying this value will generate tick marks
   * having N bases per interval
   */
  interval?: number;
  /**
   * Specifying this value will generate N number
   * of tick marks displayed uniformly across
   * the map
   */
  total?: number;
  /**
   * The actual tick values to render. The component
   * will spread the tick values across the map
   */
  ticks?: number[];
  /**
   * If specified, display properties for the
   * labels to be rendered,, otherwise no
   * labels will be associated with tick items
   */
  label?: LabelDisplayConfig;
} & SpacedDispayConfig;

/**
 * For axes, the distance is relative to the middle of
 * the enclosing track
 */
export type AxisDisplayConfig = {
  /**
   * Distance of the center of the axis to the
   * center of the track on which the scales
   * are to be displayed
   */
  distance: number;
  scales: AxisTickConfig[];
} & SpacedDispayConfig;

export type AxisComponentModel<T> = LocatableComponentModel<AxisDisplayConfig, T>;

export type Axis<T = {}> = AxisComponentModel<T>;

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export type TrackComponentModel<T> = {
  index: number;
} & ComponentModel<TrackDisplayConfig, T>;

export type Track<T = {}> = {
  markers?: Marker[];
  axes?: Axis[];
} & TrackComponentModel<T>;

export type VectorMapDisplayConfig = ViewDisplayConfig;

export type VectorMapSeqConfig = {
  range: Location;
  sequence?: string;
};

export type VectorMapComponentModel<T> = {
  displayConfig: VectorMapDisplayConfig;
  sequenceConfig: VectorMapSeqConfig;
} & ComponentModel<VectorMapDisplayConfig, T>;

export type VectorMap<T = {}> = {
  tracks?: Track[];
  labels?: Label[];
} & VectorMapComponentModel<T>;

export type RenderModelTransformer<T extends ComponentModel<U, X>,
                                   U extends DisplayConfig,
                                   V extends object,
                                   W extends object,
                                   X = {}> =
  (model: T, scale: ScaleLinear<number, number>, params?: W) => V;
export type ComponentRenderer<T extends object,
                              U extends object,
                              V extends any> =
  (params: T, context: U) => Promise<V>;

export type RenderFn = (mode: VectorMap) => Promise<boolean>;

export type VectorMapRenderer = (container: HTMLElement) => RenderFn;

export type TextMeasurer = (text: string, style: StringKeyValMap) => number;

export type DataToComponentModelFn<T extends object> = (model: VectorMap, measure: TextMeasurer) => T;

export type LayoutType = 'circular';

export type InHouseVectorMapRenderer<T extends object> = {
  key: LayoutType;
  createRenderer(transform: DataToComponentModelFn<T>): VectorMapRenderer;
};

export type VectorMapLayoutProvider<T, U, V, W> = {
  scale: ScaleLinear<number, number>;
  track(model: Track, scale: ScaleLinear<number, number>, range?: Location): T;
  axis(model: Axis, scale: ScaleLinear<number, number>): U;
  marker(model: Marker, scale: ScaleLinear<number, number>): V;
  label(model: Label, scale: ScaleLinear<number, number>, measureText?: TextMeasurer): W;
};
