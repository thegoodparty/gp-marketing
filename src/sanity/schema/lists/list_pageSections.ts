export const list_pageSections = {
	name: 'list_pageSections',
	title: 'Page Sections',
	description: 'The sections of content that make up the page.',
	options: {
		collapsible: false,
		insertMenu: {
			filter: true,
			showIcons: true,
			views: [
				{
					name: 'grid',
					previewImageUrl: function (s) {
						const i = {
							component_hero: 'https://cdn.sanity.io/images/3100uthq/goodparty/a7768a8917563d73685ff721e9f1fcaf3b36fabb-3000x2000.png',
							component_heroWithSubscribe:
								'https://cdn.sanity.io/images/3100uthq/goodparty/67f0e95df99e207876eef75172903ef047216f87-3000x2000.png',
							component_bannerBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/877e5603c23c7a7da0ee3cf216d4b6932f3558ea-3000x2000.png',
							component_twoUpCardBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/c61ea069571308c0d5ab66195f07739dde69f279-3000x2000.png',
							component_comparisonBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/c69640e42c6211c00abbfa99063409d0e10d4cad-3000x2000.png',
							component_stepperBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/c9c245fa215c5a32450350e7acc9f254f4b52e7e-3000x2000.png',
							component_iconContentBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/b27d60838a0a92222d15345892edcda58ca1a4f9-3000x2000.png',
							component_imageContentBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/b51519a998882fea28ca6b6a09b4db3707ae414e-3000x2000.png',
							component_statsBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/de12cf0b68bde4ef09760cc6db95f4097dd0057a-3000x2000.png',
							component_tabbedImageBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/62ae1a96827d9db91a6df3f018d2a5d4de151d1c-3000x2000.png',
							component_pricingBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/f5806187635de1c8162a75d0afae3f8bd3e12eb9-3000x2000.png',
							component_featuresBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/2d979056b3ec1532b04dcd9cbcece59427567a5f-3000x2000.png',
							component_teamBlock: 'https://cdn.sanity.io/images/3100uthq/goodparty/3c1955a5f7dc1b7a8f437450e5e499df08c3d18b-3000x2000.png',
							component_carouselBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/ba104250aeb7e08922ec3385b6bfb715f2046d5c-3000x2000.png',
							component_testimonialBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/03ca591118db48ec8c5d90890556f545974712a2-3000x2000.png',
							// This one lives in this project's own dataset (3rbseux7/production); the older
							// entries above are hosted in a separate project. Either works — the menu just
							// renders the URL.
							component_testimonialBlockWithLink:
								'https://cdn.sanity.io/images/3rbseux7/production/4bfdac1dbb3eb5f7820b1dc438168b67e8453f86-3000x2000.png',
							component_faqBlock: 'https://cdn.sanity.io/images/3100uthq/goodparty/02b94c15685969331f055c3763218196ad0b0e7c-3000x2000.png',
							component_ctaBannerBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/e656091c37779cb88b594952eba9b111daba3f53-3000x2000.png',
							component_ctaBlock: 'https://cdn.sanity.io/images/3100uthq/goodparty/c95d91abeca01075064e9bb11ac34893ee9f8500-3000x2000.png',
							component_ctaImageBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/f966c2d083e7c08c95f61eb8f7f0a9e4fe17556f-3000x2000.png',
							component_ctaCardsBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/1c321e5847315eef758b377df2c481ce70f31037-3000x2000.png',
							component_newsletterBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/8b9564c0c54b1a558eee388e6bf7ece24cc3f36a-3000x2000.png',
							component_blogBlock: 'https://cdn.sanity.io/images/3100uthq/goodparty/c7f17c8fa4a28e2a34b30fb88a57be46159c30f8-3000x2000.png',
							component_featuredBlogBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/698463c3fd24bd124fcf28fae5eeefd56c6fd7f7-3000x2000.png',
							component_blogTopicTagsBlock:
								'https://cdn.sanity.io/images/3100uthq/goodparty/b790582065d70734a3ca72f79c4bcba8796c1b91-3000x2000.png',
							// Captured from each block's own Storybook render. These live in this project's
							// dataset (3rbseux7/production); the entries above are hosted in a separate
							// project. The menu only renders the URL, so the two sets can coexist.
							component_breadcrumbBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/a0807da88bda24afde8e7f6ec71eafeea9dcf6e4-3000x2000.png',
							component_calculatorTextBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/33fa00a12e0bc6bd0bf44bdf7ab80d1d28a93cdc-3000x2000.png',
							component_candidatesBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/4f457c1428bde3502bd59af409c0dfcbc74149e6-3000x2000.png',
							component_claimProfileBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/8ea247a0ba65b5583f5ab1ad2eb0a2433cbd78c1-3000x2000.png',
							component_electionsIndexBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/fc29edac069a168edd399f75e1a8e50daa223b47-3000x2000.png',
							component_electionsPositionContentBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/07cbd1cca10eebd1e3ae9617949e7cb6c56f2375-3000x2000.png',
							component_electionsPositionHero:
								'https://cdn.sanity.io/images/3rbseux7/production/98517979044bb0b346f468e72ccf36e11ea55c9d-3000x2000.png',
							component_electionsSearchHero:
								'https://cdn.sanity.io/images/3rbseux7/production/f314244f8dd92cc652b6f997b08ecf8786a87029-3000x2000.png',
							component_embeddedBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/db3caeddd65e25c3ef1f8fecf395943a41cc417d-3000x2000.png',
							component_featuredCitiesBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/9dff636003ac0fe08810dab73ab5d85704104836-3000x2000.png',
							component_goodPartyOrgPledge:
								'https://cdn.sanity.io/images/3rbseux7/production/3af863344c213d146cc5c28a2fd63efd4c381631-3000x2000.png',
							component_jobOpeningsBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/77d6cb0e8a4704d6ee9983a26391ed71cdb54d47-3000x2000.png',
							component_listOfOfficesBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/f52200ea2ce2b87acd58736b478d6aa385c404ad-3000x2000.png',
							component_locationFactsBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/841e57ddb41eec71c6ea56ea03641490de55acf2-3000x2000.png',
							component_locationLandingPageHero:
								'https://cdn.sanity.io/images/3rbseux7/production/4512520a6cb1dc681b1d8d41e920642985f744c2-3000x2000.png',
							component_profileContentBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/bcb4df7f8952f9539a1b73119201b6a75a0593f4-3000x2000.png',
							component_profileHero:
								'https://cdn.sanity.io/images/3rbseux7/production/3ebd906f91238b4940ea04b493a90c9a0e22a1cd-3000x2000.png',
							component_teamValuesBlock:
								'https://cdn.sanity.io/images/3rbseux7/production/5207be991898bbbd9ba558c4a4ddb93f1e75351b-3000x2000.png',
							component_testimonialAutoScroll:
								'https://cdn.sanity.io/images/3rbseux7/production/4cc26cd73a3b57c6d5e31c1016978191cf217e45-3000x2000.png',
						};
						return s in i ? i[s] : undefined;
					},
				},
				{
					name: 'list',
				},
			],
			groups: [
				{
					name: 'hero',
					title: 'Hero',
					of: [
						'component_hero',
						'component_heroWithSubscribe',
						'component_electionsPositionHero',
						'component_electionsSearchHero',
						'component_locationLandingPageHero',
						'component_profileHero',
					],
				},
				{
					name: 'form',
					title: 'Form',
					of: ['component_demoRequestBlock', 'component_electionsNearYouBlock', 'component_heroWithSubscribe', 'component_newsletterBlock', 'component_clickToCallBlock'],
				},
				{
					name: 'text',
					title: 'Text',
					of: [
						'component_locationEditorialBlock',
						'component_bannerBlock',
						'component_calculatorTextBlock',
						'component_twoUpCardBlock',
						'component_comparisonBlock',
						'component_stepperBlock',
						'component_iconContentBlock',
						'component_imageContentBlock',
						'component_tabbedImageBlock',
						'component_featuresBlock',
						'component_jobOpeningsBlock',
						'component_faqBlock',
						'component_profileContentBlock',
						'component_voterDensityBlock',
						'component_electionsPositionContentBlock',
					],
				},
				{
					name: 'image',
					title: 'Image',
					of: [
						'component_bannerBlock',
						'component_twoUpCardBlock',
						'component_stepperBlock',
						'component_imageContentBlock',
						'component_tabbedImageBlock',
						'component_featuresBlock',
						'component_ctaImageBlock',
					],
				},
				{
					name: 'quote',
					title: 'Quote',
					of: [
						'component_testimonialBlockWithLink',
						'component_twoUpCardBlock',
						'component_carouselBlock',
						'component_testimonialBlock',
						'component_testimonialAutoScroll',
					],
				},
				{
					name: 'cards',
					title: 'Cards',
					of: [
						'component_twoUpCardBlock',
						'component_comparisonBlock',
						'component_stepperBlock',
						'component_pricingBlock',
						'component_teamBlock',
						'component_teamValuesBlock',
						'component_carouselBlock',
						'component_testimonialBlock',
						'component_faqBlock',
						'component_blogBlock',
						'component_candidatesBlock',
						'component_profileContentBlock',
						'component_voterDensityBlock',
						'component_electionsPositionContentBlock',
					],
				},
				{
					name: 'grid',
					title: 'Grid',
					of: [
						'component_comparisonBlock',
						'component_iconContentBlock',
						'component_imageContentBlock',
						'component_featuresBlock',
						'component_jobOpeningsBlock',
						'component_electionsIndexBlock',
					],
				},
				{
					name: 'stats',
					title: 'Stats',
					of: ['component_statsBlock'],
				},
				{
					name: 'pricing',
					title: 'Pricing',
					of: ['component_pricingBlock'],
				},
				{
					name: 'features',
					title: 'Features',
					of: ['component_pricingBlock', 'component_featuresBlock', 'component_jobOpeningsBlock'],
				},
				{
					name: 'cta',
					title: 'CTA',
					of: [
						'component_electionPositionResourcesBlock',
						'component_ctaBannerBlock',
						'component_ctaBlock',
						'component_ctaImageBlock',
						'component_ctaCardsBlock',
						'component_clickToCallBlock',
						'component_newsletterBlock',
						'component_claimProfileBlock',
					],
				},
				{
					name: 'blog',
					title: 'Blog',
					of: ['component_blogBlock', 'component_featuredBlogBlock', 'component_blogTopicTagsBlock'],
				},
			],
		},
	},
	type: 'array',
	of: [
		{ title: 'Election Position Resources Block', type: 'component_electionPositionResourcesBlock' },
		{ title: 'Demo Request Block', type: 'component_demoRequestBlock' },
		{ title: 'Elections Near You Block', type: 'component_electionsNearYouBlock' },
		{ title: 'Location Editorial Block', type: 'component_locationEditorialBlock' },
		{
			title: 'Testimonial Block With Link',
			type: 'component_testimonialBlockWithLink',
		},
		{
			title: 'Hero',
			type: 'component_hero',
		},
		{
			title: 'Hero With Subscribe',
			type: 'component_heroWithSubscribe',
		},
		{
			title: 'Location Landing Page Hero',
			type: 'component_locationLandingPageHero',
		},
		{
			title: 'Profile Hero',
			type: 'component_profileHero',
		},
		{
			title: 'Calculator Text Block',
			type: 'component_calculatorTextBlock',
		},
		{
			title: 'Banner Block',
			type: 'component_bannerBlock',
		},
		{
			title: 'Two Up Card Block',
			type: 'component_twoUpCardBlock',
		},
		{
			title: 'Comparison Block',
			type: 'component_comparisonBlock',
		},
		{
			title: 'Stepper Block',
			type: 'component_stepperBlock',
		},
		{
			title: 'Icon Content Block',
			type: 'component_iconContentBlock',
		},
		{
			title: 'Image Content Block',
			type: 'component_imageContentBlock',
		},
		{
			title: 'Stats Block',
			type: 'component_statsBlock',
		},
		{
			title: 'Tabbed Image Block',
			type: 'component_tabbedImageBlock',
		},
		{
			title: 'Pricing Block',
			type: 'component_pricingBlock',
		},
		{
			title: 'Features Block',
			type: 'component_featuresBlock',
		},
		{
			title: 'Job Openings Block',
			type: 'component_jobOpeningsBlock',
		},
		{
			title: 'Team Block',
			type: 'component_teamBlock',
		},
		{
			title: 'Carousel Block',
			type: 'component_carouselBlock',
		},
		{
			title: 'Testimonial Block',
			type: 'component_testimonialBlock',
		},
		{
			title: 'FAQ Block',
			type: 'component_faqBlock',
		},
		{
			title: 'CTA Banner Block',
			type: 'component_ctaBannerBlock',
		},
		{
			title: 'CTA Block',
			type: 'component_ctaBlock',
		},
		{
			title: 'CTA Image Block',
			type: 'component_ctaImageBlock',
		},
		{
			title: 'CTA Cards Block',
			type: 'component_ctaCardsBlock',
		},
		{
			title: 'Newsletter Block',
			type: 'component_newsletterBlock',
		},
		{
			title: 'Blog Block',
			type: 'component_blogBlock',
		},
		{
			title: 'Featured Blog Block',
			type: 'component_featuredBlogBlock',
		},
		{
			title: 'Blog Topic Tags Block',
			type: 'component_blogTopicTagsBlock',
		},
		{
			title: 'Breadcrumb Block',
			type: 'component_breadcrumbBlock',
		},
		{
			title: 'Candidates Block',
			type: 'component_candidatesBlock',
		},
		{
			title: 'Claim Profile Block',
			type: 'component_claimProfileBlock',
		},
		{
			title: 'Elections Index Block',
			type: 'component_electionsIndexBlock',
		},
		{
			title: 'Elections Position Hero',
			type: 'component_electionsPositionHero',
		},
		{
			title: 'Elections Position Content Block',
			type: 'component_electionsPositionContentBlock',
		},
		{
			title: 'Elections Search Hero',
			type: 'component_electionsSearchHero',
		},
		{
			title: 'Featured Cities Block',
			type: 'component_featuredCitiesBlock',
		},
		{
			title: 'GoodParty.org Pledge',
			type: 'component_goodPartyOrgPledge',
		},
		{
			title: 'Location Facts Block',
			type: 'component_locationFactsBlock',
		},
		{
			title: 'Profile Content Block',
			type: 'component_profileContentBlock',
		},
		{
			title: 'Voter Density Map Block',
			type: 'component_voterDensityBlock',
		},
		{
			title: 'List of Offices Block',
			type: 'component_listOfOfficesBlock',
		},
		{
			title: 'Embedded Block',
			type: 'component_embeddedBlock',
		},
		{
			title: 'Click to Call Block',
			type: 'component_clickToCallBlock',
		},
		{
			title: 'Team Values Block',
			type: 'component_teamValuesBlock',
		},
		{
			title: 'Testimonials Auto Scroll',
			type: 'component_testimonialAutoScroll',
		},
	],
};
