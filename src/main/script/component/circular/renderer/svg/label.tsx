import core from './core';

import {
  ConnectorRenderModel,
  LabelRenderModel,
  TextRenderModel,
} from '../../mapper/label';

import { toCamelCaseKeys } from '../../../util';

import { CSSProperties } from 'react';

const { h } = core;

export const Label = (params: LabelRenderModel) => {
  const { connector, label, type } = params;
  const { anglesInRadians, content, position: labelPosition, style: lblStyle } = label;
  const labelStyle = lblStyle || {};
  const normLabelStyle = { ...{ 'text-anchor': 'middle', 'dominant-baseline': 'central' }, ...labelStyle };
  const cssProps: CSSProperties = toCamelCaseKeys(normLabelStyle);
  const transform: string | undefined = anglesInRadians ? (anglesInRadians.rotation ?
    `rotate(${anglesInRadians.rotation})` : undefined) : undefined;
  return (
    <text x={labelPosition.x} y={labelPosition.y} style={cssProps} transform={transform}>{content}</text>
  );
};
