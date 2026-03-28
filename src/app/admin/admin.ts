import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Globals } from '../globals';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface BlogPost {
	title: string;
	text: string;
	media_link: string;
	created_at: string;
}

interface LoginResponse {
	token: string;
}

@Component({
	selector: 'app-admin',
	imports: [ReactiveFormsModule, CommonModule, RouterLink],
	templateUrl: './admin.html',
	styleUrl: './admin.css',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Admin implements OnInit {
	private readonly formBuilder = inject(FormBuilder);
	private readonly globals = inject(Globals);
	private readonly http = inject(HttpClient);
	protected readonly window = window;

	readonly isSubmitting = signal(false);
	readonly submitSuccess = signal(false);
	readonly submitError = signal<string | null>(null);

	readonly blogForm = this.formBuilder.nonNullable.group({
		title: ['', [Validators.required, Validators.minLength(3)]],
		text: ['', [Validators.required, Validators.minLength(10)]],
		media_link: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
		created_at: ['']
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
			this.blogForm.reset({title: '', text: '', media_link: ''});
		} catch (error) {
			this.submitError.set(error instanceof Error ? error.message : 'Nie udalo sie utworzyc posta.');
		} finally {
			this.isSubmitting.set(false);
		}
	}

	async createBlogPost(post: BlogPost): Promise<void> {
		const token = localStorage.getItem('adminToken') ?? '';
		const response = await fetch(this.globals.database + 'blog/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			},
			body: JSON.stringify(post)
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	}

	protected readonly loadingPosts = signal(true);
	protected readonly blogPosts = signal([] as BlogPost[]);

	login() {
		const login = this.window.document.querySelector<HTMLInputElement>('#adminLogin')?.value.trim() ?? '';
		const password = this.window.document.querySelector<HTMLInputElement>('#adminPassword')?.value ?? '';

		try {
			this.http.post<LoginResponse>(this.globals.database + 'admin_auth/login', { login, password })
				.subscribe({
					next: (res) => {
						localStorage.setItem('adminToken', res.token);
						alert('welcome!');
						window.location.reload();
					},
					error: (error: unknown) => {
						alert(error instanceof Error ? error.message : 'Login failed.');
					}
				});
		} catch (error: unknown) {
			alert(error instanceof Error ? error.message : 'Unexpected error.');
		}
	}

	logout() {
		localStorage.removeItem('adminToken');
		window.location.reload();
	}

	newAdmin() {
		const login = this.window.document.querySelector<HTMLInputElement>('#newAdminLogin')?.value.trim() ?? '';
		const password = this.window.document.querySelector<HTMLInputElement>('#newAdminPassword')?.value ?? '';

		const token = localStorage.getItem('adminToken') ?? '';
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		};

		this.http.post(
			this.globals.database + 'admin_auth/register',
			{ login, password },
			{ headers, responseType: 'text' as const }
		).subscribe({
			next: (res) => {
				alert(res);
			},
			error: (error: unknown) => {
				const message =
					typeof error === 'object' &&
					error !== null &&
					'error' in error &&
					typeof (error as { error: unknown }).error === 'string'
						? (error as { error: string }).error
						: error instanceof Error
							? error.message
							: 'Operation failed.';

				alert(message);
			}
		});
	}

	ngOnInit() {
		this.loadPosts();
	}

	async loadPosts(): Promise<void> {
		this.loadingPosts.set(true);

		try {
			const response = await fetch(this.globals.database + 'blog/read', {});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const posts = (await response.json()) as BlogPost[];
			this.blogPosts.set(posts);
		} finally {
			this.loadingPosts.set(false);
		}
	}

	protected readonly localStorage = localStorage;
}
