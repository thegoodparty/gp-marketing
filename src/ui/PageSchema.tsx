export function PageSchema(schema: any) {
	return schema && <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
