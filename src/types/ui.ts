export const LINK_TARGET = {
	BLANK: '_blank',
	SELF: '_self',
} as const;

export type LinkTarget = (typeof LINK_TARGET)[keyof typeof LINK_TARGET];

export const TYPOGRAPHY_STACK_SPACING = {
	DEFAULT: 'default',
	EDITORIAL: 'editorial',
} as const;

export type TypographyStackSpacing = (typeof TYPOGRAPHY_STACK_SPACING)[keyof typeof TYPOGRAPHY_STACK_SPACING];
