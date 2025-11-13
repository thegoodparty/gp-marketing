import type { SanityImage } from '../types.ts';

export function logoSVG(crop?: SanityImage['crop'], hotspot?: SanityImage['hotspot']): SanityImage {
	return {
		crop,
		hotspot,
		asset: {
			size: 9,
			metadata: {
				dimensions: { aspectRatio: 1, height: 41, width: 41 },
				hasAlpha: false,
				isOpaque: true,
				blurHash:
					'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAALABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFBv/EACIQAAIBBAEEAwAAAAAAAAAAAAECAwAEBREhBhITMSJBof/EABcBAAMBAAAAAAAAAAAAAAAAAAECBAX/xAAWEQEBAQAAAAAAAAAAAAAAAAAAESH/2gAMAwEAAhEDEQA/AHb7Nz566Uv8YRyqj0KbufDaRxAPssP2pEkaQZa5ihUJGkxVVH0NeqXnkeTIQB2LACqmrjZWKkW47NgE74oq/wBOwxtioiyAk75ooEr/2Q==',
			},
			mimeType: 'image/svg',
			url: 'https://cdn.sanity.io/images/3100uthq/boilerplate/a56d64fbb0a0c9a37510acf9313f75a029eaadd7-42x42.svg',
		},
	};
}

export function imageJpg(crop?: SanityImage['crop'], hotspot?: SanityImage['hotspot']): SanityImage {
	return {
		crop,
		hotspot,
		asset: {
			size: 9,
			metadata: {
				dimensions: { aspectRatio: 1.7777777777777777, height: 2160, width: 3840 },
				hasAlpha: false,
				isOpaque: true,
				blurHash:
					'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAALABQDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFBv/EACIQAAIBBAEEAwAAAAAAAAAAAAECAwAEBREhBhITMSJBof/EABcBAAMBAAAAAAAAAAAAAAAAAAECBAX/xAAWEQEBAQAAAAAAAAAAAAAAAAAAESH/2gAMAwEAAhEDEQA/AHb7Nz566Uv8YRyqj0KbufDaRxAPssP2pEkaQZa5ihUJGkxVVH0NeqXnkeTIQB2LACqmrjZWKkW47NgE74oq/wBOwxtioiyAk75ooEr/2Q==',
			},
			mimeType: 'image/jpeg',
			url: 'https://cdn.sanity.io/images/3100uthq/boilerplate/d270ecadfb79fc2dd9644c2456b8fa5eddaec108-3840x2160.jpg',
		},
	};
}

export function imageJpgAlt(crop?: SanityImage['crop'], hotspot?: SanityImage['hotspot']): SanityImage {
	return {
		crop,
		hotspot,
		asset: {
			size: 9,
			metadata: {
				dimensions: { aspectRatio: 1.7777777777777777, height: 2160, width: 3840 },
				hasAlpha: false,
				isOpaque: true,
				blurHash:
					'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAALABQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAQH/8QAHRAAAQQCAwAAAAAAAAAAAAAAAAECAwQFExJCUf/EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AMALclUjqLDrnZNsYjl49V8IgaUAAH//2Q==',
			},
			mimeType: 'image/jpeg',
			url: 'https://cdn.sanity.io/images/3ik9klvj/production/2898dfffb119f226df94c0b863aa83bf6781b41a-3840x2160.jpg',
		},
	};
}

