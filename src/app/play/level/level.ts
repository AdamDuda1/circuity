import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Canvas } from '../../canvas/canvas';
import { ComponentProperties } from '../../component-properties/component-properties';
import { Globals } from '../../globals';
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
export class Level implements OnDestroy {
	private readonly route = inject(ActivatedRoute);
	private readonly globals = inject(Globals);
	private readonly levelId = toSignal(
		this.route.paramMap.pipe(map(params => params.get('level'))),
		{initialValue: this.route.snapshot.paramMap.get('level')}
	);

	readonly level = computed(() => getLevelById(this.levelId()) ?? LEVELS[0]);

	constructor() {
		effect(() => {
			this.globals.playUsedIO.set(this.level().usedIO);
		});
	}

	ngOnDestroy(): void {
		this.globals.playUsedIO.set([]);
	}
}
