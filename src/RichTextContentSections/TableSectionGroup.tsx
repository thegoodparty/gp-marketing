'use client';
import { useEffect, useState } from 'react';
import { computeIntendedSecondColWidthForElement } from '~/lib/computeIntendedSecondColWidthForElement';
import type { ArticleSections } from '~/RichTextContentSections';

export function TableSectionGroup(section: Extract<ArticleSections, { _type: 'tableGroup' }>) {
	const [maxWidth, setMaxWidth] = useState<number>(0);

	useEffect(() => {
		const onResize = () => {
			const el = document.querySelector<HTMLElement>('[data-group="EditorialLayout"]');
			if (el) {
				const width = computeIntendedSecondColWidthForElement(el);
				setMaxWidth(width);
			} else {
				setMaxWidth(window.innerWidth);
			}
		};

		onResize();
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

	return (
		<div
			className={'w-full'}
			data-group='TableSectionGroup'
			style={{
				maxWidth: maxWidth,
			}}
		>
			<section className='font-secondary! overflow-x-auto w-full'>
				{section.field_table && (
					<table className='w-full text-left rounded-md overflow-hidden '>
						<thead className='bg-blue-50'>
							<tr>
								{section.field_table.rows?.[0]?.cells?.map((cell, i) => (
									<th key={i} className='py-2 px-4 min-w-[160px]'>
										{cell}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{section.field_table.rows?.map(
								(row, i) =>
									i > 1 && (
										<tr key={i} className='odd:bg-white even:bg-neutral-50'>
											{row.cells?.map((cell, j) => (
												<td key={j} className='py-2 px-4'>
													{cell}
												</td>
											))}
										</tr>
									),
							)}
						</tbody>
					</table>
				)}
			</section>
		</div>
	);
}
