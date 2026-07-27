import { PatchEvent, type Path, set, type StringInputProps, useFormValue, useSchema } from 'sanity';
import { useDocumentPane } from 'sanity/structure';
import { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { Box, Button, Flex, Stack, TextInput } from '@sanity/ui';
import { get } from '@sanity/util/paths';
import { slugifyFaqQuestion } from '../../../lib/faqSlugFormat';

const FAQ_SLUG_FIELD = 'faqOverview.field_slug';

function Identifier(props: StringInputProps) {
	const pathSuffix = props.schemaType.options?.['path'];
	const copyPath = [...props.path.slice(0, props.path.length - 2), ...(Array.isArray(pathSuffix) ? pathSuffix : [])];
	const name = useFormValue(copyPath as Path);
	const type = useFormValue(['_type']);
	const { value } = useDocumentPane();
	const schema = useSchema();
	const [slugSourcePaths, setSlugSourcePaths] = useState<undefined | Array<string>>();
	useEffect(() => {
		if (slugSourcePaths) {
			return;
		}
		const schemaType = schema.get(type as any)!;
		const documentSlugs = schemaType.options?.documentSlugs || [];
		const slugData = documentSlugs.find(x => {
			if (!('slugField' in x)) {
				return false;
			}
			if (props.id !== x.slugField) {
				return false;
			}
			if (!Array.isArray(x.slugSources) || !x.slugSources.length) {
				return false;
			}
			return true;
		});
		if (slugData?.slugSources) {
			setSlugSourcePaths(slugData.slugSources);
		}
	}, [schema, type]);
	// @todo replace with useSchema?

	const errors = useMemo(() => props.validation.filter(item => item.level === 'error'), [props.validation]);

	const update = useCallback(
		(nameVar: string) => {
			const id = _.camelCase(nameVar);
			if (id) {
				props.onChange(PatchEvent.from([set(id)]));
				return;
			}
			if (slugSourcePaths) {
				const joined = slugSourcePaths
					.map(sourcePath => {
						const source = get(value, sourcePath);
						if (props.id === FAQ_SLUG_FIELD) {
							return slugifyFaqQuestion(typeof source === 'string' ? source : '');
						}
						return _.kebabCase(source);
					})
					.filter(Boolean)
					.join('-');
				props.onChange(PatchEvent.from(set(joined || null)));
				return;
			}
			props.onChange(PatchEvent.from(set(null)));
			return;
		},
		[props.onChange, props.id, slugSourcePaths, value],
	);

	return (
		<Stack space={3}>
			<Flex gap={1}>
				<Box flex={1}>
					<TextInput
						{...props.elementProps}
						customValidity={errors.length > 0 ? errors[0]?.message : ''}
						value={props.value || ''}
						readOnly={props.readOnly}
					/>
				</Box>
				<Button
					mode='ghost'
					type='button'
					disabled={props.readOnly}
					onClick={() => {
						update(name as any);
					}}
					text={'Generate'}
				/>
			</Flex>
		</Stack>
	);
}

export function IdInput(props: StringInputProps) {
	if (!props.schemaType.options || !('path' in props.schemaType.options)) {
		return (
			<Identifier
				{...{
					...props,
					schemaType: {
						...props.schemaType,
						options: {
							...props.schemaType.options,
							path: ['pageOverview', 'field_pageTitle'],
						} as any,
					},
				}}
			/>
		);
	}
	return <Identifier {...props} />;
}
