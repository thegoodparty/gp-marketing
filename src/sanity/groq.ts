import { defineQuery } from 'next-sanity';

/* language=textmate */
export const anchorIdGroq = `select(defined(field_anchorId)=>"#"+field_anchorId,"")`;
/*language=textmate*/
export const categoriesHrefGroq = `_type=="categories"=>{"href":"/blog/section/"+coalesce(tagOverview.field_slug,_id)}`;
/*language=textmate*/
export const articleHrefGroq = `_type=="article"=>{"href":"/blog/article/"+coalesce(editorialOverview.field_slug,_id)}`;
/*language=textmate*/
export const homeHrefGroq = `_type=="goodpartyOrg_home"=>{"href":"/"}`;
/*language=textmate*/
export const allArticlesHrefGroq = `_type=="goodpartyOrg_allArticles"=>{"href":"/blog"}`;
/*language=textmate*/
export const topicsHrefGroq = `_type=="topics"=>{"href":"/blog/tag/"+coalesce(tagOverview.field_slug,_id)}`;
/*language=textmate*/
export const landingPagesHrefGroq = `_type=="goodpartyOrg_landingPages"=>{"href":"/"+coalesce(detailPageOverviewNoHero.field_slug,_id)}`;
/*language=textmate*/
export const glossaryHrefGroq = `_type=="goodpartyOrg_glossary"=>{"href":"/political-terms"}`;
/*language=textmate*/
export const glossaryTermHrefGroq = `_type=="glossary"=>{"href":"/political-terms/"+coalesce(glossaryTermOverview.field_slug,_id)}`;
/*language=textmate*/
export const contactHrefGroq = `_type=="goodpartyOrg_contact"=>{"href":"/contact"}`;
/*language=textmate*/
export const policyHrefGroq = `_type=="policy"=>{"href":"/"+coalesce(policyOverview.field_slug,_id)}`;
/*language=textmate*/
export const allComponentsHrefGroq = `_type=="goodpartyOrg_allComponents"=>{"href":"/all"}`;
/*language=textmate*/
export const notFoundHrefGroq = `_type=="goodpartyOrg_404Page"=>{"href":"/not-found"}`;
/*language=textmate*/
export const embedPageHrefGroq = `_type=="goodpartyOrg_embedPage"=>{"href":"/embed/"+coalesce(embedPageOverview.field_slug,_id)}`;
/*language=textmate*/
export const hrefGroq = `${homeHrefGroq},${allArticlesHrefGroq},${articleHrefGroq},${categoriesHrefGroq},${topicsHrefGroq},${landingPagesHrefGroq},${embedPageHrefGroq},${glossaryHrefGroq},${glossaryTermHrefGroq},${contactHrefGroq},${policyHrefGroq},${allComponentsHrefGroq},${notFoundHrefGroq}`;
/*language=textmate*/
export const internalLinkGroq = `{...href->{_id,_type,"name":coalesce(singlePageOverviewNoHero.field_pageName,detailPageOverviewNoHero.field_pageName,embedPageOverview.field_pageName,singlePageOverview.field_pageName,tagOverview.field_name,glossaryOverview.field_name,policyOverview.field_policyName,null),"label":coalesce(tagOverview.field_pageSubtitle,glossaryOverview.field_pageSubtitle,null),"title":coalesce(singlePageOverview.field_pageTitle,editorialOverview.field_editorialTitle,glossaryTermOverview.field_glossaryTerm,null),${hrefGroq}}}`;
/*language=textmate*/
const downloadGroq = `_id,_type,"name":downloadOverview.field_documentName,"file":downloadOverview.field_file.asset->`;
/*language=textmate*/
const textBlockGroq = `markDefs[]{...,_type=="inlineInternalLink"=>{field_internalLink${internalLinkGroq}}}`;
/*language=textmate*/
const planFeatureGroq = `markDefs[]{...,ref_inlineFeaturesItem->{...,"planColor":^.^.^.^.^.pricingPlanDesignSettings.field_componentColor6ColorsMidnight}}`;
/*language=textmate*/
export const globalCtaPrimaryButtonGroq = `"text":field_buttonText,"action":field_ctaAction,"link":field_internalLink${internalLinkGroq},field_externalLink,"anchor":${anchorIdGroq},ref_download->{${downloadGroq}}`;
/*language=textmate*/
export const buttonGroq = `_key,"action":field_ctaActionWithShared,"hierarchy":field_buttonHierarchy,"link":field_internalLink${internalLinkGroq},field_externalLink,"anchor":${anchorIdGroq},ref_download->{${downloadGroq}},field_ctaActionWithShared=="Reference"=>{...ref_sharedCta->{...ctaAction{${globalCtaPrimaryButtonGroq}}}},"text":coalesce(field_buttonText,ref_sharedCta->ctaAction.field_buttonText)`;
/*language=textmate*/
export const ctaBaseGroq = `"overview":ctaMessaging{...,block_summaryText[]{...,${textBlockGroq}}},"primaryCTA":{...ctaAction{${globalCtaPrimaryButtonGroq}}},"secondaryCTA":secondaryCta.ctaActionWithShared{${buttonGroq}}`;
/*language=textmate*/
export const summaryInfoGroq = `...,list_buttons[]{${buttonGroq}},block_summaryText[]{...,${textBlockGroq}}`;
/*language=textmate*/
export const tagsGroq = `...,list_tags[]->`;
/*language=textmate*/
export const quoteGroq = `...,generalContentTags{${tagsGroq}},quote{...,ref_quoteBy->}`;
/*language=textmate*/
export const featureGroq = `field_featureOptions,showFullImage,field_featureOptions=="Custom"=>{defined(customFeature)=>{...customFeature{...,ctaActionWithShared{${buttonGroq}}}},defined(customFeatureWithImage)=>{...customFeatureWithImage{...,ctaActionWithShared{${buttonGroq}}}}},field_featureOptions=="Reference"=>{...ref_chooseAFeature->{...featureAssets,...featureOverview{...,ctaActionWithShared{${buttonGroq}}}}}`;
/*language=textmate*/
export const quotesContentCollectionGroq = `field_quotesContentOptions,"quotes":null,field_quotesContentOptions=="Manual"=>{"quotes":list_chooseQuotes[]->{${quoteGroq}}},field_quotesContentOptions=="Collection"=>{"quotes":ref_quoteCollection->quoteCollectionContent.list_chooseQuotes[]->{${quoteGroq}}}`;
/*language=textmate*/
export const faQGroq = `...,faqOverview{...,block_answer[]{_type=="button"=>{${buttonGroq}},_type!="button"=>{...,${textBlockGroq}}}}`;
/*language=textmate*/
export const faQsContentCollectionGroq = `field_faQsContentOptions,field_faQsContentOptions=="Manual"=>{"faQs":list_faQs[]->{${faQGroq}}},field_faQsContentOptions=="Collection"=>{"faQs":ref_faqCollection->faqCollectionContent.list_collectionFaQs[]->{${faQGroq}}}`;
/*language=textmate*/
export const pricingPlanGroq = `...,pricingPlanCta{...,ctaActionWithShared{${buttonGroq}}},pricingPlanFeatures{...,list_pricingPlanFeatureListItems[]{block_pricingPlanFeatureItemText[]{...,${planFeatureGroq}}}}`;
/*language=textmate*/
export const component_pricingBlockGroq = `_type=="component_pricingBlock"=>{...,summaryInfo{${summaryInfoGroq}},plans{...,list_pricingPlans[]->{${pricingPlanGroq}}}}`;
/*language=textmate*/
export const component_heroGroq = `_type=="component_hero"=>{...,summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_comparisonBlock = `_type=="component_comparisonBlock"=>{...,summaryInfo{${summaryInfoGroq}},comparisonBlockTableOne{...,list_comparisonBlockTableItems[]{...,block_summaryText[]{...,${textBlockGroq}}}},comparisonBlockTableTwo{...,list_comparisonBlockTableItems[]{...,block_summaryText[]{...,${textBlockGroq}}}}}`;
/*language=textmate*/
export const component_stepperBlockGroq = `_type=="component_stepperBlock"=>{...,summaryInfo{${summaryInfoGroq}},stepperBlockItems{...,list_stepperBlockItems[]{...,summaryInfo{${summaryInfoGroq}}}}}`;
/*language=textmate*/
export const component_iconContentBlock = `_type=="component_iconContentBlock"=>{...,summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_imageContentBlock = `_type=="component_imageContentBlock"=>{...,summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_statsBlock = `_type=="component_statsBlock"=>{...,summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_tabbedImageBlock = `_type=="component_tabbedImageBlock"=>{...,summaryInfo{${summaryInfoGroq}},tabbedImageBlockItems{...,list_tabbedImageItems[]{...,ctaActionWithShared{${buttonGroq}}}}}`;
/*language=textmate*/
export const component_featuresBlock = `_type=="component_featuresBlock"=>{...,summaryInfo{${summaryInfoGroq}},featuresBlockContent{...,list_featureBlockFeatures[]{${featureGroq}},list_featureBlockHighlightedFeature[]{${featureGroq}}}}`;
/*language=textmate*/
export const component_twoUpCardBlock = `_type=="component_twoUpCardBlock"=>{...,twoUpCardBlockOne{...,valuePropositionCard{...,button{${buttonGroq}}},ref_quoteReference->{${quoteGroq}}},twoUpCardBlockTwo{...,valuePropositionCard{...,button{${buttonGroq}}},ref_quoteReference->{${quoteGroq}}}}`;
/*language=textmate*/
export const component_carouselBlock = `_type=="component_carouselBlock"=>{...,quotesContentCollection{${quotesContentCollectionGroq}},summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_testimonialBlock = `_type=="component_testimonialBlock"=>{...,quotesContentCollection{${quotesContentCollectionGroq}},summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_faqBlock = `_type=="component_faqBlock"=>{...,faQsContentCollection{${faQsContentCollectionGroq}},summaryInfo{${summaryInfoGroq}}}`;

/**
 * Start of Blog Block
 */
/*language=textmate*/
export const articleCardGroq = `editorialOverview{...,ref_author->},editorialAssets,"category":editorialContentTags.ref_catgories->tagOverview.field_name,${articleHrefGroq}`;
/*language=textmate*/
export const allLatestArticlesUnlimitedForLoadMoreGroq = `*[_type=="article"][]._id`;
/*language=textmate*/
export const articlesByCategoryUnlimitedForLoadMoreGroq = `*[_type=="article"&&editorialContentTags.ref_catgories._ref==^.blogBlockContent.ref_selectACategory._ref][]._id`;
/*language=textmate*/
export const articlesByTopicUnlimitedForLoadMoreGroq = `*[_type=="article"&&(^.blogBlockContent.ref_selectATopic._ref in editorialContentTags.list_topics[]._ref)][]._id`;
/*language=textmate*/
export const allLatestArticlesLimitedGroq = `*[_type=="article"] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[0...3]{${articleCardGroq}}`;
/*language=textmate*/
export const articlesByCategoryLimitedGroq = `*[_type=="article"&&editorialContentTags.ref_catgories._ref==^.blogBlockContent.ref_selectACategory._ref] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[0...3]{${articleCardGroq}}`;
/*language=textmate*/
export const articlesByTopicLimitedGroq = `*[_type=="article"&&(^.blogBlockContent.ref_selectATopic._ref in editorialContentTags.list_topics[]._ref)] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[0...3]{${articleCardGroq}}`;
/*language=textmate*/
export const component_blogBlock = `_type=="component_blogBlock"=>{...,blogBlockSummaryInfo{${summaryInfoGroq}},"items": null, "itemsCount": 0, "loadMoreHref": null,
blogBlockContent.field_blogBlockContentOptions=="Latest by All"=>{"items":${allLatestArticlesLimitedGroq},"itemsCount":count(${allLatestArticlesUnlimitedForLoadMoreGroq}),"loadMoreHref":"/blog"},
blogBlockContent.field_blogBlockContentOptions=="Latest by Category"=>{"items":${articlesByCategoryLimitedGroq},"itemsCount":count(${articlesByCategoryUnlimitedForLoadMoreGroq}),"loadMoreHref":blogBlockContent.ref_selectACategory->{${categoriesHrefGroq}}.href},
blogBlockContent.field_blogBlockContentOptions=="Latest by Topic"=>{"items":${articlesByTopicLimitedGroq},"itemsCount":count(${articlesByTopicUnlimitedForLoadMoreGroq}),"loadMoreHref":blogBlockContent.ref_selectATopic->{${topicsHrefGroq}}.href}}`;

export const topicRelatedArticlesFirstFetchGroq = `*[][0]{
"articles":*[_type=="article"&&(^.^._id in editorialContentTags.list_topics[]._ref)] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[0...12]{${articleCardGroq}},
"itemsCount":count(*[_type=="article"&&(^.^._id in editorialContentTags.list_topics[]._ref)]),
}`;
export const categoryRelatedArticlesFirstFetchGroq = `*[][0]{
	"articles":*[_type=="article"&&(editorialContentTags.ref_catgories._ref==^.^._id)] | order(coalesce(editorialOverview.field_lastUpdated,editorialOverview.field_publishedDate) desc)[0...12]{${articleCardGroq}},
	"itemsCount":count(*[_type=="article"&&(editorialContentTags.ref_catgories._ref==^.^._id)]),
	}`;
/**
 * End of Blog Block
 */

/*language=textmate*/
export const component_bannerBlock = `_type=="component_bannerBlock"=>{...,bannerBlockContent{...,list_Choose3People[]->}}`;
/*language=textmate*/
export const component_teamBlock = `_type=="component_teamBlock"=>{...,people{...,list_people[]->},summaryInfo{${summaryInfoGroq}}}`;
/*language=textmate*/
export const component_ctaBannerBlock = `_type=="component_ctaBannerBlock"=>{...,_key,_type,field_ctaType,"ref_promotion":campaignPromotion.ref_promotion->,field_ctaType=="Reference"=>{"cta":campaignPromotion.ref_promotion->{"primaryCTA":{...ctaAction{${globalCtaPrimaryButtonGroq}}},"secondaryCTA":secondaryCta.ctaActionWithShared{${buttonGroq}}}}.cta,field_ctaType=="Manual"=>{"cta":{"primaryCTA":{...ctaAction{${globalCtaPrimaryButtonGroq}}},"secondaryCTA":secondaryCta.ctaActionWithShared{${buttonGroq}}}}.cta,"title":coalesce(smallCtaMessaging.field_title,campaignPromotion.ref_promotion->ctaMessaging.field_title),"block_summaryText":coalesce(smallCtaMessaging.block_summaryText[]{...,${textBlockGroq}},campaignPromotion.ref_promotion->ctaMessaging.block_summaryText[]{...,${textBlockGroq}})}`;
/*language=textmate*/
export const ctaGroq = `_key,_type,field_ctaType,field_ctaType=="Reference"=>{"cta":campaignPromotion.ref_promotion->{${ctaBaseGroq}}}.cta,field_ctaType=="Manual"=>{"cta":{${ctaBaseGroq}}}.cta`;
/*language=textmate*/
export const component_allCtaBlocks = `_type=="component_ctaBlock"||_type=="component_ctaImageBlock"=>{${ctaGroq},_type=="component_ctaImageBlock"=>{"image":coalesce(ctaAssets,campaignPromotion.ref_promotion->ctaAssets)},"designSettings":coalesce(ctaBlockDesignSettings,ctaImageBlockDesignSettings)}`;
/*language=textmate*/
export const component_featuredBlogBlock = `_type=="component_featuredBlogBlock"=>{...,featuredBlogBlockContent{...,ref_chooseArticle->{editorialOverview,editorialAssets,${articleHrefGroq}}}}`;
/*language=textmate*/
export const component_heroWithSubscribe = `_type=="component_heroWithSubscribe"=>{...,heroSubscribeForm{...,ref_formUsed->}}`;
/*language=textmate*/
export const component_newsletterBlock = `_type=="component_newsletterBlock"=>{...,newsletterBlockForm{...,ref_formUsed->}}`;
/*language=textmate*/
export const component_ctaCardsBlock = `_type=="component_ctaCardsBlock"=>{...,ctaCardOne{...,ctaActionWithShared{${buttonGroq}}},ctaCardTwo{...,ctaActionWithShared{${buttonGroq}}}}`;
/*language=textmate*/
export const component_blogTopicTagsBlock = `_type=="component_blogTopicTagsBlock"=>{...,"topics":*[_type=="topics"][]{_id,_type,tagOverview,${topicsHrefGroq}}}`;
/*language=textmate*/
export const sectionsGroq = `_key,_type,${component_pricingBlockGroq},${component_heroGroq},${component_comparisonBlock},${component_stepperBlockGroq},${component_iconContentBlock},${component_imageContentBlock},${component_statsBlock},${component_tabbedImageBlock},${component_featuresBlock},${component_twoUpCardBlock},${component_carouselBlock},${component_testimonialBlock},${component_faqBlock},${component_blogBlock},${component_bannerBlock},${component_teamBlock},${component_featuredBlogBlock},${component_allCtaBlocks},${component_ctaBannerBlock},${component_heroWithSubscribe},${component_newsletterBlock},${component_ctaCardsBlock},${component_blogTopicTagsBlock}`;
/*language=textmate*/
export const allCategoriesLinksGroq = `*[_type=="categories"][]{_id,"title":tagOverview.field_name,${categoriesHrefGroq}}`;
/*language=textmate*/
export const goodpartyOrg_homeQuery = defineQuery(
	`*[_type=="goodpartyOrg_home"][0]{...,pageSections{...,list_pageSections[]{${sectionsGroq}}},${homeHrefGroq}}`,
);

/*language=textmate*/
export const goodpartyOrg_allArticlesQuery = defineQuery(
	`*[_type=="goodpartyOrg_allArticles"][0]{...,pageSections{...,list_pageSections[]{${sectionsGroq}}},"categories":${allCategoriesLinksGroq},${allArticlesHrefGroq}}`,
);
/*language=textmate*/
export const categoryLinkGroq = `...,tagOverview,${categoriesHrefGroq}`;
/*language=textmate*/
export const relatedArticlesGroq = `_id,_type,editorialAssets,editorialOverview{...,ref_author->},"category":editorialContentTags.ref_catgories->{${categoryLinkGroq}},${articleHrefGroq}`;
/*language=textmate*/
export const categoryAndTagPageBaseGroq = `_id,_type,tagOverview,seo,"featuredArticle":featuredBlogBlockContent.ref_chooseArticle->{${relatedArticlesGroq}},pageSections{...,list_pageSections[]{${sectionsGroq}}}`;
/*language=textmate*/
export const categoriesQuery = defineQuery(
	`*[_type=="categories"&&tagOverview.field_slug==$slug][0]{${categoryAndTagPageBaseGroq},"categories":${allCategoriesLinksGroq},"categoryRelatedArticles":${categoryRelatedArticlesFirstFetchGroq},"topics":*[_type=="topics"][]{_id,_type,tagOverview,${topicsHrefGroq}},${categoriesHrefGroq}}`,
);
/*language=textmate*/
export const topicsQuery = defineQuery(
	`*[_type=="topics"&&tagOverview.field_slug==$slug][0]{${categoryAndTagPageBaseGroq},"categories":${allCategoriesLinksGroq},"topicRelatedArticles":${topicRelatedArticlesFirstFetchGroq},"topics":*[_type=="topics"][]{_id,_type,tagOverview,${topicsHrefGroq}},${topicsHrefGroq}}`,
);
export const glossaryItemBaseGroq = `...,glossaryTermOverview{...,block_glossaryTermDefinition[0]{...,${textBlockGroq}}},${glossaryTermHrefGroq}`;
/*language=textmate*/
export const glossaryByLetterArrayQuery = defineQuery(
	`*[_type=="glossary"&&string::startsWith(lower(glossaryTermOverview.field_glossaryTerm),$slug)] | order(glossaryTermOverview.field_glossaryTerm asc)[]{${glossaryItemBaseGroq}}`,
);
/*language=textmate*/
export const glossaryHeroGroq = defineQuery(
	`*[_type=="goodpartyOrg_glossary"][0]{...,glossaryOverview,"cta":glossaryPageCta{...,ref_sharedCta->{ctaAssets,${ctaBaseGroq}}}}`,
);

/*language=textmate*/
export const glossaryQuery = defineQuery(
	`*[_type=="glossary"&&glossaryTermOverview.field_slug==$slug][0]{...,glossaryTermOverview{...,block_glossaryTermDefinition[]{...,${textBlockGroq}}},glossaryTermCta{...,ref_sharedCta->{ctaAssets,${ctaBaseGroq}}},${glossaryTermHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_glossaryQuery = defineQuery(
	`*[_type=="goodpartyOrg_glossary"][0]{...,glossaryPageCta{...,ref_sharedCta->{ctaAssets,${ctaBaseGroq}}},"aTerms":*[_type=="glossary"&&string::startsWith(lower(glossaryTermOverview.field_glossaryTerm),"a")] | order(glossaryTermOverview.field_glossaryTerm asc)[]{${glossaryItemBaseGroq}},${glossaryHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_contactQuery = defineQuery(
	`*[_type=="goodpartyOrg_contact"][0]{...,seo,pageSections{...,list_pageSections[]{${sectionsGroq}}},${contactHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_embedPageQuery = defineQuery(
	`*[_type=="goodpartyOrg_embedPage"&&embedPageOverview.field_slug==$slug][0]{...,embedPageOverview,seo,${embedPageHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_landingPagesAndPolicyQuery = defineQuery(
	`*[(_type=="goodpartyOrg_landingPages"&&detailPageOverviewNoHero.field_slug==$slug)||(_type=="policy"&&policyOverview.field_slug==$slug)][0]{...,_type=="goodpartyOrg_landingPages"=>{pageSections{...,list_pageSections[]{${sectionsGroq}}}},${landingPagesHrefGroq},${policyHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_allComponentsQuery = defineQuery(
	`*[_type=="goodpartyOrg_allComponents"][0]{...,pageSections{...,list_pageSections[]{${sectionsGroq}}},${allComponentsHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_404PageQuery = defineQuery(
	`*[_type=="goodpartyOrg_404Page"][0]{...,ErrorMessage{...,list_buttons[]{${buttonGroq}}},${notFoundHrefGroq}}`,
);
/*language=textmate*/
export const goodpartyOrg_seoSettingsQuery = defineQuery(`*[_type=="goodpartyOrg_seoSettings"][0]{...}`);
/*language=textmate*/
export const goodpartyOrg_redirectsQuery = defineQuery(`*[_type=="goodpartyOrg_redirects"][0]{...}`);
/*language=textmate*/
export const goodpartyOrg_socialChannelsQuery = defineQuery(`*[_type=="goodpartyOrg_socialChannels"][0]{...}`);
/*language=textmate*/
export const groupInternalLinkGroq = `_key,_type,"label":field_linkText,"link":field_internalLink${internalLinkGroq},"icon":field_linkIcon`;
/*language=textmate*/
export const groupExternalLinkGroq = `_key,_type,"label":field_linkText,"link":{"href":field_externalLink},"icon":field_linkIcon`;
/*language=textmate*/
export const groupNavigationGroupGroq = `_key,_type,"label":field_linkText,"list_navigationGroup":list_navigationGroup[]{_type=="internalLinkWithIcon"=>{${groupInternalLinkGroq}},_type=="externalLinkWithIcon"=>{${groupExternalLinkGroq}}}`;
/*language=textmate*/
export const navigationListGroq = `"navigationList":primaryNavigation.list_primaryNavigation[]{_type=="internalLink"=>{${groupInternalLinkGroq}},_type=="externalLink"=>{${groupExternalLinkGroq}},_type=="navigationGroup"=>{${groupNavigationGroupGroq}}},"primaryCTA":primaryNavigation.loggedOutCtAs.ref_navigationPrimaryCTA->{...ctaAction{${globalCtaPrimaryButtonGroq}}},"secondaryCTA":primaryNavigation.loggedOutCtAs.ref_navigationSecondaryCTA->{...ctaAction{${globalCtaPrimaryButtonGroq}}}`;
/*language=textmate*/
export const goodpartyOrg_navigationQuery = defineQuery(`*[_type=="goodpartyOrg_navigation"][0]{${navigationListGroq}}`);
/*language=textmate*/
export const groupFooterNavigationGroupGroq = `_key,_type,"groupTitle":field_title,"list_footerNavigationGroup":list_footerNavigationGroup[]{_type=="externalLink"=>{${groupExternalLinkGroq}},_type=="internalLink"=>{${groupInternalLinkGroq}}}`;
/*language=textmate*/
export const goodpartyOrg_footerQuery = defineQuery(
	`*[_type=="goodpartyOrg_footer"][0]{...footer,"list_footerLegalNavigation":footer.list_footerLegalNavigation[]{_type=="internalLink"=>{${groupInternalLinkGroq}},_type=="externalLink"=>{${groupExternalLinkGroq}}},"list_footerNavigation":footer.list_footerNavigation[]{${groupFooterNavigationGroupGroq}}}`,
);

/** Article - Rich Text Content Sections */

/*language=textmate*/
export const imageCtaGroq = `field_componentColor6Colors,"image":coalesce(ctaAssets,campaignPromotion.ref_promotion->ctaAssets),${ctaGroq}`;
/*language=textmate*/
export const articleSectionsGroq = `_key,_type,_type=="block"||_type=="imageContentSection"||_type=="tableGroup"=>{...},_type=="videoSection"=>{field_caption,img_fallbackImage,"shortLoopingVideo":field_shortLoopingVideo.asset->,"video":field_video.asset->},_type=="imageCta"=>{${imageCtaGroq}},_type=="ctaSection"=>{${imageCtaGroq}},_type=="inlineQuoteSection"=>{...,ref_quoteBy->},_type=="button"=>{${buttonGroq}},_type=="faqs"=>{...,list_faQs[]->{${faQGroq}}},_type=="callout"=>{...,block_summaryText[]{...,${textBlockGroq}}}`;
/*language=textmate*/
export const articleQuery = defineQuery(
	`*[_type=="article"&&editorialOverview.field_slug==$slug][0]{...,editorialOverview{...,ref_author->},relatedArticles{...,ref_stickyRelatedArticle->{${relatedArticlesGroq}},list_relatedArticles[]->{${relatedArticlesGroq}}},ctaSection{...,${imageCtaGroq}},editorialContentTags{"topics":list_topics[]->{...,${topicsHrefGroq}},"category":ref_catgories->{${categoryLinkGroq}}},contentSections{...,block_editorialContentSections[]{${articleSectionsGroq},${textBlockGroq}},${hrefGroq}},${articleHrefGroq}}`,
);
/*language=textmate*/
export const allArticlesForSearchGroq = `*[_type=="article"] | order(editorialOverview.field_editorialTitle asc)[]{_id,"title":editorialOverview.field_editorialTitle,${articleHrefGroq}}`;
/*language=textmate*/
export const allTermsForSearchGroq = `*[_type=="glossary"] | order(glossaryTermOverview.field_glossaryTerm asc)[]{_id,"title":glossaryTermOverview.field_glossaryTerm,${glossaryTermHrefGroq}}`;
