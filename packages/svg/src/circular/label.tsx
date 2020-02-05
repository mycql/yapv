import { CSSProperties } from 'react';
import core from './core';
import { generateId } from './common';
import {
  ConnectorRenderModel,
  LabelRenderModel,
  TextRenderModel,
} from '../../../core/src/transformer/circular/types';
import { Coord, LabelTypes, Location, PI } from '../../../core/src/models';
import { textContentWidth, toCamelCaseKeys, toCartesianCoords } from '../../../core/src/util';

const { h } = core;

function textAlongPath(label: TextRenderModel, labelStyle: CSSProperties): JSX.Element {
  const { anglesInRadians, charInfo, content, distance } = label;
  const pathStyle: CSSProperties = {
    fill: 'none',
    stroke: 'none',
  };
  let path: string = '';
  if (anglesInRadians) {
    const center: Coord = { x: 0, y: 0 };
    const pathLocation: Location = anglesInRadians.path;
    const startAngle: number = pathLocation.start;
    const endAngle: number = pathLocation.end;
    const start: Coord = toCartesianCoords(center, distance, startAngle);
    const end: Coord = toCartesianCoords(center, distance, endAngle);
    let largeArcFlag;
    if (startAngle < endAngle) {
      largeArcFlag = endAngle - startAngle <= PI.WHOLE ? '0' : '1';
    } else {
      largeArcFlag = endAngle - startAngle <= PI.WHOLE ? '1' : '0';
    }
    path = [
      `M ${start.x} ${start.y}`,
      `A ${distance} ${distance} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    ].join(' ');
  }
  const pathId: string = `tpath${generateId()}`;
  const pathRef: string = `#${pathId}`;
  const attrs = {
    'xlink:href': pathRef,
    'href': pathRef,
  };
  // non-chrome like browsers do not implement 'letter-spacing'
  // svg style, so use 'textLength' attribute instead
  const textLength: number = textContentWidth(content.split(''), charInfo);
  return (
    <g>
      <path id={pathId} style={pathStyle} d={path}></path>
      <text dy='0.5ex' style={labelStyle} textLength={textLength}>
        <textPath {...attrs}>{content}</textPath>
      </text>
    </g>
  );
}

function textAlongAxis(label: TextRenderModel, labelStyle: CSSProperties): JSX.Element {
  const { charInfo, content, position } = label;
  // non-chrome like browsers do not implement 'letter-spacing'
  // svg style, so use 'textLength' attribute instead
  const textLength: number = textContentWidth(content.split(''), charInfo);
  return (
    <text dy='0.5ex' x={position.x} y={position.y} style={labelStyle} textLength={textLength}>{content}</text>
  );
}

function polyLines(params: ConnectorRenderModel): JSX.Element {
  const style = { ...(params.style || {}), ...{ fill: 'transparent' }};
  const cssProps: CSSProperties = toCamelCaseKeys(style);
  const paths: string[] = [
    `${params.from.x} ${params.from.y}`,
    ...params.to.map((coord: Coord) => `${coord.x} ${coord.y}`),
  ];
  return (<polyline points={paths.join(', ')} style={cssProps} />);
}

export const Label = (params: LabelRenderModel) => {
  const { connector, label, type } = params;
  const { style } = label;
  const labelStyle = style || {};
  const textAnchor: string = type === LabelTypes.TEXT ? 'middle' : 'start';
  const normLabelStyle = { ...labelStyle, ...{ 'text-anchor': textAnchor } };
  const cssProps: CSSProperties = toCamelCaseKeys(normLabelStyle);
  const labelComponent: JSX.Element = type === LabelTypes.TEXT ?
    textAlongAxis(label, cssProps) : textAlongPath(label, cssProps);
  if (connector) {
    const connectorComponent: JSX.Element = polyLines(connector);
    return (
      <g>
        {labelComponent}
        {connectorComponent}
      </g>
    );
  } else {
    return labelComponent;
  }
};
