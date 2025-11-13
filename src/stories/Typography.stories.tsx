import { Text } from '~/ui/Text';
import { Typography as T } from '~/ui/Typography';
import preview from '../../.storybook/preview';

const meta = preview.meta({
	title: 'Base/Typography',

	component: () => {
		return (
			<div style={{ padding: '2rem' }}>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='heading-xl'>
						Heading xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='heading-lg'>
						Heading lg
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='heading-md'>
						Heading md
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='heading-sm'>
						Heading sm
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='heading-xs'>
						Heading xs
					</Text>
				</div>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='subtitle-1'>
						Subtitle 1
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='subtitle-2'>
						Subtitle 2
					</Text>
				</div>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='body-1'>
						Body 1
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='body-2'>
						Body 2
					</Text>
				</div>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='overline'>
						Overline
					</Text>
				</div>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='caption'>
						Caption
					</Text>
				</div>
				<div style={{ marginBottom: '5rem' }}>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-9xl'>
						Text 9xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-8xl'>
						Text 8xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-7xl'>
						Text 7xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-6xl'>
						Text 6xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-5xl'>
						Text 5xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-4xl'>
						Text 4xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-3xl'>
						Text 3xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-2xl'>
						Text 2xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-xl'>
						Text xl
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-lg'>
						Text lg
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-md'>
						Text md
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-sm'>
						Text sm
					</Text>
					<Text as='div' style={{ marginBottom: '1rem' }} styleType='text-xs'>
						Text xs
					</Text>
				</div>
				<T style={{ marginBottom: '2rem' }} styleType='default'>
					<h1>Heading 1</h1>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<h2>Heading 2</h2>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<h3>Heading 3</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<h4>Heading 4</h4>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<h5>Heading 5</h5>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<h6>Heading 6</h6>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies accumsan eros eget ultricies. Aliquam dictum faucibus
						ullamcorper. Quisque consequat massa et mattis accumsan. Nulla sagittis fermentum enim at sagittis. Lorem ipsum dolor sit amet,
						consectetur adipiscing elit. Praesent porttitor at arcu eu dignissim.
					</p>
					<ol>
						<li>Ordered list item</li>
						<li>Ordered list item</li>
						<li>Ordered list item</li>
					</ol>
					<ul>
						<li>Unordered list item</li>
						<li>Unordered list item</li>
						<li>Unordered list item</li>
					</ul>
				</T>
			</div>
		);
	},
});

export const Typography = meta.story();
