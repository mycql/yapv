import { CSSProperties, ReactNode } from 'react';
import { ComponentMaker, H } from './types';
import { Coord, Location } from '../core/models/types';
import { ConnectorRenderModel, Label, LabelRenderModel, TextRenderModel } from '../core/transformer/circular/types';
import { LabelTypes, PI } from '../core/models';
import { canvasContextTextMeasurer, textContentWidth, toCamelCaseKeys, toCartesianCoords } from '../core/util';
import { generateId } from './common';

function textAlongPath(h: H) {
  return (label: TextRenderModel, labelStyle: CSSProperties): JSX.Element => {
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
    const textPathAttrs = {
      'xlink:href': pathRef,
      'href': pathRef,
    };
    // non-chrome like browsers do not implement 'letter-spacing'
    // svg style, so use 'textLength' attribute instead
    const textLength: number = textContentWidth(content.split(''), charInfo);
    const pathAttrs = {
      id: pathId,
      style: pathStyle,
      d: path,
    };
    const textAttrs = {
      textLength,
      dy: '0.5ex',
      style: labelStyle,
    };
    // why an additional 'attrs' property? well, we
    // have Vue's not so portable 'h' implementation
    // to thank for that
    // also, Vue expects child elements to come in
    // the form of array, so there you go
    return (
      <g>
        {
          [
            <path {...{...pathAttrs, attrs: { ...pathAttrs}}}></path>,
            <text {...{...textAttrs, attrs: { ...textAttrs}}}>
              {
                [
                  <textPath {...{...textPathAttrs, attrs: { ...textPathAttrs}}}>{content}</textPath>,
                ]
              }
            </text>,
          ]
        }
      </g>
    );
  };
}

function textAlongAxis(h: H) {
  return (label: TextRenderModel, labelStyle: CSSProperties): JSX.Element => {
    const { charInfo, content, position } = label;
    // non-chrome like browsers do not implement 'letter-spacing'
    // svg style, so use 'textLength' attribute instead
    const textLength: number = textContentWidth(content.split(''), charInfo);
    const { x, y } = position;
    const attrs = {
      x,
      y,
      textLength,
      dy: '0.5ex',
      style: labelStyle,
    };
    // why an additional 'attrs' property? well, we
    // have Vue's not so portable 'h' implementation
    // to thank for that
    return (
      <text {...{...attrs, attrs: { ...attrs}}}>{content}</text>
    );
  };
}

function polyLines(h: H) {
  return (params: ConnectorRenderModel): JSX.Element => {
    const style = { ...(params.style || {}), ...{ fill: 'transparent' }};
    const cssProps: CSSProperties = toCamelCaseKeys(style);
    const paths: string[] = [
      `${params.from.x} ${params.from.y}`,
      ...params.to.map((coord: Coord) => `${coord.x} ${coord.y}`),
    ];
    const attrs = {
      points: paths.join(', '),
      style: cssProps,
    };
    // why an additional 'attrs' property? well, we
    // have Vue's not so portable 'h' implementation
    // to thank for that
    return (<polyline {...{...attrs, attrs: { ...attrs}}} />);
  };
}

const createRenderer: ComponentMaker<LabelRenderModel> = (h: H) => {
  return (params: LabelRenderModel, children: ReactNode[]) => {
    const { connector, label, type } = params;
    const { style } = label;
    const labelStyle = style || {};
    const textAnchor: string = type === LabelTypes.TEXT ? 'middle' : 'start';
    const normLabelStyle = { ...labelStyle, ...{ 'text-anchor': textAnchor } };
    const cssProps: CSSProperties = toCamelCaseKeys(normLabelStyle);
    const labelComponent: JSX.Element = type === LabelTypes.TEXT ?
      textAlongAxis(h)(label, cssProps) : textAlongPath(h)(label, cssProps);
    if (connector) {
      const connectorComponent: JSX.Element = polyLines(h)(connector);
      return (
        <g>
          {
            [
              labelComponent,
              connectorComponent,
            ]
          }
        </g>
      );
    } else {
      return labelComponent;
    }
  };
};

export type LabelComponentMaker = ComponentMaker<Label>;
export const LabelComponent: LabelComponentMaker = (h: H) => {
  const render = createRenderer(h);
  return (props: Label) => {
    const { layout } = props;
    const { scale, canvasContext } = layout;
    const params = layout.label(props, scale, canvasContextTextMeasurer(canvasContext()));
    return render(params, []);
  };
};
