import { build, context } from 'esbuild';
import { config } from 'dotenv';
import { replaceInFile } from 'replace-in-file';
import fs from 'fs-extra';
import path from 'path';

const isDev = process.argv.includes('--dev');
config({ path: isDev ? '.env.development' : '.env.production' });

const buildOptions = {
	entryPoints: ['src/main.ts'],
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

	const indexPath = path.join(distDir, 'index.shtml');
	await replaceInFile({
		files: indexPath,
		from: /<!-- BUILD_TIMESTAMP -->/g,
		to: timestamp,
	});
	await build({
		...buildOptions,
		minify: true,
		outfile: 'dist/bundle.js'
	});

	try {
		await fs.remove(path.resolve('dist', 'bundle.js.map'));
	} catch {
		// no error handling
	}
}
