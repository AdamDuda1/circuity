import { EnvironmentInjector, Injectable } from '@angular/core';
import { HotToastService, Toast } from '@ngxpert/hot-toast';

type ToastOptions = Partial<Pick<Toast<unknown>, "id" | "icon" | "duration" | "dismissible" | "autoClose" | "role" | "ariaLive" | "className" | "style" | "iconTheme" | "theme" | "position" | "closeStyle" | "persist" | "injector" | "data" | "attributes" | "group">>;

@Injectable({providedIn: 'root'})
export class _Toast {
	private static injector: EnvironmentInjector;

	static init(injector: EnvironmentInjector) {
		_Toast.injector = injector;
	}

	private static get toast(): HotToastService {
		return _Toast.injector.get(HotToastService);
	}

	private static defaultOptions(options: ToastOptions | undefined) {
		return { ...(options ?? {}),
			position: options?.position ?? 'bottom-right',
		} as ToastOptions;
	}

	static success(msg: string, options?: ToastOptions | undefined) {
		return _Toast.toast.success(msg, _Toast.defaultOptions(options));
	}

	static error(msg: string, options?: ToastOptions | undefined) {
		return _Toast.toast.error(msg, _Toast.defaultOptions(options));
	}

	static info(msg: string, options?: ToastOptions | undefined) {
		return _Toast.toast.info(msg, _Toast.defaultOptions(options));
	}

	static warning(msg: string, options?: ToastOptions | undefined) {
		return _Toast.toast.warning(msg, _Toast.defaultOptions(options));
	}

	static loading(msg: string, options?: ToastOptions | undefined) {
		return _Toast.toast.loading(msg, _Toast.defaultOptions(options));
	}
}
