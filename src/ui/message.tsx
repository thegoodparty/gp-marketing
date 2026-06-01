'use client';
import { type PropsWithChildren } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

type Props = PropsWithChildren & { componentName?: string; draftMode?: boolean; isLocalhost?: boolean };

export function ComponentErrorBoundaryMessage(props: Props) {
	return <ErrorBoundary FallbackComponent={errorProps => <Fallback {...errorProps} {...props} />}>{props.children}</ErrorBoundary>;
}

function Fallback({ error, draftMode, isLocalhost, componentName }: { error: Error; resetErrorBoundary(): void } & Props) {
	if (!(draftMode || isLocalhost)) return null;

	return (
		<div role='alert' className={`container-2xl py-8 px-12 flex flex-col gap-6 items-center ${isLocalhost ? 'bg-[#f87171]' : ''}`}>
			<div className='text-center'>
				Something went wrong {componentName ? <strong>{`in ${componentName}`}</strong> : ''}, please check all fields
				{draftMode ? ' are populated correctly in Sanity' : ''}
			</div>
			{isLocalhost && <div className='bg-black text-white p-4 rounded-lg text-wrap overflow-x-auto'>{error.message}</div>}
		</div>
	);
}
