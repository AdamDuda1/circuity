import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SimulationControls } from '../simulation-controls/simulation-controls';
import { ComponentProperties } from '../component-properties/component-properties';
import { Palette } from '../palette/palette';
import { Canvas } from '../canvas/canvas';

@Component({
	selector: 'app-home',
	template: `
		<div id="tr" class="absolute top-2.5 right-2.5">
			<app-simulation-controls/>
			<app-component-properties/>
		</div>
		<app-palette/>
		<app-canvas/>
	`,
	imports: [SimulationControls, ComponentProperties, Palette, Canvas],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'contents',
	}
})
export class Home {}
