# YAPV Basics

YAPV's data model revolves around setting dimensions, positioning and styling of its built-in component model. In real world projects, you should be building higher level components abstracting away this model, so you should at least familiarize yourself with the model's properties.

We'll run through the data model explaining each section in detail. At the very end, you'll see code samples which you can play around with. If you'd rather skip this section, you can head straight to the fiddles [here](tutorial/?id=Samples).

## Step 1 - Define the sequence constraint

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

## Step 2 - Define the map dimensions

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

## Step 3 - Layout your map using tracks

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

## Step 4 - Define scales and axes

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
            distance: 6, // distance of each scale marker to the center of the axis on which it is to be displayed
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

Labels are completely optional, but if you do want to show the scale numbers, you definitely can by specifying the **label** property on each scale definition.

```javascript
...
scales: [
  {
    width: 10,
    distance: 6,
    ticks: [ 50, 100, 150, 200 ],
    style: "stroke: black; stroke-width: 2;",
    label: {
      type: "text",
      style: "text-anchor: middle; font: 10px \"Courier\", monotype; fill: black;",
      distance: 24 // distance from the center of the axis
    }
  }
]
...
```


## Step 5 - Annotate notable regions using markers

Within a plasmid map, there are certain regions that have a biological importance and we want to make sure that the user viewing the map knows that and knows where they are. This is a process we'll refer to as annotating. So we'll 'mark' these regions in the map. These markers, like axes and scales, are done per track. So you can have multiple markers at any single track.

```javascript
...
markers: [
  displayConfig: {
    width: 14,
    style: "stroke: black; fill: violet; stroke-opacity: 0.4; stroke-width: 2; stroke-linejoin: round;",
    // anchors are the arrow heads we can use to indicate the start/end of a marker
    anchor: {
      width: 20,
      height: 30,
    }
  },
  location: {
    start: 209,
    end: 863
  },
  direction: "+",
  // '+' - for clockwise (positive strand)
  // '-' - for counter clockwise (negative strand)
  // '#' - for no direction marker
  labels: [
    {
      text: "pCMV",
      displayConfig: {
        type: "path",
        // 'path' - text is rendered inside the marker
        // 'text' - text is rendered in parallel to the marker
        style:  "text-anchor: middle; font: 10px \"Courier New\", monospace; stroke: black; letter-spacing: 5px;"
      }
    }
  ]
]
...
```

## Samples

Combining and playing around with these properties will allow you to build more complex maps.

<iframe width="100%" height="420" src="//jsfiddle.net/mycql/gtk1sybr/30/embedded/result,js/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

<iframe width="100%" height="420" src="//jsfiddle.net/mycql/gtk1sybr/23/embedded/result,js/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

<iframe width="100%" height="420" src="//jsfiddle.net/mycql/gtk1sybr/27/embedded/result,js/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

