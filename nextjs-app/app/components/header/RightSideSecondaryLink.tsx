import Link from 'next/link'
import Button from '../../shared/buttons/Button'

interface RightSideSecondaryLinkProps {
  link?: {
    title: string
    url: string
  }
}

export default function RightSideSecondaryLink({
  link,
}: RightSideSecondaryLinkProps) {
  if (!link) return null

  return (
    <Button
      href={link.url}
      target="_blank"
      variant="text"
      color="primary"
      className="font-semibold"
    >
      {link.title}
    </Button>
  )
}
