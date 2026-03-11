declare global {
	interface Window {
		amplitude?: {
			init: (apiKey: string, options?: { fetchRemoteConfig?: boolean; autocapture?: boolean }) => void;
			add?: (plugin: unknown) => void;
		};
		experiment?: {
			variant: (key: string) => { value?: string };
			fetch: () => Promise<unknown>;
		};
		sessionReplay?: {
			plugin: (options: { sampleRate: number }) => unknown;
		};
	}
}

export {};
