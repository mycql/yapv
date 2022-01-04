# YAPV (**Y**et **A**nother **P**lasmid **V**iewer)

[![Build Status](https://travis-ci.com/mycql/yapv.svg?branch=master)](https://travis-ci.com/mycql/yapv)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![npm version](https://badge.fury.io/js/%40yapv%2Fcore.svg)](https://badge.fury.io/js/%40yapv%2Fcore)

## What is it?

YAPV is a library for building views for plasmid maps with no external dependencies and is framework agnostic. Plasmid maps are a common way to represent [vectors](https://en.wikipedia.org/wiki/Vector_%28molecular_biology%29). If you do not have a molecular biology background and want to know more details on how to read one, you can read more about that [here](https://bitesizebio.com/43119/the-beginners-guide-to-reading-plasmid-maps/) or [here](https://pediaa.com/how-to-read-a-plasmid-map/).

They usually look like this:

![pacyc184](https://www.bocascientific.com/images/pacyc184.gif "https://www.bocascientific.com/")
![puc19](https://www.bocascientific.com/images/puc19.gif "https://www.bocascientific.com/")
![CAM14_TDNA_PlasmidMap](http://2014.igem.org/wiki/images/thumb/0/09/CAM14_TDNA_PlasmidMap.png/180px-CAM14_TDNA_PlasmidMap.png "http://2014.igem.org")

They can be drawn and interpreted in multiple different ways and this is exactly what YAPV is meant to do.

## Wait, what? Another plasmid viewer?

Yeah, yeah. I know what you're thinking. Sure there are tons of viewers out there that scientists can use instead, so why bother? Well my friend, most of them are part of a commercial software offering, and usually desktop based. There are really a limited options of web based open source viewers I can find. And well, I can't really find any other decent open source library alternatives that are composable and independent of frameworks, so here I am building one. ^_^

## Getting Started

YAPV is composed of renderer implementations as modules. You choose which renderer you want to use.

### With Node and NPM
```shell
npm install @yapv/core
# and install any of the renderers
npm install @yapv/svg
# OR
npm install @yapv/canvas
```
```javascript
import YAPV from '@yapv/core';
import SVG from '@yapv/svg';
import Canvas from '@yapv/canvas';
```

### Directly off html
UMD:
```html
<script src="https://unpkg.com/@yapv/core@0.2.2/lib/index.umd.js" />
// and use any of the renderers
<script src="https://unpkg.com/@yapv/svg@0.2.2/lib/index.umd.js" />
// OR
<script src="https://unpkg.com/@yapv/canvas@0.2.2/lib/index.umd.js" />
```
ES Modules:
```html
<script type="module" src="https://unpkg.com/@yapv/core@0.2.2/lib/index.esm.js" />
// and use any of the renderers
<script type="module" src="https://unpkg.com/@yapv/svg@0.2.2/lib/index.esm.js" />
// OR
<script type="module" src="https://unpkg.com/@yapv/canvas@0.2.2/lib/index.esm.js" />
```

### With Deno
```javascript
import YAPV from "https://unpkg.com/@yapv/core@0.2.2/lib/index.esm.js"
import SVG from "https://unpkg.com/@yapv/svg@0.2.2/lib/index.esm.js"
import Canvas from "https://unpkg.com/@yapv/svg@0.2.2/lib/index.esm.js"
```
For [deno](https://deno.land), since this is a web project that manipulates the DOM, make sure you let the deno compiler know via tsconfig.json.
```json
"compilerOptions": {
  "lib": ["DOM", "DOM.Iterable", "ES6"]
}
```

## How do I use it? Show me the code!
```javascript
const data = { ... }
const workspace = document.querySelector('#workspace');
// Attaches the viewer to the HTML element with the specified selector
const plasmidViewer = YAPV.create(workspace);
// Use the renderer implementation. Here, we use the SVG based renderer
plasmidViewer.use(SVG.circular);
// Draw it!
plasmidViewer.draw(data);
// We can swap that out, and draw again!
plasmidViewer.use(Canvas.circular);
plasmidViewer.draw(data);
```

The 'data' instance is a JS object that conforms to the schema below.

## Data Object Schema
[schema.json](https://raw.githubusercontent.com/mycql/yapv/master/packages/core/src/schema.json ':include :type=code')

## [Learn The Basics](tutorial/)

If you want more guidance, head over to the [Tutorial](tutorial/) section to get started on how to slowly build your data model from scratch.

## [Framework / Library Interoperability](interop/)

YAPV can be used together with some of the most popular UI libraries in the community. This [guide](interop/) can help you get started.
