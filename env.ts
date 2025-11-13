export const projectId = String('3rbseux7')
export const dataset = String('production')
if(!projectId || !dataset) {
  throw new Error('Missing projectId or dataset')
}
export const brandName = 'Goodparty.org'
export const defaultApiVersion = '2025-09-25'
export const mediaLibraryEnabled = false
export const enabledProviders = ['google', 'github', 'sanity']


