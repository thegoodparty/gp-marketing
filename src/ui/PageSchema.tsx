function schemaToSafeJsonLdString(schema: object): string {
	return JSON.stringify(schema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export function PageSchema({ schema }: { schema?: object }) {
	return schema ? (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{ __html: schemaToSafeJsonLdString(schema) }}
		/>
	) : null;
}
