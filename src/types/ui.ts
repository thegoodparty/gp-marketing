export const LinkTarget = {
	BLANK: '_blank',
	SELF: '_self',
} as const;

export type LinkTarget = (typeof LinkTarget)[keyof typeof LinkTarget];
