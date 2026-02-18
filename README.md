# Circuity

A little project I'm working on... I'm too lazy to write the readme at the moment, so just try it out (https://circuity.vercel.app or https://circuity.deltos.space for production) :) Readme coming soon...

---

## TODO:

**IMPORTANT (in order):**

- [ ] Add simulating
- [ ] Add component inspection pa
- [ ] Sort elements in the design by ViewOrder (last selected desc)
- [x] ~~**FIX:** The first drawn wire dot is always bigger~~
- [x] ~~Wires~~
- [x] ~~Add adding components to world~~

**OTHER:**

- [ ] (??) Add separate methods for mouseOverComponent and Pin in general (not only for each component)
- [ ] Pick color for the selection indicator
- [ ] Add alignment guides and step snapping setting
- [ ] Add something to get rid of event onPointerUp not registering on ex. alt+tab or window exit (onFocusLost/onLeave/sth like that???)
- [ ] Move all constant strings to a constants file with array (=> translations possible)
- [ ] Add grouping components by type (`<ng-content>`)
- [ ] Add component categories, favourites and info manels
- [ ] Fix canvas clipping under palette (??, `background: white; z-index: 5;` + position relative)
- [x] ~~Add simulation controls (controlPanel) component~~
- [x] ~~Add component states (ins, outs, power, color)~~
- [x] ~~Make movement on mobile~~
- [x] ~~! remove unnecessary func references and move to globals.ts~~

---

Also here is the command to generate a new component in Angular on windows if you have the env variables broken that I can't remember:

`npx --package @angular/cli ng g c palette`
