import { ScaleLinear } from 'd3-scale';

export type StringKeyValMap = { [key: string]: string };

export interface DefaultArcObject {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
}

export type Coord = { x: number, y: number };

export interface Location {
  start: number;
  end: number;
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

export interface SizedDisplayConfig extends DisplayConfig {
  height: number;
}

export interface ComponentModel<T extends DisplayConfig> {
  displayConfig: T;
  // parent?: ComponentModel<DisplayConfig>;
}

export interface LocatableComponentModel<T extends DisplayConfig> extends ComponentModel<T> {
  location: Location;
}

export interface Line extends ComponentModel<DisplayConfig> {
  coords: Array<Coord>;
}

export type LabelType = 'path' | 'text';

export const LabelTypes: { PATH: LabelType; TEXT: LabelType } = {
  PATH: 'path',
  TEXT: 'text'
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
  BOTH: '*'
};

export type AnchorDisplayConfig = SizedDisplayConfig;

export interface MarkerDisplayConfig extends SpacedDispayConfig {
  anchor: AnchorDisplayConfig;
}

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export interface Marker extends LocatableComponentModel<MarkerDisplayConfig> {
  direction: Direction;
  labels?: Array<Label>;
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
  ticks?: Array<number>;
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
  scales: Array<AxisTickConfig>;
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
  markers: Array<Marker>;
  axes?: Array<Axis>;
}

export type VectorMapDisplayConfig = SizedDisplayConfig;

export interface VectorMapSeqConfig {
  range: Location;
  sequence?: string;
}

export interface VectorMap extends ComponentModel<VectorMapDisplayConfig> {
  displayConfig: VectorMapDisplayConfig;
  sequenceConfig: VectorMapSeqConfig;
  tracks: Array<Track>;
  labels?: Array<Label>;
}

export interface Renderable<T extends ComponentModel<U>, U extends DisplayConfig, V extends Object> {
  render(model: T, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<V>;
}

export type RenderWithLabelsResult = {
  status: boolean;
  renderLabels: () => Promise<boolean>;
};

export interface RenderableWithLabels<T extends ComponentModel<U>, U extends DisplayConfig> extends Renderable<T, U, RenderWithLabelsResult> {

}

export interface RenderModelMapper<T extends ComponentModel<U>, U extends DisplayConfig, V extends Object, W extends Object> {
  map(model: T, scale: ScaleLinear<number, number>, params?: W): Promise<V>;
}

export interface ComponentRenderer<T extends Object, U extends Object, V extends Object> {
  render(params: T, context?: U): Promise<V>;
}