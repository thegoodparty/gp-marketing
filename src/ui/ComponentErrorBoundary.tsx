import { type PropsWithChildren } from 'react';
import { draftMode } from 'next/headers';
import { ComponentErrorBoundaryMessage } from './message.tsx';

export async function ComponentErrorBoundary(props: PropsWithChildren & { componentName?: string }) {
	const isLocalhost = process.env.NODE_ENV === 'development';

	return <ComponentErrorBoundaryMessage {...props} draftMode={(await draftMode()).isEnabled} isLocalhost={isLocalhost} />;
}
