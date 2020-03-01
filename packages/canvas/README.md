# `@yapv/canvas`
[![Build Status](https://travis-ci.com/mycql/yapv.svg?branch=master)](https://travis-ci.com/mycql/yapv)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm version](https://badge.fury.io/js/%40yapv%2Fcanvas.svg)](https://badge.fury.io/js/%40yapv%2Fcanvas)

Renders the plasmid map in an HTML5 Canvas, re-rendering on every draw request.

## Usage

```typescript
import YAPV from '@yapv/core';
import Canvas from '@yapv/canvas';

const data = { ... }
const workspace = document.querySelector('#workspace');
// Attaches the viewer to the HTML element with the specified selector
const plasmidViewer = YAPV.create(workspace);
// Use the Canvas renderer
plasmidViewer.use(Canvas.circular);
// Draw it!
plasmidViewer.draw(data);
```

The 'data' instance is a JS object that conforms to the schema specified [here](../core/src/schema.json). There are several [sample files](../../examples/data) you can use as a reference.
