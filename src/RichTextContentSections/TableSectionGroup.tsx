import type { ArticleSections } from '~/RichTextContentSections';

export function TableSectionGroup(section: Extract<ArticleSections, { _type: 'tableGroup' }>) {
	return (
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
	);
}
