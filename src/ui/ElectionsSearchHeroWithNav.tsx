'use client';

import { useRouter } from 'next/navigation';
import { ElectionsSearchHero, type ElectionsSearchHeroProps } from './ElectionsSearchHero';

export function ElectionsSearchHeroWithNav(props: ElectionsSearchHeroProps) {
	const router = useRouter();

	return (
		<ElectionsSearchHero
			{...props}
			onSearch={(stateValue) => {
				if (stateValue) {
					router.push(`/elections/${stateValue}`);
				}
			}}
		/>
	);
}
