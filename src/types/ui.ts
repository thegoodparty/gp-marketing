export const LinkTarget = {
	BLANK: '_blank',
	SELF: '_self',
} as const;

export type LinkTarget = (typeof LinkTarget)[keyof typeof LinkTarget];

export const TypographyStackSpacing = {
	DEFAULT: 'default',
	EDITORIAL: 'editorial',
} as const;

export type TypographyStackSpacing = (typeof TypographyStackSpacing)[keyof typeof TypographyStackSpacing];
