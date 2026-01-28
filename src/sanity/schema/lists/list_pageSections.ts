
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
          previewImageUrl: function (s ) { const i = {component_hero:'https://cdn.sanity.io/images/3100uthq/goodparty/a7768a8917563d73685ff721e9f1fcaf3b36fabb-3000x2000.png',component_heroWithSubscribe:'https://cdn.sanity.io/images/3100uthq/goodparty/67f0e95df99e207876eef75172903ef047216f87-3000x2000.png',component_bannerBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/877e5603c23c7a7da0ee3cf216d4b6932f3558ea-3000x2000.png',component_twoUpCardBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/c61ea069571308c0d5ab66195f07739dde69f279-3000x2000.png',component_comparisonBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/c69640e42c6211c00abbfa99063409d0e10d4cad-3000x2000.png',component_stepperBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/c9c245fa215c5a32450350e7acc9f254f4b52e7e-3000x2000.png',component_iconContentBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/b27d60838a0a92222d15345892edcda58ca1a4f9-3000x2000.png',component_imageContentBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/b51519a998882fea28ca6b6a09b4db3707ae414e-3000x2000.png',component_statsBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/de12cf0b68bde4ef09760cc6db95f4097dd0057a-3000x2000.png',component_tabbedImageBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/62ae1a96827d9db91a6df3f018d2a5d4de151d1c-3000x2000.png',component_pricingBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/f5806187635de1c8162a75d0afae3f8bd3e12eb9-3000x2000.png',component_featuresBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/2d979056b3ec1532b04dcd9cbcece59427567a5f-3000x2000.png',component_teamBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/3c1955a5f7dc1b7a8f437450e5e499df08c3d18b-3000x2000.png',component_carouselBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/ba104250aeb7e08922ec3385b6bfb715f2046d5c-3000x2000.png',component_testimonialBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/03ca591118db48ec8c5d90890556f545974712a2-3000x2000.png',component_faqBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/02b94c15685969331f055c3763218196ad0b0e7c-3000x2000.png',component_ctaBannerBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/e656091c37779cb88b594952eba9b111daba3f53-3000x2000.png',component_ctaBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/c95d91abeca01075064e9bb11ac34893ee9f8500-3000x2000.png',component_ctaImageBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/f966c2d083e7c08c95f61eb8f7f0a9e4fe17556f-3000x2000.png',component_ctaCardsBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/1c321e5847315eef758b377df2c481ce70f31037-3000x2000.png',component_newsletterBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/8b9564c0c54b1a558eee388e6bf7ece24cc3f36a-3000x2000.png',component_blogBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/c7f17c8fa4a28e2a34b30fb88a57be46159c30f8-3000x2000.png',component_featuredBlogBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/698463c3fd24bd124fcf28fae5eeefd56c6fd7f7-3000x2000.png',component_blogTopicTagsBlock:'https://cdn.sanity.io/images/3100uthq/goodparty/b790582065d70734a3ca72f79c4bcba8796c1b91-3000x2000.png'}; return s in i ? i[s] : undefined; },
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
          of: [
            'component_heroWithSubscribe',
            'component_newsletterBlock',
          ],
        },
        {
          name: 'text',
          title: 'Text',
          of: [
            'component_bannerBlock',
            'component_twoUpCardBlock',
            'component_comparisonBlock',
            'component_stepperBlock',
            'component_iconContentBlock',
            'component_imageContentBlock',
            'component_tabbedImageBlock',
            'component_featuresBlock',
            'component_faqBlock',
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
            'component_twoUpCardBlock',
            'component_carouselBlock',
            'component_testimonialBlock',
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
            'component_carouselBlock',
            'component_testimonialBlock',
            'component_faqBlock',
            'component_blogBlock',
            'component_candidatesBlock',
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
            'component_electionsIndexBlock',
          ],
        },
        {
          name: 'stats',
          title: 'Stats',
          of: [
            'component_statsBlock',
          ],
        },
        {
          name: 'pricing',
          title: 'Pricing',
          of: [
            'component_pricingBlock',
          ],
        },
        {
          name: 'features',
          title: 'Features',
          of: [
            'component_pricingBlock',
            'component_featuresBlock',
          ],
        },
        {
          name: 'cta',
          title: 'CTA',
          of: [
            'component_ctaBannerBlock',
            'component_ctaBlock',
            'component_ctaImageBlock',
            'component_ctaCardsBlock',
            'component_newsletterBlock',
            'component_claimProfileBlock',
          ],
        },
        {
          name: 'blog',
          title: 'Blog',
          of: [
            'component_blogBlock',
            'component_featuredBlogBlock',
            'component_blogTopicTagsBlock',
          ],
        },
      ],
    },
  },
  type: 'array',
  of: [
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
      title: 'Profile Hero',
      type: 'component_profileHero',
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
      title: 'Elections Index Block',
      type: 'component_electionsIndexBlock',
      title: 'Elections Position Hero',
      type: 'component_electionsPositionHero',
      title: 'Elections Search Hero',
      type: 'component_electionsSearchHero',
      title: 'Featured Cities Block',
      type: 'component_featuredCitiesBlock',
      title: 'GoodParty.org Pledge',
      type: 'component_goodPartyOrgPledge',
    },
    {
      title: 'Location Facts Block',
      type: 'component_locationFactsBlock',
    },
  ],
}