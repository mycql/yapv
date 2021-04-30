# Using YAPV with other libraries

YAPV's most flexible implementation [YAPV SVG](https://www.npmjs.com/package/@yapv/svg), is built with functional components leveraging a [lightweight vdom combined with a hyperscript](https://github.com/jorgebucaran/hyperapp/tree/V1) based API, so it plays well with other vdom/hyperscript based libraries (e.g. React) and can leverage on component templating.

## Interop steps

Whichever among the view libraries you choose to integrate with, interoperability will involve these simple steps.

1. Wrap the function components using your chosen library (as can be seen in the fiddles below).
2. Create YAPV's circular layout object.
```javascript
  // create an object that will render elements with a circular
  // layout for a sequence having 5322 bp length.
	const layout = YAPV.layout.circular({ length: 5322 });
```
3. Propagate the layout to your components as props
```html
  <!-- As a sidenote, as the components are merely functions, you can name -->
  <!-- the components whatever you like when you bootstrap them -->
  <Track layout={layout} ...other props/>
  <Axis layout={layout} ...other props/>
  <Marker layout={layout} ...other props>
  <Label layout={layout} ...other props>
```


## Using YAPV with React and JSX

Using YAPV with React is dead easy. Just use React's [createElement](https://reactjs.org/docs/react-api.html#createelement) function to bootstrap the components and you're off.

<iframe
     src="https://codesandbox.io/embed/hopeful-hugle-zm0cg?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.js&theme=light"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="hopeful-hugle-zm0cg"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## Using YAPV with Vue and Single File Components

Usage with Vue has a little more boilerplate, but is still relatively easy. There's also more than one way you can do it. You can use Vue's JSX [interoperability](https://vuejs.org/v2/guide/render-function.html) and follow the same way like what's shown above with React. However, one of Vue's appeal is it's [Single File Components](https://vuejs.org/v2/guide/single-file-components.html), so we can also leverage that when building our map.

<iframe
     src="https://codesandbox.io/embed/spring-shadow-dfzyu?autoresize=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2FApp.vue&theme=light"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="spring-shadow-dfzyu"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   >
</iframe>
