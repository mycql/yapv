/* tslint:disable:no-var-requires */
import { VectorMap } from '../../../models';

export type Actions = {
  render: (value: VectorMap) => VectorMap;
};

export type View = (state: VectorMap, actions: Actions) => JSX.Element;

export type App = (state: VectorMap, actions: Actions, view: View, container: HTMLElement) => Actions;

const hyperapp = require('hyperapp');
export default hyperapp;
