type HubSpotFormCreateOptions = {
	portalId: string;
	formId: string;
	target: string;
	region?: string;
	onFormReady?(): void;
	onFormSubmitted?(): void;
};

export type HubSpotFormsApi = {
	create(options: HubSpotFormCreateOptions): void;
};

declare global {
	interface Window {
		hbspt?: {
			forms: HubSpotFormsApi;
		};
	}
}

const SCRIPT_TIMEOUT_MS = 10_000;
const SCRIPT_POLL_MS = 250;

export async function waitForHubSpotForms(isCancelled: () => boolean): Promise<HubSpotFormsApi> {
	return new Promise((resolve, reject) => {
		const started = Date.now();

		const check = () => {
			if (isCancelled()) {
				reject(new Error('HubSpot form wait cancelled'));
				return;
			}

			const forms = window.hbspt?.forms;
			if (forms?.create) {
				resolve(forms);
				return;
			}

			if (Date.now() - started >= SCRIPT_TIMEOUT_MS) {
				reject(new Error('HubSpot forms script did not load'));
				return;
			}

			window.setTimeout(check, SCRIPT_POLL_MS);
		};

		check();
	});
}
