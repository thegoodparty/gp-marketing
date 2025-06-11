import React, { useState } from 'react'
import { type LucideIcon } from 'lucide-react'
import { getLucideIcon } from '../utils/icons'

export interface AccordionItem {
  question: string
  answer: string
  defaultOpen?: boolean
}

/**
 * Accessible accordion used by the FAQBlock component.
 * Does not rely on external dependencies and follows the WAI-ARIA accordion pattern.
 */
export default function Accordion({
  question,
  answer,
  defaultOpen = false,
}: AccordionItem) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const PlusIcon = getLucideIcon('Plus') as LucideIcon
  const MinusIcon = getLucideIcon('Minus') as LucideIcon

  return (
    <div className="bg-white rounded-2xl w-full" data-testid="accordion-item">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`faq-content-${question.replace(/\s+/g, '-')}`}
        className="flex w-full items-center justify-between gap-4 p-6 md:p-8"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h3 className="text-[20px] md:text-[24px] font-semibold text-[#0b1529] text-left flex-1">
          {question}
        </h3>
        {isOpen ? (
          <MinusIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
        ) : (
          <PlusIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div
          id={`faq-content-${question.replace(/\s+/g, '-')}`}
          className="px-6 pb-6 md:px-8 md:pb-8"
        >
          <p className="text-base md:text-[18px] leading-relaxed text-[#0b1529]">
            {answer}
          </p>
        </div>
      )}
    </div>
  )
}
