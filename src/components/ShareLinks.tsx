'use client';

import { usePathname } from 'next/navigation';
import { tv } from '~/ui/_lib/utils';
import { Text } from '~/ui/Text';

const styles = tv({
	slots: {
		icon: 'min-w-[3rem] min-h-[3rem] w-[3rem] h-[3rem] max-w-[3rem] max-h-[3rem] rounded-full flex items-center justify-center bg-lavender-200',
	},
});

export function ShareLinks() {
	const { icon } = styles();
	const pathname = usePathname();
	const pageUrl = typeof window !== 'undefined' ? window.location.origin + pathname : '';

	const encodedUrl = encodeURIComponent(pageUrl);
	const text = encodeURIComponent('Check this out!');

	const links = {
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
		twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
	};

	function copyUrlToClipboard() {
		if (navigator.clipboard) void navigator.clipboard.writeText(pageUrl);
	}

	return (
		<div className='flex flex-col gap-4 bg-white p-8 rounded-[0.5rem] w-full'>
			<Text as='div' styleType='text-xl' className='font-semibold'>
				Share on
			</Text>
			<div className='flex flex-row flex-wrap gap-4 justify-between sm:justify-start'>
				<a href={links.linkedin} target='_blank' rel='noopener noreferrer' className={icon()}>
					<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
						<path
							fillRule='evenodd'
							clipRule='evenodd'
							d='M17.9019 0H1.39356C0.643182 0 0 0.64 0 1.38667V17.8133C0 18.56 0.643182 19.2 1.39356 19.2H17.7947C18.5451 19.2 19.1883 18.56 19.1883 17.8133V1.38667C19.2955 0.64 18.6523 0 17.9019 0ZM5.68144 16.32H2.89432V7.14667H5.78864V16.32H5.68144ZM4.28788 5.97333C3.32311 5.97333 2.67993 5.22667 2.67993 4.26667C2.67993 3.30667 3.43031 2.66667 4.28788 2.66667C5.25265 2.66667 5.89584 3.41333 5.89584 4.26667C6.00303 5.22667 5.25265 5.97333 4.28788 5.97333ZM16.4011 16.32H13.5068V11.84C13.5068 10.7733 13.5068 9.38667 12.0061 9.38667C10.5053 9.38667 10.2909 10.56 10.2909 11.7333V16.2133H7.50379V7.14667H10.2909V8.42667C10.7197 7.68 11.5773 6.93333 12.9708 6.93333C15.8652 6.93333 16.4011 8.85333 16.4011 11.3067V16.32Z'
							fill='#0D0D0D'
						/>
					</svg>
				</a>
				<a href={links.twitter} target='_blank' rel='noopener noreferrer' className={icon()}>
					<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14' fill='none'>
						<g clipPath='url(#clip0_4124_12866)'>
							<path
								d='M8.21422 5.84401L13.3524 0H12.1353L7.67188 5.07323L4.10964 0H0L5.38798 7.67236L0 13.8H1.21716L5.92756 8.4413L9.69036 13.8H13.8M1.65646 0.898088H3.52636L12.1343 12.946H10.264'
								fill='black'
							/>
						</g>
						<defs>
							<clipPath id='clip0_4124_12866'>
								<rect width='13.8' height='13.8' fill='white' />
							</clipPath>
						</defs>
					</svg>
				</a>
				<a href={links.facebook} target='_blank' rel='noopener noreferrer' className={icon()}>
					<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
						<path
							d='M22 12.0611C22 6.50451 17.5229 2 12 2C6.47715 2 2 6.50451 2 12.0611C2 17.0828 5.65684 21.2452 10.4375 22V14.9694H7.89844V12.0611H10.4375V9.84452C10.4375 7.32296 11.9305 5.93012 14.2146 5.93012C15.3084 5.93012 16.4531 6.12663 16.4531 6.12663V8.60261H15.1922C13.95 8.60261 13.5625 9.37822 13.5625 10.1747V12.0611H16.3359L15.8926 14.9694H13.5625V22C18.3432 21.2452 22 17.0828 22 12.0611Z'
							fill='#0D0D0D'
						/>
					</svg>
				</a>
				{/* write a function to copy the url to the clipboard on click  */}
				<button type='button' onClick={() => copyUrlToClipboard()} className={icon()}>
					<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
						<path
							d='M10.4231 8.00999C11.2812 8.07145 12.1163 8.31722 12.8713 8.72972C13.6263 9.14223 14.2837 9.71264 14.7991 10.4016C15.1297 10.8438 15.0399 11.4702 14.5979 11.801C14.1556 12.1318 13.5283 12.0411 13.1975 11.5989C12.854 11.1397 12.4156 10.7595 11.9123 10.4846C11.4091 10.2097 10.8525 10.0461 10.2805 10.0051C9.70848 9.96414 9.13424 10.0469 8.5969 10.2473C8.12659 10.4227 7.69397 10.6851 7.32151 11.0198L7.16526 11.1672L4.17796 14.1545L4.04515 14.2991C3.40038 15.0355 3.04637 15.9856 3.05491 16.969C3.06414 18.0176 3.48526 19.0204 4.22679 19.7619C4.96832 20.5035 5.97112 20.9246 7.01976 20.9338C8.06854 20.9429 9.0798 20.5394 9.83421 19.8108L11.5315 18.1135C11.922 17.723 12.555 17.723 12.9455 18.1135C13.3359 18.504 13.336 19.1371 12.9455 19.5276L11.2356 21.2375L11.0071 21.4485C9.90241 22.4155 8.47804 22.9465 7.00315 22.9338C5.42999 22.9202 3.92517 22.2884 2.81272 21.176C1.70028 20.0636 1.06858 18.5588 1.05491 16.9856C1.04218 15.5107 1.57318 14.0863 2.54026 12.9817L2.7512 12.7532L5.7512 9.75316L5.9846 9.53148C6.54326 9.02958 7.19226 8.63642 7.89769 8.37327C8.70369 8.07263 9.56502 7.94857 10.4231 8.00999ZM16.9944 1.06663C18.5674 1.08041 20.0724 1.71209 21.1848 2.82445C22.297 3.93686 22.928 5.44188 22.9416 7.01487C22.9552 8.58774 22.3507 10.1031 21.258 11.2346L18.2453 14.2473C17.6371 14.8557 16.9049 15.3265 16.0989 15.6272C15.2928 15.9278 14.4315 16.0509 13.5735 15.9895C12.7153 15.928 11.8802 15.6832 11.1252 15.2707C10.3702 14.8582 9.71281 14.2878 9.19749 13.5989C8.86687 13.1566 8.95746 12.5302 9.39964 12.1994C9.84188 11.8688 10.4683 11.9594 10.7991 12.4016C11.1426 12.8608 11.5809 13.2409 12.0842 13.5159C12.5875 13.7908 13.1441 13.9543 13.716 13.9953C14.288 14.0363 14.8624 13.9535 15.3996 13.7532C15.937 13.5527 16.4258 13.2389 16.8313 12.8332L19.8186 9.84593C20.5472 9.09152 20.9507 8.08026 20.9416 7.03148C20.9324 5.98302 20.512 4.98001 19.7707 4.23851C19.0291 3.49692 18.0255 3.0758 16.9768 3.06663C15.928 3.05752 14.9177 3.46109 14.1633 4.18968L14.1623 4.1887L12.4533 5.8889C12.0617 6.27828 11.4287 6.27665 11.0393 5.88499C10.6499 5.49333 10.6515 4.8603 11.0432 4.47093L12.7629 2.76097C12.7663 2.7576 12.7702 2.75452 12.7737 2.7512C13.9053 1.65825 15.4212 1.05296 16.9944 1.06663Z'
							fill='black'
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}
