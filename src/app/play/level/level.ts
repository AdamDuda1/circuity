import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Canvas } from '../../canvas/canvas';
import { ComponentProperties } from '../../component-properties/component-properties';
import { Palette } from '../../palette/palette';
import { PaletteComponentDetails } from '../../palette/palette-component-details/palette-component-details';
import { SavePanel } from '../../simulation-controls/save-panel/save-panel';
import { Settings } from '../../simulation-controls/settings/settings';
import { SimulationControls } from '../../simulation-controls/simulation-controls';
import { Tutorial } from '../../tutorial/tutorial';
import { LevelInfo } from '../level-info/level-info';
import { LEVELS, getLevelById } from '../levels';

@Component({
	selector: 'app-level',
	imports: [
		Canvas,
		ComponentProperties,
		Palette,
		PaletteComponentDetails,
		SavePanel,
		Settings,
		SimulationControls,
		Tutorial,
		LevelInfo
	],
	templateUrl: './level.html',
	styleUrl: './level.css'
})
export class Level {
	private readonly route = inject(ActivatedRoute);
	private readonly levelId = toSignal(
		this.route.paramMap.pipe(map(params => params.get('level'))),
		{initialValue: this.route.snapshot.paramMap.get('level')}
	);

	readonly level = computed(() => getLevelById(this.levelId()) ?? LEVELS[0]);
}
