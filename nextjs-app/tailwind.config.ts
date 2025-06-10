import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './sanity/**/*.{ts,tsx}',
    './../node_modules/goodparty-styleguide/dist/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      boxShadow: {
        layer: '0 35px 60px -15px rgba(0,0,0,0.3)',
      },
      colors: {
        avatar: {
          default: {
            background: 'var(--component-avatar-default-background)',
          },
          brightyellow: {
            background: 'var(--component-avatar-brightyellow-background)',
          },
          lavender: {
            background: 'var(--component-avatar-lavender-background)',
          },
          halogreen: {
            background: 'var(--component-avatar-halogreen-background)',
          },
          blue: {
            background: 'var(--component-avatar-blue-background)',
          },
          waxflower: {
            background: 'var(--component-avatar-waxflower-background)',
          },
        },
        button: {
          default: {
            background: 'var(--component-button-default-background)',
            text: 'var(--component-button-default-text)',
            border: 'var(--component-button-default-border)',
          },
          secondary: {
            background: 'var(--component-button-secondary-background)',
            text: 'var(--component-button-secondary-text)',
            border: 'var(--component-button-secondary-border)',
          },
          destructive: {
            background: 'var(--component-button-destructive-background)',
            text: 'var(--component-button-destructive-text)',
            border: 'var(--component-button-destructive-border)',
          },
          outline: {
            background: 'var(--component-button-outline-background)',
            text: 'var(--component-button-outline-text)',
            border: 'var(--component-button-outline-border)',
          },
          ghost: {
            background: 'var(--component-button-ghost-background)',
            text: 'var(--component-button-ghost-text)',
            border: 'var(--component-button-ghost-border)',
          },
          whiteOutline: {
            background: 'var(--component-button-white-outline-background)',
            text: 'var(--component-button-white-outline-text)',
            border: 'var(--component-button-white-outline-border)',
          },
          whiteGhost: {
            background: 'var(--component-button-white-ghost-background)',
            text: 'var(--component-button-white-ghost-text)',
            border: 'var(--component-button-white-ghost-border)',
          },
        },
        brand: {
          default: 'var(--color-brand-default)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
          midnight: 'var(--color-brand-midnight)',
          lavender: 'var(--color-brand-lavender)',
          halogreen: 'var(--color-brand-halogreen)',
          waxflower: 'var(--color-brand-waxflower)',
        },
      },
    },
  },
  plugins: [typography],
}

export default config
