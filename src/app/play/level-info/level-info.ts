import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../levels/level-interface';
import { LEVELS } from '../levels';
import { _Toast } from '../../toasts';
import { Globals } from '../../globals';

@Component({
	selector: 'app-level-info',
	imports: [RouterLink],
	templateUrl: './level-info.html',
	styleUrl: './level-info.css'
})
export class LevelInfo {
	private readonly globals = inject(Globals);
	readonly level = input.required<Level>();
	readonly verifyResult = signal<boolean | null>(null);
	private readonly confettiColors = ['#34d399', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa'];
	private readonly solvedDateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
	readonly currentIndex = computed(() => LEVELS.findIndex((level) => level.id === this.level().id));
	readonly previousLevelId = computed(() => {
		const index = this.currentIndex();
		return index > 0 ? LEVELS[index - 1].id : null;
	});
	readonly nextLevelId = computed(() => {
		const index = this.currentIndex();
		return index >= 0 && index < LEVELS.length - 1 ? LEVELS[index + 1].id : null;
	});

	constructor() {
		effect(() => {
			const level = this.level();
			this.verifyResult.set(this.readSolved(level.id));
		});
	}

	verify(event?: MouseEvent): void {
		const solved = this.level().verify(this.globals);
		this.verifyResult.set(solved);
		if (solved) {
			this.saveSolved(this.level().id);
			_Toast.success('Solved!');
			this.spawnConfetti(event);
		} else _Toast.error('Sorry, the verification failed! Make sure you have the correct component names entered.');
	}

	private spawnConfetti(event?: MouseEvent): void {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return;
		}

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const sourceX = event?.clientX ?? viewportWidth / 2;
		const sourceY = event?.clientY ?? viewportHeight / 2;

		const canvas = document.createElement('canvas');
		canvas.width = viewportWidth;
		canvas.height = viewportHeight;
		canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.pointerEvents = 'none';
		canvas.style.zIndex = '9999';
		document.body.appendChild(canvas);

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			canvas.remove();
			return;
		}

		const particles = Array.from({ length: 140 }, () => ({
			x: sourceX,
			y: sourceY,
			vx: (Math.random() - 0.5) * 12,
			vy: -Math.random() * 10 - 2,
			size: Math.random() * 8 + 4,
			color: this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)],
			rotation: Math.random() * Math.PI,
			rotationSpeed: (Math.random() - 0.5) * 0.3,
			life: 0
		}));

		const gravity = 0.3;
		const drag = 0.988;
		const maxLife = 120;

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (const particle of particles) {
				particle.vx *= drag;
				particle.vy = particle.vy * drag + gravity;
				particle.x += particle.vx;
				particle.y += particle.vy;
				particle.rotation += particle.rotationSpeed;
				particle.life += 1;

				ctx.save();
				ctx.translate(particle.x, particle.y);
				ctx.rotate(particle.rotation);
				ctx.fillStyle = particle.color;
				ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.8);
				ctx.restore();
			}

			if (particles.some((particle) => particle.life < maxLife && particle.y < canvas.height + 40)) {
				window.requestAnimationFrame(draw);
			} else {
				canvas.remove();
			}
		};

		window.requestAnimationFrame(draw);
	}

	private saveSolved(levelId: string): void {
		if (typeof localStorage === 'undefined') {
			return;
		}

		localStorage.setItem(`level${levelId}`, new Date().toISOString());
	}

	private readSolved(levelId: string): boolean {
		const storedValue = this.getStoredSolvedValue(levelId);
		if (storedValue === 'true') {
			return true;
		}

		if (!storedValue) {
			return false;
		}

		return this.parseSolvedDate(storedValue) !== null;
	}

	getStatusBannerText(): string {
		if (!this.verifyResult()) return 'Not solved';

		const storedValue = this.getStoredSolvedValue(this.level().id);
		if (!storedValue || storedValue === 'true') return 'Solved';
		const solvedDate = this.parseSolvedDate(storedValue);
		if (!solvedDate) return 'Solved';
		return `Solved on ${this.solvedDateFormatter.format(solvedDate)}`;
	}

	private getStoredSolvedValue(levelId: string): string | null {
		if (typeof localStorage === 'undefined') {
			return null;
		}

		return localStorage.getItem(`level${levelId}`);
	}

	private parseSolvedDate(value: string): Date | null {
		const solvedDate = new Date(value);
		return Number.isNaN(solvedDate.getTime()) ? null : solvedDate;
	}
}
