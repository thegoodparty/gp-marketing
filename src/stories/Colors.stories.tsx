import { Text } from '~/ui/Text';
import { cn } from '~/ui/_lib/utils';
import preview from '../../.storybook/preview';

const meta = preview.meta({
	title: 'Base/Colors',

	component: () => (
		<div className='p-8 flex flex-col gap-8'>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Base
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-black' name='Black' />
					<Swatch colour='bg-white' name='White' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Midnight
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-midnight-50' name='Midnight 50' />
					<Swatch colour='bg-midnight-100' name='Midnight 100' />
					<Swatch colour='bg-midnight-200' name='Midnight 200' />
					<Swatch colour='bg-midnight-300' name='Midnight 300' />
					<Swatch colour='bg-midnight-400' name='Midnight 400' />
					<Swatch colour='bg-midnight-500' name='Midnight 500' />
					<Swatch colour='bg-midnight-600' name='Midnight 600' />
					<Swatch colour='bg-midnight-700' name='Midnight 700' />
					<Swatch colour='bg-midnight-800' name='Midnight 800' />
					<Swatch colour='bg-midnight-900' name='Midnight 900' />
					<Swatch colour='bg-midnight-950' name='Midnight 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Bight Yellow
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-bright-yellow-50' name='Bright Yellow 50' />
					<Swatch colour='bg-bright-yellow-100' name='Bright Yellow 100' />
					<Swatch colour='bg-bright-yellow-200' name='Bright Yellow 200' />
					<Swatch colour='bg-bright-yellow-300' name='Bright Yellow 300' />
					<Swatch colour='bg-bright-yellow-400' name='Bright Yellow 400' />
					<Swatch colour='bg-bright-yellow-500' name='Bright Yellow 500' />
					<Swatch colour='bg-bright-yellow-600' name='Bright Yellow 600' />
					<Swatch colour='bg-bright-yellow-700' name='Bright Yellow 700' />
					<Swatch colour='bg-bright-yellow-800' name='Bright Yellow 800' />
					<Swatch colour='bg-bright-yellow-900' name='Bright Yellow 900' />
					<Swatch colour='bg-bright-yellow-950' name='Bright Yellow 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Lavendar
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-lavender-50' name='Lavender 50' />
					<Swatch colour='bg-lavender-100' name='Lavender 100' />
					<Swatch colour='bg-lavender-200' name='Lavender 200' />
					<Swatch colour='bg-lavender-300' name='Lavender 300' />
					<Swatch colour='bg-lavender-400' name='Lavender 400' />
					<Swatch colour='bg-lavender-500' name='Lavender 500' />
					<Swatch colour='bg-lavender-600' name='Lavender 600' />
					<Swatch colour='bg-lavender-700' name='Lavender 700' />
					<Swatch colour='bg-lavender-800' name='Lavender 800' />
					<Swatch colour='bg-lavender-900' name='Lavender 900' />
					<Swatch colour='bg-lavender-950' name='Lavender 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Halo Green
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-halo-green-50' name='Halo Green 50' />
					<Swatch colour='bg-halo-green-100' name='Halo Green 100' />
					<Swatch colour='bg-halo-green-200' name='Halo Green 200' />
					<Swatch colour='bg-halo-green-300' name='Halo Green 300' />
					<Swatch colour='bg-halo-green-400' name='Halo Green 400' />
					<Swatch colour='bg-halo-green-500' name='Halo Green 500' />
					<Swatch colour='bg-halo-green-600' name='Halo Green 600' />
					<Swatch colour='bg-halo-green-700' name='Halo Green 700' />
					<Swatch colour='bg-halo-green-800' name='Halo Green 800' />
					<Swatch colour='bg-halo-green-900' name='Halo Green 900' />
					<Swatch colour='bg-halo-green-950' name='Halo Green 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Waxflower
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-waxflower-50' name='Waxflower 50' />
					<Swatch colour='bg-waxflower-100' name='Waxflower 100' />
					<Swatch colour='bg-waxflower-200' name='Waxflower 200' />
					<Swatch colour='bg-waxflower-300' name='Waxflower 300' />
					<Swatch colour='bg-waxflower-400' name='Waxflower 400' />
					<Swatch colour='bg-waxflower-500' name='Waxflower 500' />
					<Swatch colour='bg-waxflower-600' name='Waxflower 600' />
					<Swatch colour='bg-waxflower-700' name='Waxflower 700' />
					<Swatch colour='bg-waxflower-800' name='Waxflower 800' />
					<Swatch colour='bg-waxflower-900' name='Waxflower 900' />
					<Swatch colour='bg-waxflower-950' name='Waxflower 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Neutral
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-neutral-50' name='Neutral 50' />
					<Swatch colour='bg-neutral-100' name='Neutral 100' />
					<Swatch colour='bg-neutral-200' name='Neutral 200' />
					<Swatch colour='bg-neutral-300' name='Neutral 300' />
					<Swatch colour='bg-neutral-400' name='Neutral 400' />
					<Swatch colour='bg-neutral-500' name='Neutral 500' />
					<Swatch colour='bg-neutral-600' name='Neutral 600' />
					<Swatch colour='bg-neutral-700' name='Neutral 700' />
					<Swatch colour='bg-neutral-800' name='Neutral 800' />
					<Swatch colour='bg-neutral-900' name='Neutral 900' />
					<Swatch colour='bg-neutral-950' name='Neutral 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Blue
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-blue-50' name='Blue 50' />
					<Swatch colour='bg-blue-100' name='Blue 100' />
					<Swatch colour='bg-blue-200' name='Blue 200' />
					<Swatch colour='bg-blue-300' name='Blue 300' />
					<Swatch colour='bg-blue-400' name='Blue 400' />
					<Swatch colour='bg-blue-500' name='Blue 500' />
					<Swatch colour='bg-blue-600' name='Blue 600' />
					<Swatch colour='bg-blue-700' name='Blue 700' />
					<Swatch colour='bg-blue-800' name='Blue 800' />
					<Swatch colour='bg-blue-900' name='Blue 900' />
					<Swatch colour='bg-blue-950' name='Blue 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Red
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-red-50' name='Red 50' />
					<Swatch colour='bg-red-100' name='Red 100' />
					<Swatch colour='bg-red-200' name='Red 200' />
					<Swatch colour='bg-red-300' name='Red 300' />
					<Swatch colour='bg-red-400' name='Red 400' />
					<Swatch colour='bg-red-500' name='Red 500' />
					<Swatch colour='bg-red-600' name='Red 600' />
					<Swatch colour='bg-red-700' name='Red 700' />
					<Swatch colour='bg-red-800' name='Red 800' />
					<Swatch colour='bg-red-900' name='Red 900' />
					<Swatch colour='bg-red-950' name='Red 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Error
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-error-50' name='Error 50' />
					<Swatch colour='bg-error-100' name='Error 100' />
					<Swatch colour='bg-error-200' name='Error 200' />
					<Swatch colour='bg-error-300' name='Error 300' />
					<Swatch colour='bg-error-400' name='Error 400' />
					<Swatch colour='bg-error-500' name='Error 500' />
					<Swatch colour='bg-error-600' name='Error 600' />
					<Swatch colour='bg-error-700' name='Error 700' />
					<Swatch colour='bg-error-800' name='Error 800' />
					<Swatch colour='bg-error-900' name='Error 900' />
					<Swatch colour='bg-error-950' name='Error 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Success
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-success-50' name='Success 50' />
					<Swatch colour='bg-success-100' name='Success 100' />
					<Swatch colour='bg-success-200' name='Success 200' />
					<Swatch colour='bg-success-300' name='Success 300' />
					<Swatch colour='bg-success-400' name='Success 400' />
					<Swatch colour='bg-success-500' name='Success 500' />
					<Swatch colour='bg-success-600' name='Success 600' />
					<Swatch colour='bg-success-700' name='Success 700' />
					<Swatch colour='bg-success-800' name='Success 800' />
					<Swatch colour='bg-success-900' name='Success 900' />
					<Swatch colour='bg-success-950' name='Success 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Info
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-info-50' name='Info 50' />
					<Swatch colour='bg-info-100' name='Info 100' />
					<Swatch colour='bg-info-200' name='Info 200' />
					<Swatch colour='bg-info-300' name='Info 300' />
					<Swatch colour='bg-info-400' name='Info 400' />
					<Swatch colour='bg-info-500' name='Info 500' />
					<Swatch colour='bg-info-600' name='Info 600' />
					<Swatch colour='bg-info-700' name='Info 700' />
					<Swatch colour='bg-info-800' name='Info 800' />
					<Swatch colour='bg-info-900' name='Info 900' />
					<Swatch colour='bg-info-950' name='Info 950' />
				</ul>
			</div>
			<div>
				<Text as='div' styleType='heading-xl' className='mb-4'>
					Warning
				</Text>
				<ul className='flex flex-wrap gap-4 mb-8'>
					<Swatch colour='bg-warning-50' name='Warning 50' />
					<Swatch colour='bg-warning-100' name='Warning 100' />
					<Swatch colour='bg-warning-200' name='Warning 200' />
					<Swatch colour='bg-warning-300' name='Warning 300' />
					<Swatch colour='bg-warning-400' name='Warning 400' />
					<Swatch colour='bg-warning-500' name='Warning 500' />
					<Swatch colour='bg-warning-600' name='Warning 600' />
					<Swatch colour='bg-warning-700' name='Warning 700' />
					<Swatch colour='bg-warning-800' name='Warning 800' />
					<Swatch colour='bg-warning-900' name='Warning 900' />
					<Swatch colour='bg-warning-950' name='Warning 950' />
				</ul>
			</div>
		</div>
	),
});
export default meta;

interface SwatchProps {
	colour: string;
	name: string;
}

function Swatch(props: SwatchProps) {
	return (
		<li>
			<div className={cn('transition-colors duration-slow ease-smooth border border-solid border-black w-60 h-20 mb-2', props.colour)} />
			<Text as='span' styleType='body-1'>
				{props.name}
			</Text>
		</li>
	);
}

export const Colors = meta.story();
