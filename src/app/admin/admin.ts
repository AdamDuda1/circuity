import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Globals } from '../globals';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface BlogPost {
	title: string;
	text: string;
	media_type: string;
	media_link: string;
	created_at: string;
}

interface AdminUser {
	id: number;
	login: string;
	password: string;
}

interface ManagedProject {
	id: number;
	content: string;
	author: string;
	name: string;
	description: string;
	visibility: 'public' | 'private';
	created_at: string;
}

interface LoginResponse {
	token: string;
}

type ApiErrorPayload = {
	error?: string;
	message?: string;
};

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
	private readonly http: HttpClient = inject(HttpClient);
	protected readonly window = window;

	readonly isSubmitting = signal(false);
	readonly submitSuccess = signal(false);
	readonly submitError = signal<string | null>(null);

	protected readonly loadingPosts = signal(true);
	protected readonly loadingAdmins = signal(true);
	protected readonly blogPosts = signal([] as BlogPost[]);
	protected readonly admins = signal([] as AdminUser[]);
	protected readonly adminsError = signal<string | null>(null);
	protected readonly loadingProjects = signal(true);
	protected readonly projects = signal([] as ManagedProject[]);
	protected readonly projectsError = signal<string | null>(null);
	protected readonly editingProjectId = signal<number | null>(null);

	readonly blogForm = this.formBuilder.nonNullable.group({
		title: ['', [Validators.required, Validators.minLength(3)]],
		text: ['', [Validators.required, Validators.minLength(10)]],
		media_type: ['none'],
		// media_link is validated conditionally (only required when media_type !== 'none')
		media_link: [''],
		created_at: ['']
	});

	readonly projectEditForm = this.formBuilder.nonNullable.group({
		content: ['', Validators.required],
		author: ['', Validators.required],
		description: ['', Validators.required]
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
			this.blogForm.reset({title: '', text: '', media_type: 'none', media_link: '', created_at: ''});
		} catch (error) {
			this.submitError.set(error instanceof Error ? error.message : 'Error with no message :(\nTry logging out and back in.');
		} finally {
			this.isSubmitting.set(false);
		}
	}

	async createBlogPost(post: BlogPost): Promise<void> {
		await firstValueFrom(
			this.http.post<void>(this.globals.database + 'blog/create', post, {
				headers: this.createAuthHeaders()
			})
		);
	}

	async login(): Promise<void> {
		const login = this.window.document.querySelector<HTMLInputElement>('#adminLogin')?.value.trim() ?? '';
		const password = this.window.document.querySelector<HTMLInputElement>('#adminPassword')?.value ?? '';
		if (!login || !password) return;

		try {
			const response = await firstValueFrom(
				this.http.post<LoginResponse>(this.globals.database + 'admin_auth/login', {login, password})
			);

			localStorage.setItem('adminToken', response.token);
			alert('Welcome!');
			window.location.reload();
		} catch (error: unknown) {
			alert(this.readErrorMessage(error, 'Login failed.'));
		}
	}

	logout() {
		localStorage.removeItem('adminToken');
		window.location.reload();
	}

	async newAdmin(): Promise<void> {
		const login = this.window.document.querySelector<HTMLInputElement>('#newAdminLogin')?.value.trim() ?? '';
		const password = this.window.document.querySelector<HTMLInputElement>('#newAdminPassword')?.value ?? '';
		if (!login || !password) return;

		try {
			const response = await firstValueFrom(
				this.http.post<{ message?: string }>(
					this.globals.database + 'admin_auth/register',
					{login, password},
					{headers: this.createAuthHeaders()}
				)
			);

			alert(response.message ?? 'User created');
			await this.loadAdmins();
		} catch (error: unknown) {
			alert(this.readErrorMessage(error, 'Operation failed.'));
		}
	}

	ngOnInit() {
		this.loadPosts();
		if (this.window.location.href.includes('admins')) {
			this.loadAdmins();
		}
		if (this.window.location.href.includes('projects')) {
			this.loadProjects();
		}
	}

	async loadAdmins(): Promise<void> {
		this.loadingAdmins.set(true);
		this.adminsError.set(null);

		try {
			const admins = await firstValueFrom(
				this.http.get<AdminUser[]>(this.globals.database + 'admin_auth/list_admins', {
					headers: this.createAuthHeaders()
				})
			);
			this.admins.set(admins);
		} catch (error) {
			this.admins.set([]);
			this.adminsError.set(this.readErrorMessage(error, 'Couldn\'t load admin list.'));
		} finally {
			this.loadingAdmins.set(false);
		}
	}

	async loadPosts(): Promise<void> {
		this.loadingPosts.set(true);

		try {
			const posts = await firstValueFrom(this.http.get<BlogPost[]>(this.globals.database + 'blog/read'));
			this.blogPosts.set(posts);
		} catch (error) {
			this.submitError.set(this.readErrorMessage(error, 'Couldn\'t load blog posts list.'));
		} finally {
			this.loadingPosts.set(false);
		}
	}

	async loadProjects(): Promise<void> {
		this.loadingProjects.set(true);
		this.projectsError.set(null);

		try {
			const projects = await firstValueFrom(
				this.http.get<ManagedProject[]>(this.globals.database + 'projects/admin/list', {
					headers: this.createAuthHeaders()
				})
			);
			this.projects.set(projects);
		} catch (error: unknown) {
			this.projects.set([]);
			this.projectsError.set(this.readErrorMessage(error, 'Couldn\'t load projects list.'));
		} finally {
			this.loadingProjects.set(false);
		}
	}

	startProjectEdit(project: ManagedProject): void {
		this.editingProjectId.set(project.id);
		this.projectEditForm.setValue({
			content: project.content,
			author: project.author,
			description: project.description
		});
	}

	cancelProjectEdit(): void {
		this.editingProjectId.set(null);
		this.projectEditForm.reset({
			content: '',
			author: '',
			description: ''
		});
	}

	async saveProjectEdit(projectId: number): Promise<void> {
		if (this.projectEditForm.invalid) {
			this.projectEditForm.markAllAsTouched();
			return;
		}

		try {
			await firstValueFrom(
				this.http.patch<{status: 'success'}>(
					this.globals.database + `projects/admin/${projectId}`,
					this.projectEditForm.getRawValue(),
					{headers: this.createAuthHeaders()}
				)
			);

			alert('Project updated');
			this.cancelProjectEdit();
			await this.loadProjects();
		} catch (error: unknown) {
			alert(this.readErrorMessage(error, 'Could not update project.'));
		}
	}

	async deleteProject(projectId: number): Promise<void> {
		const shouldDelete = this.window.confirm('Delete this project permanently?');
		if (!shouldDelete) {
			return;
		}

		try {
			await firstValueFrom(
				this.http.delete<{status: 'success'}>(
					this.globals.database + `projects/admin/${projectId}`,
					{headers: this.createAuthHeaders()}
				)
			);

			if (this.editingProjectId() === projectId) {
				this.cancelProjectEdit();
			}

			await this.loadProjects();
			alert('Project deleted');
		} catch (error: unknown) {
			alert(this.readErrorMessage(error, 'Could not delete project.'));
		}
	}

	private createAuthHeaders(): HttpHeaders {
		const token = localStorage.getItem('adminToken') ?? '';
		return token
			? new HttpHeaders({Authorization: `Bearer ${token}`})
			: new HttpHeaders();
	}

	private readErrorMessage(error: unknown, fallbackMessage: string): string {
		if (!(error instanceof HttpErrorResponse)) {
			return error instanceof Error ? error.message : fallbackMessage;
		}

		if (typeof error.error === 'string' && error.error.trim()) {
			return error.error;
		}

		if (typeof error.error === 'object' && error.error !== null) {
			const payload = error.error as ApiErrorPayload;
			if (typeof payload.error === 'string' && payload.error.trim()) {
				return payload.error;
			}

			if (typeof payload.message === 'string' && payload.message.trim()) {
				return payload.message;
			}
		}

		return error.message || fallbackMessage;
	}

	protected readonly localStorage = localStorage;
}
