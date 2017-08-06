import { ScaleLinear } from 'd3-scale';

export type Coord = { x: number, y: number };

export interface Location {
  start: number;
  end: number;
}

export interface DisplayConfig {
  width: number;
  style: string;
}

export interface SizedDisplayConfig extends DisplayConfig {
  height: number;
}

export interface ComponentModel<T extends DisplayConfig> {
  displayConfig: T;
  parent?: ComponentModel<DisplayConfig>;
}

export interface MarkerLabel extends ComponentModel<DisplayConfig> {
  text: string;
}

export type Direction = string;

export const Directions: {
  FORWARD: string;
  REVERSE: string;
  NONE: string;
  BOTH: string;
} = {
    FORWARD: '+',
    REVERSE: '-',
    NONE: '#',
    BOTH: '*'
};

export type AnchorDisplayConfig = SizedDisplayConfig;

export interface MarkerDisplayConfig extends DisplayConfig {
  anchor: AnchorDisplayConfig;
}

/**
 * Supported styles:
 * fill, fill-rule, fill-opacity, stroke, stroke-opacity,
 * stroke-width, stroke-linecap, stroke-linejoin,
 * stroke-miterlimit, stroke-dasharray, stroke-dashoffset
 */
export interface Marker extends ComponentModel<MarkerDisplayConfig> {
  location: Location;
  direction: Direction;
  labels?: Array<MarkerLabel>;
}

export interface TrackDisplayConfig extends DisplayConfig {
  /**
   * Distance of the center of the track to a reference point:
   * For circular, the center of the vector
   * For linear, the center of the main axis
   */
  distance: number;
}

export interface AxisTickConfig extends TrackDisplayConfig {
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
}

/**
 * For axes, the distance is relative to the middle of
 * the enclosing track
 */
export interface AxisDisplayConfig extends TrackDisplayConfig {
  /**
   * Distance of the center of the axis to the
   * center of the track on which the scales
   * are to be displayed
   */
  distance: number;
  scales: Array<AxisTickConfig>;
}

export type Axis = ComponentModel<AxisDisplayConfig>;

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
}

export interface Renderable<T extends ComponentModel<U>, U extends DisplayConfig> {
  render(model: T, scale: ScaleLinear<number, number>, context: CanvasRenderingContext2D): Promise<boolean>;
}