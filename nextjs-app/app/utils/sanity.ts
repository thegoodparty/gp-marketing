import { LinkType, SanityLink, SanityReference } from '../types/sanity'

export const getLinkUrl = (
  linkObj: SanityLink,
  pageResolver?: (pageRef: SanityReference) => string,
  postResolver?: (postRef: SanityReference) => string,
): string => {
  if (linkObj.linkType === LinkType.HREF && linkObj.href) {
    return linkObj.href
  }

  if (linkObj.linkType === LinkType.PAGE && linkObj.page) {
    if (pageResolver) {
      return pageResolver(linkObj.page)
    }
    // TODO: Use a defaul global page resolver
    console.warn(
      'Page reference found but no pageResolver provided:',
      linkObj.page,
    )
    return ''
  }

  if (linkObj.linkType === LinkType.POST && linkObj.post) {
    if (postResolver) {
      return postResolver(linkObj.post)
    }
    // TODO: Use a defaul global post resolver
    console.warn(
      'Post reference found but no postResolver provided:',
      linkObj.post,
    )
    return ''
  }

  console.error('Could not resolve link:', linkObj)
  return ''
}
