import { defineCliConfig } from '@sanity/cli';
import {projectId, dataset} from './env.ts'

export default defineCliConfig({
  api: {
    dataset,
    projectId,
  },
  reactStrictMode: false,
  reactCompiler: { target: '19' },
	deployment: {
		appId: 'erlicdly9quywur4sf7t7ifv'
	},
  graphql: [],
  vite(viteConfig) {
    const exclude = Array.isArray(viteConfig.esbuild?.exclude) ? viteConfig.esbuild.exclude : [];
    const exs = ['react-is', 'prop-types'];
    return {
      ...viteConfig,
      build: {
        ...viteConfig.build,
        target: 'esnext',
      },
      esbuild: {
        ...viteConfig.esbuild,
        exclude: [...exclude.filter(item => !exs.includes(item)), ...exs],
        target: 'esnext',
        loader: 'tsx',
      },
    };
  },
});
