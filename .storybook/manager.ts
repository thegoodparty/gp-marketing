import { addons } from 'storybook/manager-api'
import type {TagBadgeParameters} from 'storybook-addon-tag-badges'

addons.setConfig({
  tagBadges: [
    {
      tags: ['ready'],
      badge: {
        text: 'ready',
        style: 'green',
        tooltip: 'This component is ready for use in production',
      },
    },
    {
      tags: ['done'],
      badge: {
        text: 'done',
        style: 'green',
        tooltip: 'This component is built but not yet integrated',
      },
    },
    {
      tags: ['alpha', 'beta', 'rc', 'experimental','todo','incomplete'],
      badge: ({ tag }) => {
        const upperFirst = (str: string): string =>
          str[0].toUpperCase() + str.slice(1)

        return {
          text: tag === 'rc' ? 'Release candidate' : upperFirst(tag),
          style: 'purple',
        }
      },
    },
    {
      tags: ['backlog', 'code-only'],
      badge: {
        text: 'backlog',
        style: 'grey',
        tooltip: 'This component is in the backlog'
      },
    },
    {
      tags: ['in-progress','inprogress','inProgress'],
      badge: {
        text: 'in progress',
        style: 'yellow',
        tooltip: 'This component is a work in progress',
      },
    },
    {
      tags: ['qa','in-review','inreview','inReview'],
      badge: {
        text: 'in review',
        style: 'yellow',
        tooltip: 'This component is in review',
      },
    },
    {
      tags: 'deprecated',
      badge: {
        text: 'deprecated',
        style: 'orange',
      },
    },
    {
      tags: 'danger',
      badge: {
        text: 'do not use',
        style: 'red',
      },
    },
    {
      tags: [
        {
          prefix: 'v',
        },
        {
          prefix: 'version',
        },
      ],
      badge: ({ getTagSuffix, tag }) => {
        const version = getTagSuffix(tag)
        const isExperimental = version?.startsWith('0')

        return {
          text: `${version}`,
          style: isExperimental ? 'turquoise' : 'blue',
        }
      },
    },
  ] satisfies TagBadgeParameters,
})