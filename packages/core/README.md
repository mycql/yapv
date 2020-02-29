# `@yapv/core`

Contains the bootstrap functionality of YAPV. The core module is not used standalone and is always paired with a renderer.

## Usage

```typescript
import YAPV from '@yapv/core';
import SVG from '@yapv/svg';
import Canvas from '@yapv/canvas';

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
