'use client';

import { motion } from 'motion/react';
import { tv } from './_lib/utils';
import { Avatar, type AvatarProps } from './Avatar';

const styles = tv({
	slots: {
		base: 'flex -space-x-3',
		avatar: 'outline-white outline-3 [&_img]:aspect-square',
	},
});

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.08,
		},
	},
} as const;

const avatarVariants = {
	hidden: { marginLeft: '-2rem' },
	visible: {
		marginLeft: '-0.75rem',
		transition: { duration: 0.25, ease: 'easeOut' },
	},
} as const;

export const AvatarStack = ({ avatars }: { avatars: AvatarProps[] }) => {
	const { base, avatar: avatarStyle } = styles();
	return (
		<motion.div className={base()} variants={containerVariants} initial='hidden' whileInView='visible' viewport={{ amount: 0.3 }}>
			{avatars.map(avatar => (
				<motion.div key={avatar._key} variants={avatarVariants} className='first:ml-0'>
					<Avatar className={avatarStyle()} {...avatar} />
				</motion.div>
			))}
		</motion.div>
	);
};
