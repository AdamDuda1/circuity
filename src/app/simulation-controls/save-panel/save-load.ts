import { Globals } from '../../globals';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';

export class SaveLoad {
	constructor(public globals: Globals) {}
	private readonly http: HttpClient = inject(HttpClient);

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

	getCurrentDesignSizeLabel(): string {
		const json = JSON.stringify(this.globals.data.getCurrentDesignJSON());
		const bytes = new Blob([json], {type: 'application/json'}).size;

		if (bytes < 1024) {
			return `${bytes} B`;
		}

		const kilobytes = bytes / 1024;
		if (kilobytes < 1024) {
			return `${kilobytes.toFixed(2)} KB`;
		}

		return `${(kilobytes / 1024).toFixed(2)} MB`;
	}

	loadJSON() {

	}

	async cloudUpload(is_public: boolean) {
		try {
			const body = {
				content: JSON.stringify(this.globals.data.getCurrentDesignJSON()),
				author: 'authr',
				visibility: is_public ? 'public' : 'private',
				secret: 'secret',
			};

			const response = await firstValueFrom(
				this.http.post<{ message?: string }>(
					this.globals.database + 'projects/create',
					body
				)
			);

			alert(response.message ?? 'ok');
		} catch (error: unknown) {
			alert(error);
		}
	}
}
