import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Globals } from '../../globals';
import { SaveLoad } from './save-load';
import { _Toast } from '../../toasts';

@Component({
	selector: 'app-save-panel',
	imports: [ReactiveFormsModule],
	templateUrl: './save-panel.html',
	styleUrl: '../popup-panel.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavePanel {
	private readonly formBuilder = inject(FormBuilder);

	constructor(public globals: Globals) {
		this.saveLoad = new SaveLoad(this.globals);
	}

	chosenSaveMethod = signal<string>('JSON');
	saveOrLoad = signal<'save' | 'load'>('save');
	saveLoad!: SaveLoad;
	readonly cloudSaveForm = this.formBuilder.nonNullable.group({
		author: ['', Validators.required],
		name: ['', Validators.required],
		description: ['', Validators.required],
		secret: [this.generateSecretValue(), Validators.required]
	});
	readonly cloudLoadForm = this.formBuilder.nonNullable.group({
		secret: ['', Validators.required]
	});

	executeSave() {
		switch (this.chosenSaveMethod()) {
			case 'localStorage':
				break;
			case 'JSON':
				this.saveLoad.exportJSON();
				break;
			case 'cloud-public':
				void this.executeCloudSave('public');
				break;
			case 'cloud-private':
				void this.executeCloudSave('private');
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
				void this.executeCloudLoad();
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

	generateSecret() {
		this.cloudSaveForm.controls.secret.setValue(this.generateSecretValue());
	}

	async copySecret() {
		const secret = this.cloudSaveForm.controls.secret.value;
		if (!secret) {
			_Toast.warning('Generate a secret key first.');
			return;
		}

		try {
			await navigator.clipboard.writeText(secret);
			_Toast.success('Secret key copied.');
		} catch {
			_Toast.error('Could not copy secret key.');
		}
	}

	private async executeCloudSave(visibility: 'public' | 'private') {
		if (this.cloudSaveForm.invalid) {
			this.cloudSaveForm.markAllAsTouched();
			_Toast.warning('Fill in all cloud save fields.');
			return;
		}

		try {
			const form = this.cloudSaveForm.getRawValue();
			await this.saveLoad.createCloudProject({
				author: form.author,
				name: form.name,
				description: form.description,
				secret: form.secret,
				visibility
			});

			this.globals.savePanel_open.set(false);
			_Toast.success('Project saved to cloud.');
		} catch (error: unknown) {
			_Toast.error(this.getErrorMessage(error, 'Failed to save project to cloud.'));
		}
	}

	private async executeCloudLoad() {
		if (this.cloudLoadForm.invalid) {
			this.cloudLoadForm.markAllAsTouched();
			_Toast.warning('Provide a secret key.');
			return;
		}

		try {
			const {secret} = this.cloudLoadForm.getRawValue();
			const result = await this.saveLoad.loadCloudProject(secret);
			if (!result.loaded) {
				_Toast.error('Cloud project content is invalid.');
				return;
			}

			this.globals.selected = -1;
			this.globals.savePanel_open.set(false);
			_Toast.success(`Loaded cloud project: ${result.name}`);
		} catch (error: unknown) {
			_Toast.error(this.getErrorMessage(error, 'Failed to load project from cloud.'));
		}
	}

	private generateSecretValue(length = 64): string {
		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let secret = '';

		if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
			const random = new Uint32Array(length);
			crypto.getRandomValues(random);
			for (const value of random) {
				secret += alphabet[value % alphabet.length];
			}
			return secret;
		}

		for (let i = 0; i < length; i++) {
			secret += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
		return secret;
	}

	private getErrorMessage(error: unknown, fallback: string): string {
		if (typeof error !== 'object' || error === null) return fallback;
		const maybeError = error as { error?: { error?: string } };
		return maybeError.error?.error ?? fallback;
	}
}
