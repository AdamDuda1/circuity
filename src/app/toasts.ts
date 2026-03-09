import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({ providedIn: 'root' })
export class Toast {
	private static injector: EnvironmentInjector;

	static init(injector: EnvironmentInjector) {
		Toast.injector = injector;
	}

	private static get toast(): HotToastService {
		return Toast.injector.get(HotToastService);
	}

	static success(msg: string) {
		Toast.toast.success(msg);
	}

	static error(msg: string) {
		Toast.toast.error(msg);
	}

	static info(msg: string) {
		Toast.toast.info(msg);
	}
}
