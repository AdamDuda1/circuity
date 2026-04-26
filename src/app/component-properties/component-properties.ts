import { Component } from '@angular/core';
import { Globals } from '../globals';
import { Buzzer } from '../components/buzzer';
import { Switch } from '../components/switch';
import { SignalSender } from '../components/signal-sender';
import { SignalReceiver } from '../components/signal-receiver';
import { Clock } from '../components/clock';
import { ElectricalComponent } from '../components/component-type-interface';

@Component({
	selector: 'category',
	standalone: true,
	template: `
		<div class="category-container">
			<div class="category-bar"></div>

			<div class="category-title">
				<ng-content></ng-content>
			</div>

			<div class="category-bar"></div>
		</div>
	`,
	styleUrl: 'component-properties.css'
})
export class Category {}


@Component({
	selector: 'app-component-properties',
	imports: [
		Category
	],
	templateUrl: './component-properties.html',
	styleUrl: './component-properties.css'
})
export class ComponentProperties {
	constructor(public globals: Globals) {}

	selectedComponent(): ElectricalComponent | null {
		if (this.globals.selected === -1) return null;
		return this.globals.simulation.circuitComponents().find(c => c.id === this.globals.selected) ?? null;
	}

	change_label(event: Event) {
		const selected = this.selectedComponent();
		if (!selected) return;
		selected.label = (event.target as HTMLInputElement).value;
	}

	selectInputText(event: FocusEvent) {
		const input = event.target;
		if (input instanceof HTMLInputElement) input.select();
	}

	change_showLabel(event: Event) {
		const selected = this.selectedComponent();
		if (!selected) return;
		selected.showLabel = (event.target as HTMLInputElement).checked;
	}

	change_color(event: Event) {
		const selected = this.selectedComponent();
		if (!selected) return;
		selected.color = (event.target as HTMLInputElement).value;
	}

	change_x(event: Event) {
		const selected = this.selectedComponent();
		if (!selected) return;
		selected.x = Number((event.target as HTMLInputElement).value);
	}

	change_y(event: Event) {
		const selected = this.selectedComponent();
		if (!selected) return;
		selected.y = Number((event.target as HTMLInputElement).value);
	}

	selectedBuzzer(): Buzzer | null {
		const selected = this.selectedComponent();
		return selected instanceof Buzzer ? selected : null;
	}

	selectedSwitch(): Switch | null {
		const selected = this.selectedComponent();
		return selected instanceof Switch ? selected : null;
	}

	selectedSignalSender(): SignalSender | null {
		const selected = this.selectedComponent();
		return selected instanceof SignalSender ? selected : null;
	}

	selectedSignalReceiver(): SignalReceiver | null {
		const selected = this.selectedComponent();
		return selected instanceof SignalReceiver ? selected : null;
	}

	selectedClock(): Clock | null {
		const selected = this.selectedComponent();
		return selected instanceof Clock ? selected : null;
	}

	buzzer_setFrequency(event: Event) {
		const selected = this.selectedBuzzer();
		if (!selected) return;
		selected.frequency = (event.target as HTMLInputElement).valueAsNumber;
	}

	buzzer_setVolume(event: Event) {
		const selected = this.selectedBuzzer();
		if (!selected) return;
		const val = Number((event.target as HTMLInputElement).value);
		if (Number.isNaN(val)) return;
		selected.setVolume(val);
	}

	switch_setMode(event: Event) {
		const selected = this.selectedSwitch();
		if (!selected) return;

		const mode = (event.target as HTMLSelectElement).value;
		if (mode === 'switch' || mode === 'button') selected.setMode(mode);
	}

	switch_setButtonReleaseDelayMs(event: Event) {
		const selected = this.selectedSwitch();
		if (!selected) return;
		selected.setButtonReleaseDelayMs((event.target as HTMLInputElement).valueAsNumber);
	}

	sender_setChannel(event: Event) {
		const selected = this.selectedSignalSender();
		if (!selected) return;
		selected.setChannel((event.target as HTMLInputElement).valueAsNumber);
	}

	receiver_setChannel(event: Event) {
		const selected = this.selectedSignalReceiver();
		if (!selected) return;
		selected.setChannel((event.target as HTMLInputElement).valueAsNumber);
	}

	clock_setFrequencyHz(event: Event) {
		const selected = this.selectedClock();
		if (!selected) return;
		selected.setFrequencyHz((event.target as HTMLInputElement).valueAsNumber);
	}

	clock_setDutyCyclePercent(event: Event) {
		const selected = this.selectedClock();
		if (!selected) return;

		const dutyPercent = (event.target as HTMLInputElement).valueAsNumber;
		if (!Number.isFinite(dutyPercent)) return;
		selected.setDutyCycle(dutyPercent / 100);
	}

	protected readonly Buzzer = Buzzer;
	protected readonly localStorage = localStorage;
}
