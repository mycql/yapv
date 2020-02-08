# YAPV
## **Y**et **A**nother **P**lasmid **V**iewer

[![Build Status](https://travis-ci.com/mycql/yapv.svg?branch=master)](https://travis-ci.com/mycql/yapv)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

### What is it?

YAPV is a library for building views for plasmid maps which is a common way to represent [vectors](https://en.wikipedia.org/wiki/Vector_%28molecular_biology%29). You can read more about there [here](https://bitesizebio.com/43119/the-beginners-guide-to-reading-plasmid-maps/) or [here](https://pediaa.com/how-to-read-a-plasmid-map/).

They usually look like this:

<iframe src="https://duckduckgo.com/?q=plasmid&t=ffab&iar=images&iax=images&ia=images"></iframe>

### How do I use it? Show me the code!
YAPV is composed of renderer implementations as modules. You choose which renderer you want to use.


```typescript
import YAPV from '@yapv/core';
import SVG from '@yapv/svg';

const data = { ... }
const workspace = document.querySelector('#workspace');
const plasmidViewer = YAPV.create(workspace).use(SVG.circular);
plasmidViewer.draw(data);
```

### Want to report a bug or request a feature?
Please feel free to file an [issue](https://github.com/mycql/yapv/issues). We'll try our best to find time and sort it out. ^_^

### Want to contribute to YAPV?
Well that's great! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) to get started with setting up the repo.

### How is this repo structured?
The YAPV repo is managed as a [monorepo](https://en.wikipedia.org/wiki/Monorepo) that is composed of several renderer implementation packages.


### License
[MIT](./LICENSE)
