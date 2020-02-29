# `@yapv/svg`

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
