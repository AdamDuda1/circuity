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

	selectedMethod = signal<string>('local-copy');

	// onMethodChange(event: Event) {
	// 	const target = event.target as HTMLSelectElement;
	// 	this.selectedMethod.set(target.value);
	// }

	execute() {
		switch (this.selectedMethod()) {

		}
		this.exportJSON();
	}

	getButtonText() {
		return this.globals.constants.translations.simulationControls.savePanel.doneButtonText[0];
	}

	newDesign() { // TODO unselect when confirmation canceled!!
		if (confirm('This will clear your current design. If it wasn\'t saved it will be lost.')) {

		}
	}

	exportJSON() {
		const json = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		const blob = new Blob([json], {type: 'application/json'});

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'circuity-design' /*+ new Date("DD-MM-YYYY")*/ + '.json'; // TODO filename?
		a.click();
		URL.revokeObjectURL(url);
	}

	loadJSON() {

	}
}
