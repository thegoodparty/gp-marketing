// Escape < and > so a value containing "</script>" can't break out of the <script> tag.
function toJsonLdString(schema: object): string {
	return JSON.stringify(schema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export function PageSchema({ schema }: { schema?: object }) {
	return schema ? (
		<script
			type='application/ld+json'
			dangerouslySetInnerHTML={{ __html: toJsonLdString(schema) }}
		/>
	) : null;
}
