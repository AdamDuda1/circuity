# Circuity

A little project I'm working on... I'm too lazy to write the readme at the moment, so just try it out (https://circuity.vercel.app or https://circuity.deltos.space for production) :) Readme coming soon...

---

## TODO:

**IMPORTANT (in order):**

- [ ] Wires
- [ ] Add simulating
- [ ] Add component inspection pa
- [x] ~~Add adding components to world~~

**OTHER:**

- [ ] Add alignment guides and step snapping setting
- [ ] Add something to get rid of event onPointerUp not registering on ex. alt+tab or window exit (onFocusLost/onLeave/sth like that???)
- [ ] ! remove unnecessary func references and move to globals.ts
- [ ] Move all constant strings to a constants file with array (=> translations possible)
- [ ] Make movement on mobile
- [ ] Add grouping components by type (`<ng-content>`)
- [ ] Add simulation controls (controlPanel) component
- [ ] Add component categories, favourites and info manels
- [ ] Add component states (ins, outs, power, color)
- [ ] Fix canvas clipping under palette (??, `background: white; z-index: 5;` + position relative)

---

Also here is the command to generate a new component in Angular on windows if you have the env variables broken that I can't remember:

`npx --package @angular/cli ng g c palette`