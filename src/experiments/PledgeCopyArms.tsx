import type { ReactNode } from 'react';

import { PLEDGE_COPY_ATTRIBUTE, PLEDGE_COPY_TEST_ENABLED } from '~/experiments/pledgeCopyTest';

/**
 * Renders every arm of the pledge copy test, with control visible and the
 * rewrites hidden until the head script shows the visitor's own arm (see
 * `pledgeCopyHeadScript`). The wrappers are `display: contents`, so they do not
 * change the layout of what they wrap. `as='div'` for block content such as a
 * heading; the default span sits inside a sentence. With the test off this is
 * just the control.
 */
export function PledgeCopyArms(props: { control: ReactNode; b3: ReactNode; alt: ReactNode; as?: 'span' | 'div' }) {
	if (!PLEDGE_COPY_TEST_ENABLED) return <>{props.control}</>;
	const Tag = props.as ?? 'span';
	const attribute = (arm: string) => ({ [PLEDGE_COPY_ATTRIBUTE]: arm });
	return (
		<>
			<Tag {...attribute('control')} className='contents'>
				{props.control}
			</Tag>
			<Tag {...attribute('b3')} className='hidden'>
				{props.b3}
			</Tag>
			<Tag {...attribute('alt')} className='hidden'>
				{props.alt}
			</Tag>
		</>
	);
}
