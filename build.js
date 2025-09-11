import { build, context } from 'esbuild';
import { config } from 'dotenv';
import fs from 'fs-extra';
import path from 'path';

const isDev = process.argv.includes('--dev');
config({ path: isDev ? '.env.development' : '.env.production' });

const buildOptions = {
	entryPoints: ['src/main.js'],
	bundle: true,
	format: 'esm',
	platform: 'browser',
	define: {
		'process.env.API_URL': JSON.stringify(process.env.API_URL)
	}
};

if (isDev) {
	const ctx = await context({
		...buildOptions,
		sourcemap: true,
		outfile: 'public/bundle.js'
	});
	await ctx.watch();
} else {
	const distDir = path.resolve('dist');
	const publicDir = path.resolve('public');

	await fs.ensureDir(distDir);
	await fs.emptyDir(distDir);
	await fs.copy(publicDir, distDir);

	const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').substring(0, 15);

	await build({
		...buildOptions,
		minify: true,
		outfile: 'dist/bundle.js'
	});
}
