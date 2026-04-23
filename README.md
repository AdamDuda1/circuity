# <div align="center"><img src="public/icons/icon-192x192.png" alt="Circuity icon" width="25" /> Circuity</div>


<p align="center">
  <b>Build, test, and play with digital circuits in the browser.</b>
</p>

<p align="center">
  <a href="https://circuity.adamd.pl.eu.org">Live App</a>
  ·
  <a href="#contributing">Info andContributing</a>
  ·
  <a href="#todo">Roadmap</a>
</p>

<div align="center">
 	<img alt="frontend status" src="https://img.shields.io/website?logo=vercel&label=frontend&url=https%3A%2F%2Fcircuity.adamd.pl.eu.org" />
 	<img alt="backend status" src="https://img.shields.io/website?logo=railway&label=backend&url=https%3A%2F%2Fapi.circuity.adamd.pl.eu.org" />
 	<img alt="GitHub deployments" src="https://img.shields.io/github/deployments/AdamDuda1/circuity/Production?logo=vercel&label=deployment">
	<div>
		<img alt="hackatime" src="https://hackatime-badge.hackclub.com/U0AAK0EB2LE/circuity?color=darkgreen" />
		<img alt="hackatime" src="https://hackatime-badge.hackclub.com/U0AAK0EB2LE/circuity-backend?color=darkgreen&label=plus_backend" />
		<img alt="GitHub" src="https://imagecount.pythonanywhere.com/img?id=6dvQ4OTW4hSJNRKMqce_xw" />
	</div>
	<img alt="Angular" src="https://img.shields.io/badge/Angular-v20%2B-DD0031?logo=angular&logoColor=white" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" />
</div>

A ~~little~~ project I'm working on... I'm too lazy to write the readme at the moment, so just try it out at https://circuity.adamd.pl.eu (also available at https://circuity.vercel.app and https://circuity.deltos.space <-- might not be soon because the domain expires. Try and see what happens when you add `dev-` to the URL!) :) Readme coming soon...

---

## TODO:

<sub>done items are removed</sub>

- [ ] space should not work when focused on an input field (name, pin label, etc.)
- [ ] name field should auto select all
- [ ] solutions for levels -- hardcoded designs with solutions to levels to open in the edsign mode
- [ ] user created levels (user makes the design, the check is the matrix of the output pins for all combinations of the input pins?????) that would be a lotta coding
- [ ] saveState after modifying properties ONLY IF THE VALUE WAS MODIFIED!
- [ ] comment what was un/redid
- [ ] hovered palette component doesnt update after f used
- [ ] add multi-select (shift + click, ctrl + click, right click & drag??)
- [ ] do something with the debug info at the bottom left of canvas (currently hidden bahind the palette)
- [ ] (somehow) merge global_styles.scss and styles.css (in src/)
- [ ] add previews in palette component details back
- [ ] optimize the data by saving only changed component properties1!
- [ ] notifications for the admins when anything is posted by a user
- [ ] ask the user if ctrl+S should save in save_last (localStorage) or open the save panel (or save in the last chosen location?????)
- [ ] add a keyboard shortcut to open the save panel and make esc close all popups
- [ ] fix savedDesign.view -- (??) calculate the zoom so all components are in the view, (??) make it avg of (x, y) of the components, not the center if one component is far away
- [ ] unselect when confirmation canceled <-- newDesign() in save panel
- [ ] the toast for blog fetching is still glitched
- [ ] Do something with the {-1, -1}, {-1, -1}, {.. pin initialization!
- [ ] Make the buzzer look better
- [ ] Add revert button (to default setting) in component properties like in davinci resolve
- [ ] Components right after spawn (by dragging or dropping) have huge decimal points (arent rounded up)
- [ ] Make the components actually snap TO THE GRID
- [ ] Add tutorials (~~general~~ + for each component)
- [ ] Add a gradient color when simulating on wires (HI or LO): <== keep??
- [ ] Add custom context menu
- [ ] (??) Add separate methods for mouseOverComponent and Pin in general (not only for each component)
- [ ] Pick color for the selection indicator
- [ ] Add alignment guides and step snapping setting
- [ ] Move all constant strings to a constants file with array (=> translations possible)
- [ ] Add component categories, favourites and info panels

---

Also here is the command to generate a new component in Angular on windows if you have the env variables broken that I can't remember:

`npx --package @angular/cli ng g c palette`
