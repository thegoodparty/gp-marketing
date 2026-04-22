import type {StructureBuilder} from "sanity/structure";
import {getIcon} from "../utils/getIcon.tsx";
import type {ComponentType, ReactNode} from "react";
import type {Divider, ListItem, ListItemBuilder} from "sanity/structure";
import {sites} from "../../../sites.ts";

export function defaultStructure(S: StructureBuilder) {

  function group({ id, title, icon, items}: {
    id: string
    items: Array<ListItem | ListItemBuilder | Divider | ReturnType<typeof S.divider>>
    title?: string
    icon?: ComponentType | ReactNode
  }) {
    const schema = S.context.schema.get(id)!
    return S.listItem({
      id,
      title: title || schema.title,
      icon: icon || schema.icon,
      child(id) {
        return S.list({
          id,
          title: title || schema.title!,
          items
        })
      }
    })
  }

  function item(schemaType: string) {
    const schema = S.context.schema.get(schemaType)
    if(!schema) {
      throw new Error(`Schema type ${schemaType} not found`)
    }
    const isSingle = schema.options?.['single'] === true
    if(isSingle) {
      return S.documentTypeListItem(schemaType).child(
        S.defaultDocument({schemaType,documentId: schemaType})
      )
    }
    return S.documentTypeListItem(schemaType)
  }

  return S.list({
    id: "__root__",
    title: "Content",
    items: [
      group({
        id: 'goodpartyOrg',
        title: sites.goodpartyOrg.title,
        icon: sites.goodpartyOrg.icon,
        items: [
          item('goodpartyOrg_home'),
          item('goodpartyOrg_landingPages'),
          group({
            id: 'experiment_variant',
            title: 'Experiments',
            icon: getIcon('Chemistry'),
            items: [
              item('experiment_variant'),
            ],
          }),
          S.divider(),
          group({
            id: 'goodpartyOrg_allArticles',
            items: [
              item('goodpartyOrg_allArticles'),
              S.divider(),
              item('article').id('goodpartyOrg_article'),
              item('categories').id('goodpartyOrg_categories'),
              item('topics').id('goodpartyOrg_topics'),
            ]
          }),
          group({
            id: 'goodpartyOrg_glossary',
            items: [
              item('goodpartyOrg_glossary'),
              S.divider(),
              item('glossary').id('goodpartyOrg_gloss'),
            ]
          }),
          S.divider(),
          item('goodpartyOrg_contact'),
          item('policy').id('goodpartyOrg_policy'),
          S.divider(),
          group({
            id: 'settings',
            title: 'Settings',
            icon: getIcon('Settings'),
            items: [
              item('goodpartyOrg_navigation'),
              item('goodpartyOrg_footer'),
              item('goodpartyOrg_socialChannels'),
              S.divider(),
              item('goodpartyOrg_redirects'),
              item('goodpartyOrg_seoSettings'),
              S.divider(),
              item('goodpartyOrg_404Page'),
              S.divider(),
              item('goodpartyOrg_allComponents'),
            ]
          }),
        ]
      }),
      S.divider(),
      item('pricingPlan'),
      item('features'),
      S.divider(),
      item('cTAs'),
      item('download'),
      item('forms'),
      S.divider(),
      item('article'),
      group({
        id: 'faq',
        items: [
          item('faq'),
          S.divider(),
          item('faqCollection'),
        ]
      }),
      item('glossary'),
      S.divider(),
      group({
        id: 'quotes',
        items: [
          item('quotes'),
          S.divider(),
          item('quoteCollections'),
        ]
      }),
      item('person'),
      item('organisation'),
      S.divider(),
      item('policy'),
      item('registeredCompany'),
      S.divider(),
      group({
        id: 'taxonomy',
        title: 'Taxonomy',
        icon: getIcon('Term'),
        items: [
          item('categories'),
          item('topics'),
        ]
      }),
    ]
  })
}
