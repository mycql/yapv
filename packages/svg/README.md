# `@yapv/svg`
[![Build Status](https://travis-ci.com/mycql/yapv.svg?branch=master)](https://travis-ci.com/mycql/yapv)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm version](https://badge.fury.io/js/%40yapv%2Fsvg.svg)](https://badge.fury.io/js/%40yapv%2Fsvg)

Renders a plasmid map in SVG using a virtual dom, updating the SVG nodes on every draw request only when needed.

## Usage

```typescript
import YAPV from '@yapv/core';
import SVG from '@yapv/svg';

const data = { ... }
const workspace = document.querySelector('#workspace');
// Attaches the viewer to the HTML element with the specified selector
const plasmidViewer = YAPV.create(workspace);
// Use the SVG renderer
plasmidViewer.use(SVG.circular);
// Draw it!
plasmidViewer.draw(data);
```

The 'data' instance is a JS object that conforms to the schema specified [here](../core/src/schema.json). There are several [sample files](../../examples/data) you can use as a reference.
