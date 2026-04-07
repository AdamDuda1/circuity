import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';
import { SaveLoad } from './save-load';

@Component({
	selector: 'app-save-panel',
	imports: [],
	templateUrl: './save-panel.html',
	styleUrl: '../popup-panel.css'
})
export class SavePanel {
	constructor(public globals: Globals) {
		this.saveLoad = new SaveLoad(this.globals);
	}

	chosenSaveMethod = signal<string>('localStorage');
	saveLoad!: SaveLoad;

	// onMethodChange(event: Event) {
	// 	const target = event.target as HTMLSelectElement;
	// 	this.selectedMethod.set(target.value);
	// }

	execute() {
		switch (this.chosenSaveMethod()) {
			case 'localStorage':
				break;
			case 'JSON':
				this.saveLoad.exportJSON();
				break;
			case 'cloud-public':
				this.saveLoad.cloudUpload(true);
				break;
			case 'cloud-private':
				this.saveLoad.cloudUpload(false);
				break;
			default:
				alert('Unknown save method:' + this.chosenSaveMethod());
				break;
		}
	}

	getButtonText() {
		return this.globals.constants.translations.simulationControls.savePanel.doneButtonText[0];
	}

	newDesign() { // TODO unselect when confirmation canceled!!
		if (confirm('This will clear your current design. If it wasn\'t saved it will be lost.')) {

		}
	}
}
