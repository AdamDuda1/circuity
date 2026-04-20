import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
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
	selectedDesignFileName = signal('');
	saveLoad!: SaveLoad;
	readonly designFileInput = viewChild<ElementRef<HTMLInputElement>>('designFileInput');
	readonly cloudSaveForm = this.formBuilder.nonNullable.group({
		author: [''],
		name: ['', Validators.required],
		description: [''],
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
				void this.executeJsonLoad();
				break;
			case 'load-cloud':
				void this.executeCloudLoad();
				break;
			default:
				alert('Unknown load method:' + this.chosenSaveMethod());
				break;
		}
	}

	onDesignFileChange() {
		const fileInput = this.designFileInput()?.nativeElement;
		const file = fileInput?.files?.item(0);
		this.selectedDesignFileName.set(file?.name ?? '');
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

		this.globals.clearSelected();
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
			_Toast.warning('Fill in all required cloud save fields.');
			return;
		}

		try {
			const form = this.cloudSaveForm.getRawValue();
			const author = form.author.trim() || 'anonymous';
			const description = form.description.trim() || 'no description';
			await this.saveLoad.createCloudProject({
				author,
				name: form.name,
				description,
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

			this.globals.clearSelected();
			this.globals.savePanel_open.set(false);
			_Toast.success(`Loaded cloud project: ${result.name}`);
		} catch (error: unknown) {
			_Toast.error(this.getErrorMessage(error, 'Failed to load project from cloud.'));
		}
	}

	private async executeJsonLoad() {
		const fileInput = this.designFileInput()?.nativeElement;
		const file = fileInput?.files?.item(0);

		if (!file) {
			_Toast.warning('Select a JSON file first.');
			return;
		}

		try {
			const loaded = await this.saveLoad.importJSON(file);
			if (!loaded) {
				_Toast.error('JSON file content is invalid.');
				return;
			}

			this.globals.clearSelected();
			this.globals.savePanel_open.set(false);
			_Toast.success(`Loaded JSON: ${file.name}`);
		} catch {
			_Toast.error('Failed to load JSON file.');
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
