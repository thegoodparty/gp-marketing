import React from 'react'
import { LucideIcon } from 'lucide-react'
import { ButtonVariant } from '../../types/design-tokens'
import { IconPosition, LinkTarget } from '../../types/ui'
import { LinkButton } from '../LinkButton'
import { getLucideIcon } from '../../utils/icons'
import {
  PricingCardBackground,
  PRICING_CARD_BG_MAP,
} from '../../types/design-tokens'
import { GoodPartyOrgLogo } from 'goodparty-styleguide'

interface FeatureItem {
  icon?: string
  text: string
}

export interface PricingCardPlan {
  name: string
  price: number // USD per month
  description?: string
  features: FeatureItem[]
  backgroundColor?: PricingCardBackground
  ctaButton?: {
    label: string
    url: string
    icon?: string
    target?: LinkTarget
  }
}

export const PricingCard: React.FC<{ plan: PricingCardPlan }> = ({ plan }) => {
  const bgColor =
    PRICING_CARD_BG_MAP[
      plan.backgroundColor || PricingCardBackground.BRAND_SECONDARY
    ]
  const isDark =
    (plan.backgroundColor || PricingCardBackground.BRAND_SECONDARY) ===
    PricingCardBackground.BRAND_SECONDARY

  return (
    <div
      className={`box-border rounded-[32px] shadow-sm p-8 flex flex-col w-full max-w-[405px] md:w-[405px] h-full relative ${isDark ? 'text-white border border-white/10' : 'text-brand-dark'}`}
      style={{ backgroundColor: bgColor }}
    >
      {!isDark && (
        <GoodPartyOrgLogo className="absolute top-8 right-8 h-7 w-7" />
      )}

      <div className="flex flex-col gap-4 items-start w-full text-left">
        <div className="text-2xl font-semibold leading-tight">{plan.name}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-semibold">${plan.price}</span>
          <span className="text-base">per month</span>
        </div>
      </div>

      <hr
        className={`my-6 border-t ${isDark ? 'border-white/10' : 'border-black/10'} w-full`}
      />

      <div className="text-left w-full flex-1">
        <ul className="flex flex-col gap-2">
          {plan.features?.map((item, idx) => {
            const IconComp = getLucideIcon(item.icon || 'Check') as LucideIcon
            return (
              <li key={idx} className="flex gap-2 items-start">
                <IconComp
                  className={`mt-[2px] h-4 w-4 flex-none ${isDark ? 'text-white' : 'text-brand'}`}
                />
                <span className="text-base leading-normal">{item.text}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {plan.ctaButton && plan.ctaButton.label && plan.ctaButton.url && (
        <div className="pt-8 w-full">
          <LinkButton
            label={plan.ctaButton.label}
            url={plan.ctaButton.url}
            icon={plan.ctaButton.icon || 'ArrowRight'}
            variant={ButtonVariant.SECONDARY}
            iconPosition={IconPosition.RIGHT}
            target={plan.ctaButton.target}
            className="w-full"
            buttonClassName="w-full"
          />
        </div>
      )}
    </div>
  )
}
