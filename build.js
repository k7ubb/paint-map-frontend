import { build, context } from 'esbuild';
import { config } from 'dotenv';

const isDev = process.argv.includes('--dev');
config({ path: isDev ? '.env.development' : '.env.production' });

const buildOptions = {
	entryPoints: ['src/main.js'],
	bundle: true,
	format: 'esm',
	outfile: 'public/bundle.js',
	platform: 'browser',
	sourcemap: false,
	minify: true,
	define: {
		'process.env.API_URL': JSON.stringify(process.env.API_URL)
	}
};

if (isDev) {
	const ctx = await context(buildOptions);
	await ctx.watch();
} else {
	await build(buildOptions);
}
