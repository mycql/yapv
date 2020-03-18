export type ScaleLinear<T, U> = {
  (value: T): U;
  domain(values: T[]): ScaleLinear<T, U>;
  range(values: U[]): ScaleLinear<T, U>;
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

export type ComponentModel<T extends DisplayConfig, U = {}> = {
  displayConfig: T;
  parent?: U;
};

export type LocatableComponentModel<T extends DisplayConfig> = {
  location: Location;
} & ComponentModel<T>;

export type LineComponentModel = {
  coords?: Coord[];
} & ComponentModel<DisplayConfig>;

export type Line = LineComponentModel;

export type LabelType = 'path' | 'text';

export type LabelDisplayConfig = {
  vOffset?: number;
  hOffset?: number;
  type: LabelType;
} & SpacedDispayConfig;

export type LabelComponentModel = {
  text: string;
  line?: boolean | Line;
} & LocatableComponentModel<LabelDisplayConfig>;

export type Label = LabelComponentModel;

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
export type MarkerComponentModel = {
  direction: Direction;
} & LocatableComponentModel<MarkerDisplayConfig>;

export type Marker = {
  labels?: Label[];
} & MarkerComponentModel;

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

export type AxisComponentModel = LocatableComponentModel<AxisDisplayConfig>;

export type Axis = AxisComponentModel;

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export type TrackComponentModel = {
  index: number;
} & ComponentModel<TrackDisplayConfig>;

export type Track = {
  markers?: Marker[];
  axes?: Axis[];
} & TrackComponentModel;

export type VectorMapDisplayConfig = ViewDisplayConfig;

export type VectorMapSeqConfig = {
  range: Location;
  sequence?: string;
};

export type VectorMapComponentModel = {
  displayConfig: VectorMapDisplayConfig;
  sequenceConfig: VectorMapSeqConfig;
} & ComponentModel<VectorMapDisplayConfig>;

export type VectorMap = {
  tracks?: Track[];
  labels?: Label[];
} & VectorMapComponentModel;

export type RenderModelTransformer<T extends ComponentModel<U>,
                                   U extends DisplayConfig,
                                   V extends object, W extends object> =
  (model: T, scale: ScaleLinear<number, number>, params?: W) => V;
export type ComponentRenderer<T extends object,
                              U extends object,
                              V extends any> =
  (params: T, context: U) => Promise<V>;

export type RenderFn = (mode: VectorMap) => Promise<boolean>;

export type VectorMapRenderer = (container: HTMLElement) => RenderFn;

export type TextMeasurer = (text: string, style: StringKeyValMap) => number;

export type DataToComponentModelFn<T extends object> = (model: VectorMap, measure: TextMeasurer) => T;

export type InHouseVectorMapRenderer<T extends object> = {
  key: string;
  createRenderer(transform: DataToComponentModelFn<T>): VectorMapRenderer;
};
