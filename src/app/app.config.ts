import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, EnvironmentInjector, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHotToastConfig } from '@ngxpert/hot-toast';
import { provideAppInitializer } from '@angular/core';
import { _Toast } from './toasts';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideHttpClient(),
		provideBrowserGlobalErrorListeners(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: !isDevMode(),
			registrationStrategy: 'registerWhenStable:30000'
		}), provideHotToastConfig(),
		provideAppInitializer(() => {
			_Toast.init(inject(EnvironmentInjector));
		})
	]
};
