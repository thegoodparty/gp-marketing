'use client'

import React from 'react'
import { LinkText } from '../LinkText'

export interface FooterColumn {
  heading: string
  links: {
    label: string
    url: string
  }[]
}

const FooterLinkList: React.FC<FooterColumn> = ({ heading, links }) => (
  <div className="flex flex-col gap-8">
    <h4 className="text-xl font-semibold text-white">{heading}</h4>

    <ul className="flex flex-col gap-6">
      {links.map((link) => (
        <li key={link.label}>
          <LinkText
            label={link.label}
            url={link.url}
            className="text-base text-white font-semibold"
          />
        </li>
      ))}
    </ul>
  </div>
)

export default FooterLinkList
