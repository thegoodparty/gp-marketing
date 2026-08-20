declare global {
	interface Window {
		/**
		 * Segment's analytics.js, installed by the inline snippet in `~/ui/Segment`.
		 * Optional because that snippet runs `afterInteractive`, so anything firing
		 * during hydration can still find it absent.
		 *
		 * Only the methods this app calls are declared. The snippet exposes the full
		 * analytics.js surface; widen this as call sites need it rather than
		 * importing Segment's types, which would pull the SDK into the bundle for a
		 * script we load from their CDN.
		 */
		analytics?: {
			track(eventName: string, eventProperties?: Record<string, unknown>): void;
		};
	}
}

export {};
