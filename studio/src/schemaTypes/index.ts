import { person } from './documents/person'
import { page } from './documents/page'
import { post } from './documents/post'
import { callToAction } from './objects/callToAction'
import { infoSection } from './objects/infoSection'
import { settings } from './singletons/settings'
import { link } from './objects/link'
import { blockContent } from './objects/blockContent'
import { pageHero } from './objects/pageHero'
import { valueProposition } from './objects/valueProposition'
import { testimonialBlock } from './objects/testimonialBlock'
import { featureModules } from './objects/featureModules'
import { ctaCardBlock } from './objects/ctaCardBlock'
import { faqBlock } from './objects/faqBlock'
import { blockHeader } from './objects/blockHeader'
import { stepperStep } from './objects/stepperStep'
import { stepperBlock } from './objects/stepperBlock'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  post,
  person,
  // Objects
  pageHero,
  blockContent,
  infoSection,
  callToAction,
  link,
  valueProposition,
  testimonialBlock,
  featureModules,
  ctaCardBlock,
  faqBlock,
  blockHeader,
  stepperStep,
  stepperBlock,
]
