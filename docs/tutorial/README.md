# Tutorial

YAPV's data model revolves around setting dimensions, positioning and styling of its built-in component model. Ideally, you would be building higher level components abstracting away this model, so you should at least familiarize yourself with the model's properties.

## 1. Define the sequence constraint

First things first. Since we're dealing with sequences, we want to specify how long the sequence is that we want to represent. Internally, YAPV will use this information to scale the dimensions of the sequence regions we want to annotate relative to how large the reference sequence is.

```javscript
{
  sequenceConfig: {
    range: {
      start: 1,   // The start and end determines the
      end: 4361,  // location in the sequence the map represents
    },
  },
  ...
}
```

## 2. Define the map dimensions

We want to layout the dimensions of your map. The size of how you want your map to be rendered depends on you. You just have to specify them in YAPV's data model.

```javascript
{
  ...
  displayConfig: {
    height: 450, // the actual height of drawable content
    width: 450, // the actual width of drawable content
    viewBox: {
      height: 350, // the total height of the map in YAPV user space
      width: 350 // the total width of the map in YAPV user space
    },
  },
  ...
}
```

## 3. Layout your map using tracks

Now this is where it gets interesting. YAPV uses the concept of 'tracks' (as in train tracks) to lay out its components. It will render symbols inside of tracks and uses them for partitioning each section in the map. You can have as many tracks as you need inside a map.

```javascript
...
{
  tracks: [
    {
      displayConfig: {
        distance: 130, // for a circular renderer, this is the distance from the center of the map to the center of this track
        width: 10, // how wide do we want this track to be
        style: "stroke: black; fill: green;"
      },
    }
  ],
}
...
```

## 4. Define scales and axes

## 5. Annotate notable regions using markers

## 6. Tag your map with labels

