'use client'

import React from 'react'
import { LinkText } from '../LinkText'
import { DesignTokens } from '../../types/design-tokens'
import { GoodPartyOrgLogoWordmark } from 'goodparty-styleguide'
import FooterLinkList, { FooterColumn } from './FooterLinkList'

const columns: FooterColumn[] = [
  {
    heading: 'Our Org',
    links: [
      { label: 'Volunteer', url: '/volunteer' },
      { label: 'Our Team', url: '/team' },
      { label: 'Find Candidates', url: '/candidates' },
      { label: 'Careers', url: '/careers' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'FAQs', url: '/faq' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Demo', url: '/demo' },
    ],
  },
  {
    heading: 'Campaigns',
    links: [
      { label: 'Run for office', url: '/run-for-office' },
      { label: 'Explore offices', url: '/offices' },
      { label: 'Declare Independence', url: '/declare-independence' },
      { label: 'Pricing', url: '/pricing' },
    ],
  },
  {
    heading: 'Follow',
    links: [
      { label: 'Instagram', url: 'https://instagram.com/goodparty' },
      { label: 'TikTok', url: 'https://tiktok.com/@goodparty' },
      { label: 'Facebook', url: 'https://facebook.com/goodparty' },
      { label: 'X', url: 'https://x.com/goodparty' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      className="text-white"
      style={{ backgroundColor: DesignTokens.COLOR_BRAND_SECONDARY }}
    >
      <div className="container mx-auto max-w-[1280px] px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pt-20 pb-20">
          {columns.map((col) => (
            <FooterLinkList key={col.heading} {...col} />
          ))}
        </div>

        <hr className="border-white/25" />

        <div className="flex flex-col items-center text-center gap-6 py-12 max-w-[380px] mx-auto">
          <GoodPartyOrgLogoWordmark className="h-9 w-auto" />

          <p className="text-xs leading-relaxed">
            Not a political party. We&apos;re building free tools to change the
            rules, so good independent candidates can run and win!
          </p>

          <p className="text-xs leading-relaxed">
            Copyright © {new Date().getFullYear()} GoodParty.org. All rights
            reserved
          </p>

          <div className="flex items-center gap-3 text-xs">
            <LinkText
              label="Privacy Policy"
              url="/privacy"
              className="text-xs"
            />
            <span className="text-sm font-semibold">|</span>
            <LinkText
              label="Terms of Service"
              url="/terms"
              className="text-xs"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
