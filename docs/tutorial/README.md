# Tutorial (...in progress...)

YAPV's data model revolves around setting dimensions, positioning and styling of its built-in component model. In real world projects, you should be building higher level components abstracting away this model, so you should at least familiarize yourself with the model's properties.

We'll run through the data model explaining each section in detail. At the very end, you'll see the end result which you can play around with. If you'd rather skip this section, you can head straight to the fiddle [here](tutorial/?id=end-result).

## Define the sequence constraint

First things first. Since we're dealing with sequences, we want to specify how long the sequence is that we want to represent. Internally, YAPV will use this information to scale the dimensions of the sequence regions we want to annotate relative to how large the reference sequence is.

```javscript
{
  sequenceConfig: {
    range: {
      start: 1,   // The start and end determines the
      end: 6905,  // location in the sequence the map represents
    },
  },
  ...
}
```

## Define the map dimensions

We want to layout the dimensions of your map. The size of how you want your map to be rendered depends on you. You just have to specify them in YAPV's data model.

```javascript
{
  ...
  displayConfig: {
    height: 350, // the actual height of drawable content
    width: 350, // the actual width of drawable content
    viewBox: {
      height: 350, // the total height of the map in YAPV user space
      width: 350 // the total width of the map in YAPV user space
    },
  },
  ...
}
```
The default unit of measure for YAPV are in pixels, so any dimension related property are always rendered in pixel sizes. The **viewBox** property behaves similarly to SVG's [viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox), albeit not as extensive.

## Layout your map using tracks

Now this is where it gets interesting. YAPV uses the concept of 'tracks' (as in train tracks) to lay out its components. It will render symbols and texts inside of tracks and uses tracks as a means of partitioning each section in the map. You can have as many tracks as you need inside a map. Creating tracks marks the start of your visualization.

```javascript
...
{
  tracks: [
    {
      displayConfig: {
        distance: 120, // for a circular renderer, this is the distance from the center of the map to the center of this track
        width: 16, // how wide do we want this track to be
        style: "stroke: transparent; fill: transparent;" // similar to SVGs css properties
      },
    }
  ],
}
...
```

## Define scales and axes

Now we want to give users an idea of the ratio of the sequence they are viewing against the visualization they are being shown on screen. This is where axes and scales come in.

```javascript
...
{
  axes: [
    {
      displayConfig: {
        distance: 20, // distance from the middle of the track to the middle of this axis
        width: 2, // how wide do we want the axis to be
        style:  "fill: black;",
        scales: [ // you can have multiple scales shown (e.g. major, minor, ...)
          {
            width: 10,
            distance: 6,
            interval: 50, // show scales at every 50 bp interval
            style: "stroke: black; stroke-width: 2;",
          }
        ]
      },
    },
  ]
}
...
```

Instead of specifying the **interval** between scale, you can alternatively use the **total** property which will render N number of scales only throught the entire axis.

```javascript
...
scales: [
  {
    width: 10,
    distance: 6,
    total: 10, // renders 10 scale lines
    style: "stroke: black; stroke-width: 2;",
  }
]
...
```

If you want finer control on where to show the scale, you can use the **ticks** property which will render scale marks at every specified bp location.

```javascript
...
scales: [
  {
    width: 10,
    distance: 6,
    ticks: [ 50, 100, 150, 200 ],
    style: "stroke: black; stroke-width: 2;",
  }
]
...
```


## Annotate notable regions using markers

## Tag your map with labels

## End Result

<iframe width="100%" height="420" src="//jsfiddle.net/mycql/gtk1sybr/23/embedded/js,result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

