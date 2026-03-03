export function PageSchema({ schema }: { schema?: object }) {
	return schema ? (
		<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
	) : null;
}