export function imagePng(crop?: SanityImage['crop'], hotspot?: SanityImage['hotspot']): SanityImage {
	return {
		crop,
		hotspot,
		asset: {
			url: 'https://cdn.sanity.io/images/3ik9klvj/production/00abd5233aeb03f543fc11703779bfdb4055dda5-2520x2520.png',
			altText: 'test-alt',
			mimeType: 'image/png',
			_createdAt: '',
			size: 9,
			metadata: {
				hasAlpha: true,
				isOpaque: false,
				blurHash:
					'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAADxklEQVQ4jY2TbWibVRTHz5OXdmMiuM2io4IMsVPmh+2DqChOP4iKqzJEi+jqrEyL1c4ufZ6+LE1Lak1Km5LOVJlOK9oxqclClS59ydr0ORljdV2fNclzTHHQUVvmCzi2OO/1Q+TeLnFsrfbAn/vp/Pifc/4X4IZSVTWvurp6ODPyKyxMZ8Hf8Skc/XzIFg0lb5scvrglEcvsMHW2i5C/QcjfJ+QthLwT/gtYva8KPK0+0DRN8Xccsg1+M7nu9NDippnxK1tN/a/HCNlOQv4aIX+XkB8g5J4VgdXV1QIkXCqqqloPdh6269+dvyURu3KnqbMthPwhQv40IX+ZkL9FyDVC7l4WWF9fL6WqqqJpmk1VVdvBzsPWmfHLhYR8AyHfTMi2E/InCbkYe8+1sZ3LAoUzIQlUl4DOAy7raChhT078eSshv4uQbyXkjxLy5wj5q4T8HeFyWWBxcXF+dLE/TdMsmqZZP/J9Ycfvz69LxDJ3mDorIeQPEvKnCPlLhHwvIa9ZcYfXHMJ+x35obHCCpmpKm7vDGvpqovB0ZGF9Ipa529TZNkK+g5C/QMheJ2RVKwIbGhqWwKoG7+2rgtvvA2ht8cKXnxyzRI+l1pwZ/W1jMpa519TZw4TsWUL+CiHbexPwxugIYG2tA7raP4ay3TvhyGfHIfx1XDk5eKHAOPHHxtTE1ftNnT1ByF8kZHvyF71ezc3NeXCLqxWe2fUIvPn2buj0BGDhbBbczR/C8LfnROhtiVhmg6mzBwiZ2OXzsnFmZga6u7vB6XRKoNfrlSPnyvtBF5w6/jP8MPwLHOo+AicHL0D2clZCE7GM1dTZekJ2DyEvgaKiIkilUlBRUQElJSXQ09MDlZWVUF5eDm1tbdDY2CihrS0eOBEm2LzdCtse3wSTwxeBkEOod1y8FkImMloALpdLEcq5m56ehkgkAnV1dVIulwtqa2vl1UVFQ0n46VQW5iazcHb0dzg3dkmCTZ2BiQygq6vLFggECgKBgM3r9SplZWWysbS0VAKFw1zQc2WMXYIf439LpSau5mES2NvbawuHw2sjkciaoaEhazgcVoLBILjdbumuqanpJqAo0Uw6XxL+KwgGg5Z4PF5oGMbaRCIhXuvY2Jjcn3AoVnH9yP9bAwMDMDU1ZSEiezqdtieTSQFUPB6PjI1w6HA4Vg+MRqPyEMlkUlxbMQxDGRkZgfb2dulMZLKmpmb1wP7+fpibm4PZ2VlYXFyEbDYLPp8P/H6/HDf3DVcN7OvrA8MwIJ1Ow/z8vAQKkIDmQCJOqwX+A2JhbcY68gqrAAAAAElFTkSuQmCC',
				dimensions: {
					width: 2520,
					height: 2520,
					aspectRatio: 1,
				},
			},
		},
	};
}

export function avatarJpg(crop?: SanityImage['crop'], hotspot?: SanityImage['hotspot']): SanityImage {
	return {
		crop,
		hotspot,
		asset: {
			metadata: {
				hasAlpha: false,
				isOpaque: true,
				blurHash:
					'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAcABQDASIAAhEBAxEB/8QAGwABAAICAwAAAAAAAAAAAAAAAAIFAwQGBwj/xAAjEAABBAIBAwUAAAAAAAAAAAABAAIDBAURBhMhQQcSIzJS/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A851YJLM8cMLS+R5DWtHkqzzfH8hhXNGQgdEXDY2p8Ltw0eT46zZG4o5QSuc+ruchvN6LPkfv7fkeAtK6sRRJRBlhcWOa5p04dwVv5PKWskWG5L1PYNDtpVgKOPdAcBtEKIP/2Q==',
				dimensions: {
					width: 1786,
					height: 2500,
					aspectRatio: 0.7144,
				},
			},
			mimeType: 'image/jpeg',
			url: 'https://cdn.sanity.io/images/3ik9klvj/production/0b263357f770d5fbb3b4265dc52bf3808950d52b-1786x2500.jpg',
		},
	};
}

export const muxVideo = 'Ojz11wN2KWh7mz2Mgc2nvatL9KwYHP3M';
