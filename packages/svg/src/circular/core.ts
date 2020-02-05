import * as hyperapp from 'hyperapp';
import { VectorMap } from '../core/models';

export type Actions = {
  render: (value: VectorMap) => VectorMap;
};

export type View = (state: VectorMap, actions: Actions) => JSX.Element;

export type App = (state: VectorMap, actions: Actions, view: View, container: HTMLElement) => Actions;

export default hyperapp;
