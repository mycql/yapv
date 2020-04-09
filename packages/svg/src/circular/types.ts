import { ReactNode } from 'react';
import { Coord, VectorMap } from '../core/models/types';

export type Positioned = { start: Coord; end: Coord; };

export type Actions = {
  render: (value: VectorMap) => VectorMap;
};

export type View = (state: VectorMap, actions: Actions) => JSX.Element;

export type App = (state: VectorMap, actions: Actions, view: View, container: HTMLElement) => Actions;

type VNode<Attributes = {}> = {
  nodeName: string;
  attributes?: Attributes;
  children: Array<VNode | string>;
  key: string | number | null;
};

type Component<Attributes = {}> =
  (attributes: Attributes, children: Array<VNode | string>) => | VNode<Attributes>;

type Children = VNode | string | number | null;

export type H<Attributes = {}> = (
  nodeName: Component<Attributes> | string,
  attributes?: Attributes,
  ...children: Array<Children | Children[]>
) => VNode<Attributes>;

export type ComponentRenderer<T> = (params: T, children: ReactNode[]) => JSX.Element;
export type ComponentMaker<T> = (h: H) => ComponentRenderer<T>;
