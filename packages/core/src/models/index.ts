import { CollisionState, Direction, LabelType } from './types';

export * from './types';

export const CollisionStates: {
  HIT: CollisionState;
  NO_HIT: CollisionState
} = {
  HIT: 1,
  NO_HIT: 0,
};

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

export const LabelTypes: { PATH: LabelType; TEXT: LabelType } = {
  PATH: 'path',
  TEXT: 'text',
};

export const PI: {
  WHOLE: number;
  HALF: number;
  TWICE: number;
} = {
  WHOLE: Math.PI,
  HALF: Math.PI / 2,
  TWICE: Math.PI * 2,
};
