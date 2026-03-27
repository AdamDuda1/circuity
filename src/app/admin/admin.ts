import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Globals } from '../globals';
import { CommonModule } from '@angular/common';

interface BlogPost {
	title: string;
	text: string;
	media_link: string;
}

@Component({
	selector: 'app-admin',
	imports: [ReactiveFormsModule, CommonModule],
	templateUrl: './admin.html',
	styleUrl: './admin.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin {
	private readonly formBuilder = inject(FormBuilder);
	private readonly globals = inject(Globals);

	readonly isSubmitting = signal(false);
	readonly submitSuccess = signal(false);
	readonly submitError = signal<string | null>(null);

	readonly blogForm = this.formBuilder.nonNullable.group({
		title: ['', [Validators.required, Validators.minLength(3)]],
		text: ['', [Validators.required, Validators.minLength(10)]],
		media_link: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
	});

	async onSubmit(): Promise<void> {
		if (this.blogForm.invalid) {
			this.blogForm.markAllAsTouched();
			return;
		}

		this.isSubmitting.set(true);
		this.submitSuccess.set(false);
		this.submitError.set(null);

		try {
			await this.createBlogPost(this.blogForm.getRawValue());
			this.submitSuccess.set(true);
			this.blogForm.reset({ title: '', text: '', media_link: '' });
		} catch (error) {
			this.submitError.set(error instanceof Error ? error.message : 'Nie udalo sie utworzyc posta.');
		} finally {
			this.isSubmitting.set(false);
		}
	}

	async createBlogPost(post: BlogPost): Promise<void> {
		const response = await fetch(this.globals.database + 'blog/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(post)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	}
}
