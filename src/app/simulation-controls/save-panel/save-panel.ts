import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';

@Component({
	selector: 'app-save-panel',
	imports: [],
	templateUrl: './save-panel.html',
	styleUrl: '../popup-panel.css'
})
export class SavePanel {
	constructor(public globals: Globals) {}

	// selectedMethod = signal<string>('local-copy');
	//
	// onMethodChange(event: Event) {
	// 	const target = event.target as HTMLSelectElement;
	// 	this.selectedMethod.set(target.value);
	// }

	getButtonText() {
		return this.globals.constants.translations.simulationControls.savePanel.doneButtonText[0];
	}

	newDesign() { // TODO unselect when confirmation canceled!!
		if (confirm('This will clear your current design. If it wasn\'t saved it will be lost.')) {

		}
	}

	execute() {

	}
}
