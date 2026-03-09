import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import { HotToastService, Toast } from '@ngxpert/hot-toast';

@Injectable({providedIn: 'root'})
export class _Toast {
	private static injector: EnvironmentInjector;

	static init(injector: EnvironmentInjector) {
		_Toast.injector = injector;
	}

	private static get toast(): HotToastService {
		return _Toast.injector.get(HotToastService);
	}

	static success(msg: string, options?: Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">> | undefined) {
		return _Toast.toast.success(msg, options);
	}

	static error(msg: string, options?: Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">> | undefined) {
		return _Toast.toast.error(msg, options);
	}

	static info(msg: string, options?: Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">> | undefined) {
		return _Toast.toast.info(msg, options);
	}

	static warning(msg: string, options?: Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">> | undefined) {
		return _Toast.toast.warning(msg, options);
	}

	static loading(msg: string, options?: Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">> | undefined) {
		return _Toast.toast.loading(msg, options);
	}
}
