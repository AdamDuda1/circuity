import { Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';

@Injectable({providedIn: 'root'})
export class Toast {
	constructor(private toast: HotToastService) {}

	public success(msg: string) {
		this.toast.success(msg);
	}

	error(msg: string) {
		this.toast.error(msg);
	}

	info(msg: string) {
		this.toast.info(msg);
	}

}
