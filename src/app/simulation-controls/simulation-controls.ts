import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Globals } from '../globals';

@Component({
	selector: 'app-simulation-controls',
	imports: [],
	templateUrl: './simulation-controls.html',
	styleUrls: ['./simulation-controls.css', './select.css'],
	host: {
		'(document:pointerdown)': 'onDocumentClick($event)',
	},
})
export class SimulationControls {
	constructor(public globals: Globals) {}

	isHovered = signal(false);
	selectedMethod = signal<string>('local-copy');
	panelOpen = signal(false);

	onMethodChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		this.selectedMethod.set(target.value);
	}

	getButtonText() {
		return this.globals.constants.translations.simulationControls.savePanel.doneButtonText[0];
	}

	getButtonIcon() {
		if (this.selectedMethod() === 'local-copy') return 'content_copy';
		else if (this.selectedMethod() === 'cloud-public') return 'cloud_upload';
		else return 'save';
	}

	onClick() {
		this.globals.simulation.switch();
	}

	panelRef = viewChild<ElementRef<HTMLDetailsElement>>('panel');

	onDocumentClick(event: Event) {
		const el = this.panelRef()?.nativeElement;
		if (el && !el.contains(event.target as Node)) {
			this.panelOpen.set(false);
		}
	}
}
