import type { backgroundTypeValues, componentColorValues } from './_lib/designTypesStore';
import { tv } from './_lib/utils';

import { Avatar, type AvatarProps } from './Avatar';
import { Container } from './Container';
import { Text } from './Text';

const styles = tv({
	slots: {
		base: 'py-(--container-padding)',
		card: 'flex max-md:flex-col max-md:text-center p-6 md:py-12 md:px-16 rounded-lg gap-6 md:gap-10 justify-center items-center',
		avatarStack: 'flex -space-x-3',
		avatar: 'outline-white outline-3 [&_img]:aspect-square [&_img]:max-h-[4rem]',
	},
	variants: {
		backgroundColor: {
			midnight: {
				base: 'bg-midnight-900',
			},
			cream: {
				base: 'bg-goodparty-cream',
			},
		},
		color: {
			red: {
				card: 'bg-red-100',
			},
			waxflower: {
				card: 'bg-waxflower-100',
			},
			'bright-yellow': {
				card: 'bg-bright-yellow-100',
			},
			'halo-green': {
				card: 'bg-halo-green-100',
			},
			blue: {
				card: 'bg-blue-100',
			},
			lavender: {
				card: 'bg-lavender-100',
			},
			midnight: {
				base: 'text-white',
				card: 'bg-midnight-900',
			},
			cream: {
				card: 'bg-goodparty-cream',
			},
		},
	},
});

interface BannerBlockProps {
	avatars?: AvatarProps[];
	backgroundColor?: (typeof backgroundTypeValues)[number];
	color?: Exclude<(typeof componentColorValues)[number], 'inverse'>;
	copy?: string;
}

export const BannerBlock = (props: BannerBlockProps) => {
	const backgroundColor = props.backgroundColor ?? 'cream';
	const color = props.color ?? 'red';

	const { base, card, avatarStack, avatar: avatarStyle } = styles({ backgroundColor, color });

	return (
		<article className={base()} data-component='CTABannerBlock'>
			<Container size='xl'>
				<div className={card()}>
					<div className={avatarStack()}>
						{props.avatars?.map(avatar => (
							<Avatar className={avatarStyle()} key={avatar._key} image={avatar.image} size={avatar.size} />
						))}
					</div>
					<Text styleType='subtitle-1'>{props.copy}</Text>
				</div>
			</Container>
		</article>
	);
};
