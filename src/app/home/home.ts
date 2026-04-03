import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SimulationControls } from '../simulation-controls/simulation-controls';
import { ComponentProperties } from '../component-properties/component-properties';
import { Palette } from '../palette/palette';
import { Canvas } from '../canvas/canvas';
import { Tutorial } from '../tutorial/tutorial';
import { SavePanel } from '../simulation-controls/save-panel/save-panel';
import { Settings } from '../simulation-controls/settings/settings';

@Component({
	selector: 'app-home',
	template: `
		<div class="flex h-full w-full">
			<div id="tr" class="absolute top-2.5 right-2.5 flex flex-row">
				<app-simulation-controls/>
				<app-component-properties class="absolute top-18.75 right-1.25" />
			</div>
			<app-palette/>
			<app-canvas/>
		</div>

		<app-save-panel/>
		<app-settings/>

		<app-tutorial/>
	`,
	styles: [`
		app-palette {
			width: 250px;
			box-shadow: -1px 0 24px 0 black;
			border-radius: 0 15px 15px 0;
		}
	`],
	imports: [SimulationControls, ComponentProperties, Palette, Canvas, Tutorial, SavePanel, Settings],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'contents',
	}
})
export class Home {}
