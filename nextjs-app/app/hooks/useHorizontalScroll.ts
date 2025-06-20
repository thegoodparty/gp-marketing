import { useRef } from 'react'

export const useHorizontalScroll = (amount: number = 400) => {
  const ref = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    ref.current?.scrollBy({ left: -amount, behavior: 'smooth' })
  }

  const scrollRight = () => {
    ref.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return { ref, scrollLeft, scrollRight }
}
