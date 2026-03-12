export const leftRightValues = ['left', 'right'] as const;
export const leftCenterValues = ['left', 'center'] as const;
export const leftCenterRightValues = ['left', 'center', 'right'] as const;

export const horizontalVerticalValues = ['horizontal', 'vertical'] as const;

export const xsmallSmallMediumLargeXlargeValues = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const xxsmallXsmallSmallLargeValues = ['2xs', 'xs', 'sm', 'lg'] as const;
export const xsmallSmallMediumValues = ['xs', 'sm', 'md'] as const;
export const smallMediumLargeValues = ['sm', 'md', 'lg'] as const;
export const smallLargeValues = ['sm', 'lg'] as const;
export const smallMediumValues = ['sm', 'md'] as const;
export const mediumLargeValues = ['md', 'lg'] as const;
export const mediumLargeXlargeValues = ['md', 'lg', 'xl'] as const;
export const largeValues = ['lg'] as const;
export const normalCondensedValues = ['normal', 'condensed'] as const;

export const buttonActionValues = ['internal', 'external', 'anchor', 'download', 'modal'] as const;
export const buttonTypeValues = ['primary', 'secondary', 'tertiary'] as const;

export const aspectRatioValues = ['1:1', '16:9', '9:16', '5:4', '4:5', '4:3', '3:4', 'default'] as const;

export const widthFitFullValues = ['fit', 'full'] as const;

export const columnTwoThreeFourValues = [2, 3, 4] as const;
export const columnOneTwoThreeValues = [1, 2, 3] as const;

/* COLORS */

export const backgroundTypeValues = ['cream', 'midnight'] as const;
export const buttonStyleTypeValues = [
	'primary',
	'secondary',
	'outline',
	'outline-inverse',
	'ghost',
	'ghost-inverse',
	'min-ghost',
	'min-ghost-inverse',
] as const;

export const primaryButtonStyleType = buttonStyleTypeValues[0];
export const secondaryButtonStyleType = buttonStyleTypeValues[1];
export const outlineButtonStyleType = buttonStyleTypeValues[2];
export const defaultCtaButtonStyleType = 'secondary' as const;
export const iconColorValues = ['red', 'waxflower', 'bright-yellow', 'halo-green', 'blue', 'lavender', 'white', 'mixed'] as const;
export const colorTypeValues = ['blue', 'red', 'waxflower', 'bright-yellow', 'halo-green', 'lavender', 'inverse'] as const;
export const componentColorValues = [
	'blue',
	'red',
	'waxflower',
	'bright-yellow',
	'halo-green',
	'lavender',
	'midnight',
	'cream',
	'inverse',
] as const;

/* CONTENT SECTIONS */

export const twoUpCardBlockCardTypeValues = ['ValueProposition', 'Quote', 'Image'] as const;
