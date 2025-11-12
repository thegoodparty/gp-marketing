'use client';

import { HeroBlock } from '~/ui/HeroBlock';

type Props = {
	error: Error;
	reset(): void;
};

export default function Error({ error, reset }: Props) {
	return (
		<div className='h-full bg-midnight-900'>
			<HeroBlock
				label='Error'
				title="We've unfortunately encountered an error."
				copy={<p>You can try to reload the page you were visiting.</p>}
				buttons={[
					{
						label: 'Reload Page',
						onClick: reset,
						buttonProps: {
							styleType: 'primary',
						},
						buttonType: 'button',
					},
					{
						label: 'Go to Homepage',
						buttonType: 'internal',
						buttonProps: {
							styleType: 'primary',
						},
						href: '/',
					},
				]}
				backgroundColor='midnight'
			/>
		</div>
	);
}
