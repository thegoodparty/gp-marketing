import { breakpoints } from './src/ui/_lib/breakpoints';

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
					{ key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
					},
				],
			},
		];
	},
	swcMinify: true,
	reactStrictMode: false,
	poweredByHeader: false,
	optimizeFonts: true,
	eslint: {
		ignoreDuringBuilds: true, // !isDev,
	},
	typescript: {
		ignoreBuildErrors: true, // !isDev,
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

		remotePatterns: [{ hostname: 'cdn.sanity.io' }],
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
