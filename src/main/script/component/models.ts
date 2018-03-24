export const PI: {
  WHOLE: number;
  HALF: number;
  TWICE: number;
} = {
  WHOLE: Math.PI,
  HALF: Math.PI / 2,
  TWICE: Math.PI * 2,
};

export interface ScaleLinear<T, U> {
  (value: T): U;
  domain(values: T[]): ScaleLinear<T, U>;
  range(values: U[]): ScaleLinear<T, U>;
}

export type StringKeyValMap = { [key: string]: string };

export type StringKeyNumValMap = { [key: string]: number };

export type CollisionState = 1 | 0;
export const CollisionStates: {
  HIT: CollisionState;
  NO_HIT: CollisionState
} = {
  HIT: 1,
  NO_HIT: 0,
};
export type CollisionIndicator<T extends object, U extends object> = (model: T, target: U) => CollisionState;

export type CharInfo = {
  widths: StringKeyNumValMap;
  space: number;
};

export interface DefaultArcObject {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
}

export type Coord = { x: number, y: number };
export type PolarCoord = { radius: number, angleInRadians: number; };

export interface Location {
  start: number;
  end: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface DisplayConfig {
  width: number;
  style: string;
}

export interface SpacedDispayConfig extends DisplayConfig {
  /**
   * Distance of the center of the the target component
   * to a reference point:
   * For circular, the center of the vector
   * For linear, the center of the main axis
   */
  distance: number;
}

export interface SizedDisplayConfig extends DisplayConfig, Dimension {
}

export interface ViewDisplayConfig extends SizedDisplayConfig {
  viewBox: Dimension;
}

export interface ComponentModel<T extends DisplayConfig> {
  displayConfig: T;
  // parent?: ComponentModel<DisplayConfig>;
}

export interface LocatableComponentModel<T extends DisplayConfig> extends ComponentModel<T> {
  location: Location;
}

export interface Line extends ComponentModel<DisplayConfig> {
  coords: Coord[];
}

export type LabelType = 'path' | 'text';

export const LabelTypes: { PATH: LabelType; TEXT: LabelType } = {
  PATH: 'path',
  TEXT: 'text',
};

export interface LabelDisplayConfig extends SpacedDispayConfig {
  vOffset?: number;
  hOffset?: number;
  type: LabelType;
}

export interface Label extends LocatableComponentModel<LabelDisplayConfig> {
  text: string;
  line?: boolean | Line;
}

export type Direction = '+' | '-' | '#' | '*';

export const Directions: {
  FORWARD: Direction;
  REVERSE: Direction;
  NONE: Direction;
  BOTH: Direction;
} = {
  FORWARD: '+',
  REVERSE: '-',
  NONE: '#',
  BOTH: '*',
};

export type AnchorDisplayConfig = SizedDisplayConfig;

export interface MarkerDisplayConfig extends SpacedDispayConfig {
  anchor?: AnchorDisplayConfig;
}

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export interface Marker extends LocatableComponentModel<MarkerDisplayConfig> {
  direction: Direction;
  labels?: Label[];
}

export type TrackDisplayConfig = SpacedDispayConfig;

export interface AxisTickConfig extends SpacedDispayConfig {
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
  label: LabelDisplayConfig;
}

/**
 * For axes, the distance is relative to the middle of
 * the enclosing track
 */
export interface AxisDisplayConfig extends SpacedDispayConfig {
  /**
   * Distance of the center of the axis to the
   * center of the track on which the scales
   * are to be displayed
   */
  distance: number;
  scales: AxisTickConfig[];
}

export type Axis = LocatableComponentModel<AxisDisplayConfig>;

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export interface Track extends ComponentModel<TrackDisplayConfig> {
  index: number;
  markers: Marker[];
  axes?: Axis[];
}

export type VectorMapDisplayConfig = ViewDisplayConfig;

export interface VectorMapSeqConfig {
  range: Location;
  sequence?: string;
}

export interface VectorMap extends ComponentModel<VectorMapDisplayConfig> {
  displayConfig: VectorMapDisplayConfig;
  sequenceConfig: VectorMapSeqConfig;
  tracks: Track[];
  labels?: Label[];
}

export type RenderModelTransformer<T extends ComponentModel<U>,
                                   U extends DisplayConfig,
                                   V extends object, W extends object> =
  (model: T, scale: ScaleLinear<number, number>, params?: W) => V;
export type ComponentRenderer<T extends object,
                              U extends object,
                              V extends any> =
  (params: T, context: U) => Promise<V>;
