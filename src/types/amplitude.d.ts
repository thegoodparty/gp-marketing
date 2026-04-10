declare global {
	interface Window {
		amplitude?: {
			init(apiKey: string, options?: {
				fetchRemoteConfig?: boolean;
				autocapture?: boolean;
				/** Prefer beacon so events survive full-page navigation / unload. */
				transport?: 'fetch' | 'xhr' | 'beacon';
			}): void;
			add?(plugin: unknown): void;
			track(eventName: string, eventProperties?: Record<string, unknown>): void;
			getDeviceId?(): string;
		};
		experiment?: {
			variant(key: string): { value?: string };
			exposure(key: string): void;
			fetch(): Promise<unknown>;
		};
		sessionReplay?: {
			plugin(options: { sampleRate: number }): unknown;
		};
		dataLayer?: Record<string, unknown>[];
	}
}

export {};
