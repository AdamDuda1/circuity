import { Component, signal } from '@angular/core';
import { Globals } from '../../globals';
import { SaveLoad } from './save-load';
import { _Toast } from '../../toasts';

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

	chosenSaveMethod = signal<string>('JSON');
	saveOrLoad = signal<'save' | 'load'>('save');
	saveLoad!: SaveLoad;

	// onMethodChange(event: Event) {
	// 	const target = event.target as HTMLSelectElement;
	// 	this.selectedMethod.set(target.value);
	// }

	executeSave() {
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

	executeLoad() {
		switch (this.chosenSaveMethod()) {
			case 'load-JSON':
				this.saveLoad.exportJSON();
				break;
			case 'load-cloud':
				this.saveLoad.cloudUpload(true);
				break;
			default:
				alert('Unknown load method:' + this.chosenSaveMethod());
				break;
		}
	}

	newDesign(event: Event) {
		const shouldClear = confirm('This will clear your current design. If it wasn\'t saved it will be lost.');

		if (!shouldClear) {
			const currentButton = event.target as HTMLInputElement | null;
			if (currentButton) currentButton.checked = false;

			const fallbackId = this.saveOrLoad() === 'save' ? 'btnradio1' : 'btnradio2';
			const fallbackButton = document.getElementById(fallbackId) as HTMLInputElement | null;
			if (fallbackButton) fallbackButton.checked = true;
			return;
		}

		if (this.globals.simulation.running()) this.globals.simulation.switch();

		this.globals.selected = -1;
		this.globals.simulation.circuitComponents.set([]);
		this.globals.savePanel_open.set(false);
		_Toast.success('Old design cleared!');
	}
}
