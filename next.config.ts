import { breakpoints } from './src/ui/_lib/breakpoints';

/** @type {import('next').NextConfig} */
const nextConfig = {
	devIndicators: false,
	swcMinify: true,
	reactStrictMode: true,
	poweredByHeader: false,
	optimizeFonts: true,
	// TODO: Re-enable to fail builds on lint/type errors. May surface existing issues.
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},

	// */

	// transpilePackages: [
	//   'sanity',
	// ],

	images: {
		deviceSizes: Object.values(breakpoints).map(breakpoint => breakpoint.pixel),
		imageSizes: Object.values(breakpoints).map(breakpoint => breakpoint.pixel),
		domains: ['cdn.sanity.io', 'image.mux.com'],

		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

		remotePatterns: [
			{ hostname: 'cdn.sanity.io' },
			{ hostname: 'election-api.goodparty.org' },
			{ hostname: 'election-api-dev.goodparty.org' },
		],
	},
	experimental: {
		// ppr: true,
		taint: false,
		// optimizeServerReact: true,
		appDocumentPreloading: false,
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: {
				loader: '@svgr/webpack',
				options: {
					svgoConfig: {
						plugins: [
							{
								name: 'mergePaths',
								active: false,
							},
							{
								name: 'cleanupAttrs',
								active: false,
							},
							{
								name: 'removeViewBox',
								active: false,
							},
						],
					},
				},
			},
		});
		//   config.resolve.alias = {
		//     ...config.resolve.alias,
		//     'sanity/_internal': require.resolve('sanity/_internal'),
		//     'sanity/_internalBrowser': require.resolve('sanity/_internalBrowser'),
		//     'sanity/cli': require.resolve('sanity/cli'),
		//     'sanity/desk': require.resolve('sanity/desk'),
		//     'sanity/router': require.resolve('sanity/router'),
		//     'sanity/structure': require.resolve('sanity/structure'),
		//     sanity: require.resolve('sanity'),
		//   }
		return config;
	},
};

export default nextConfig;
