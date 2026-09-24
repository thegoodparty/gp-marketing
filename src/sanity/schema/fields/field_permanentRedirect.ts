
/**
 * Defaults on because nearly every redirect an editor adds is a durable move,
 * and the cost of the two mistakes is lopsided: a temporary redirect left on a
 * permanent move keeps Google indexing the old URL and transfers none of its
 * link equity, while a permanent one on a short-lived move is undone by editing
 * the destination. Off-by-default made the damaging case the silent one.
 *
 * Only applies to newly created entries. Entries saved before this default was
 * added still hold no value at all, which `entriesToRedirectMap` reads as
 * temporary — so an old redirect that looks untoggled in Studio needs the
 * toggle flipped and saved, not just a glance.
 */
export const field_permanentRedirect = {
  name: 'field_permanentRedirect',
  title: 'Mark as Permanent (308)',
  description: 'Leave on to confirm the URL has changed permanently. This creates a 308 redirect, which transfers SEO value to the new page. Toggle it off only if the redirect is temporary, such as during testing or if the destination might change later.',
  options: {
    collapsible: false,
  },
  initialValue: true,
  type: 'boolean',
}