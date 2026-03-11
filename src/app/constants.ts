export class Constants {
	public readonly categoryName = {
		basicLogicGates: 'Basic Logic Gates',
		input: 'Input',
		output: 'Output',
		derivedLogicGates: 'Derived Logic Gates'
	};

	public readonly favoriteCategory = 'Favorites';

	public readonly translations = {
		simulationControls: {
			run: 'Run <span class="material-symbols-outlined"> play_arrow </span>',
			stop: 'Stop <span class="material-symbols-outlined"> stop </span>',
			keyboardShortcut: '[ space ]',
			savePanel: {
				doneButtonText: [
					'Save',
				]
			}
		},
		componentProperties: {
			title: 'Component Properties',
			name: 'Name',
			namePlaceholder: 'Name',
			type: 'Type',
			section1: 'basic',
			section2: 'positioning',
			section3: 'component-specific',
		},
		tutorial: {
			pages: [
				'Add components to the design by dragging them with your mouse onto the canvas or by double-clicking them in the palette.',
				'Connect the components with wires by dragging from pin to pin with your mouse.',
				'After connecting run the simulation by clicking the \'run\' button or by hitting space on your' +
				' keyboard.<br><br>You can always view an updated tutorial by clicking the tutorial button in the' +
				' bottom left corner of the app. Have fun!',
			],
			next: 'Next',
			prev: 'Previous',
			close: 'Let\'s go!'
		},

		common: {
			cancel: 'Cancel',
		}
	}

	public readonly pinSelectionZone = 3;
}
