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
			keyboardShortcut: '[ space ]'
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
	}

	public readonly pinSelectionZone = 3;
}
