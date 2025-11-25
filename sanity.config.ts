import { defineConfig } from 'sanity';
import { ComponentViewBuilder, structureTool } from 'sanity/structure';
import { defineLocations, presentationTool, type DocumentResolver } from 'sanity/presentation';
import { media, mediaAssetSource } from 'sanity-plugin-media';
import { muxInput } from 'sanity-plugin-mux-input';
import { default as DocumentsPane } from 'sanity-plugin-documents-pane';
import { Iframe, type IframeOptions } from 'sanity-plugin-iframe-pane';

import { assist } from '@sanity/assist';
import { table } from '@sanity/table';
import { get } from '@sanity/util/paths';
import { visionTool } from '@sanity/vision';
import { schema } from './src/sanity/schema/index.ts';
import { customTypes } from './src/sanity/plugins/customTypes/customTypes.tsx';
import { defaultStructure } from './src/sanity/structure/defaultStructure.ts';
import { Logo } from './src/sanity/utils/Logo.tsx';
import { documentSchema } from './src/sanity/schema/documents/documentSchema.ts';
import { sites } from './sites.ts';
import { brandName, dataset, enabledProviders, projectId, defaultApiVersion } from './env.ts';

export default defineConfig({
	title: brandName,
	icon: Logo,
	name: 'main',
	basePath: `/studio/main`,
	dataset,
	projectId,
	auth: {
		loginMethod: 'dual',
		redirectOnSingle: true,
		providers(prev) {
			return prev.filter(provider => enabledProviders.includes(provider.name));
		},
	},
	plugins: [
		assist(),
		structureTool({
			name: 'structure',
			title: 'Structure',
			defaultDocumentNode(S, ctx) {
				const type = ctx.schema.get(ctx.schemaType)!;
				const previews: ComponentViewBuilder[] = [];
				if ('channels' in type.options && Object.keys(type.options.channels).length > 0) {
					for (const [siteId, path] of Object.entries(type.options.channels)) {
						const siteData = sites[siteId as keyof typeof sites];
						previews.push(
							S.view
								.component(Iframe)
								.title(siteData.title)
								.id(siteId)
								.options({
									key: ctx.documentId,
									reload: { button: true },
									url: {
										origin: siteData.url,
										draftMode: '/api/draft-mode/enable',
										async preview(doc) {
											let refinedUrl = `${siteData.url}${String(path)}`;
											// If the type has dynamic parts of its URL, we'll loop over and replace the params here
											if ('pathParams' in type.options && Object.keys(type.options.pathParams).length > 0) {
												for (const [param, paramPath] of Object.entries(type.options.pathParams)) {
													// If the path has a reference, we'll need to resolve the ref via a fetch at this point
													if(String(paramPath).includes('->')) {
														const refValue = await ctx.getClient({apiVersion: defaultApiVersion}).fetch<{value?: string}|null>(`*[_id == $id][0]{"value":${paramPath}}`,{id: doc?._id})
														refinedUrl = refinedUrl.replaceAll(`:${param}`, refValue?.value || 'draft');
													}
													else {
														refinedUrl = refinedUrl.replaceAll(`:${param}`, String(get(doc, String(paramPath))));
													}
												}
											}
											return refinedUrl;
										},
									}
								} satisfies IframeOptions),
						);
					}
				}
				return S.document().views([
					S.view.form(),
					S.view
						.component(DocumentsPane)
						.title('Referenced by')
						.options({
							query: `*[references(select(string::startsWith($id,"drafts.") => string::split($id, "drafts.")[1], $id))]`,
							params: { id: '_id' },
							debug: false,
							useDraft: true,
							duplicate: false,
							options: { perspective: 'previewDrafts', apiVersion: '2025-10-01' },
						}),
					...previews,
				]);
			},
			structure: defaultStructure,
		}),
		...Object.entries(sites).map(([site, siteData]) => {
			const mainDocuments: DocumentResolver[] = [];
			const locations = {};
			for (const doc of documentSchema) {
				if (!(site in doc.options.channels)) {
					continue;
				}
				const filters = [`_type == "${doc.name}"`];
				if ('pathParams' in doc.options && Object.keys(doc.options.pathParams as { slug: string }).length > 0) {
					for (const [param, paramPath] of Object.entries(doc.options.pathParams as { slug: string })) {
						filters.push(`${paramPath} == $${param}`);
					}
				}

				mainDocuments.push({
					route: `${String(doc.options.channels[site])}`,
					filter: filters.join(' && '),
				});

				const channelPath = site in doc.options.channels ? doc.options.channels[site] : undefined;
				if (channelPath) {
					Object.assign(locations, {
						[doc.name]: defineLocations({
							select: 'pathParams' in doc.options ? Object.assign({ _id: '_id' }, doc.options.pathParams) : { _id: '_id' },
							resolve(value) {
								if (!value?.['_id']) {
									return {
										message: 'Document empty',
										tone: 'caution',
									};
								}
								let refinedPath = String(channelPath);
								if ('pathParams' in doc.options && Object.keys(doc.options.pathParams as { slug: string }).length > 0) {
									for (const [param] of Object.entries(doc.options.pathParams as { slug: string })) {
										refinedPath = refinedPath.replaceAll(`:${param}`, value[param] || value['_id']);
									}
								}
								return {
									locations: [
										{
											title: doc.title,
											href: refinedPath,
										},
									],
								};
							},
						}),
					});
				}
			}

			return presentationTool({
				title: siteData.title,
				previewUrl: {
					initial: siteData.url,
					origin: siteData.url,
					previewMode: {
						enable: '/api/draft-mode/enable',
						shareAccess: true,
					},
				},
				resolve: {
					mainDocuments,
					locations,
				},
			});
		}),
		media(),
		muxInput({
			mp4_support: 'none',
			tool: { title: 'Video' },
		}),
		visionTool({
			defaultApiVersion,
			defaultDataset: dataset,
		}),
		table(),
		customTypes,
	],
	schema: {
		// @ts-expect-error we've added channel data
		types: schema,
	},
	form: {
		image: {
			assetSources: () => [mediaAssetSource],
		},
		file: {
			assetSources: () => [mediaAssetSource],
		},
	},
	search: {
		strategy: 'groq2024',
	},
	document: {
		actions(prev, ctx) {
			const schema = ctx.schema.get(ctx.schemaType)!;
			if (schema.options?.single === true) {
				return prev.filter(x => !['unpublish', 'duplicate', 'delete'].includes(x.action!));
			}
			return prev;
		},
		comments: {
			enabled: false,
		},
	},
	tasks: {
		enabled: false,
	},
	releases: {
		enabled: false,
	},
	scheduledPublishing: {
		enabled: false,
		showReleasesBanner: false,
	},
	announcements: {
		enabled: false,
	},
});
