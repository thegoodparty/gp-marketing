/** The Meta pixel global set up by `~/ui/FacebookPixel`. `trackCustom` is all the site calls beyond the PageView in the snippet. */
declare global {
	interface Window {
		fbq?(method: 'track' | 'trackCustom', eventName: string, parameters?: Record<string, unknown>): void;
	}
}

export {};
