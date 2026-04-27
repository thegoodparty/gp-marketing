export const LinkTarget = {
	BLANK: '_blank',
	SELF: '_self',
} as const;

// Merged const + type export (TypeScript pattern)
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LinkTarget = (typeof LinkTarget)[keyof typeof LinkTarget];

export const TypographyStackSpacing = {
	DEFAULT: 'default',
	EDITORIAL: 'editorial',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type TypographyStackSpacing = (typeof TypographyStackSpacing)[keyof typeof TypographyStackSpacing];
