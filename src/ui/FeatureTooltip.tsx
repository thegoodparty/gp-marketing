'use client';

import { useState } from 'react';

import { Text } from './Text';

export function FeatureTooltip({
	children,
	name,
	description,
	icon,
}: {
	children: React.ReactNode;
	name?: string;
	description?: string;
	icon?: React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	return (
		<span
			className='relative group inline-flex'
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
			onFocus={() => setOpen(true)}
			onBlur={() => setOpen(false)}
		>
			{children}
			{open && (
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 rounded-lg bg-white shadow-md p-4'>
					<div className='flex gap-3'>
						{icon}
						<div className='text-black w-[332px]'>
							{name && (
								<Text className='font-semibold' styleType='text-xl'>
									{name}
								</Text>
							)}
							{description && <Text styleType='text-md'>{description}</Text>}
						</div>
					</div>
				</div>
			)}
		</span>
	);
}
