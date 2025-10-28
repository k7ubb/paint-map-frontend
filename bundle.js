import path from 'path';
import fs from 'fs-extra';
import { glob } from 'glob';
import { build } from 'esbuild';
import { config } from 'dotenv';
import { replaceInFile } from 'replace-in-file';

const isDev = process.argv.includes('--dev');
config({ path: '.env' });

const bundle = async () => {
	const distDir = path.resolve('dist');
	const publicDir = path.resolve('public');
	
	await fs.emptyDir(distDir);
	await fs.copy(publicDir, distDir);

	await replaceInFile({
		files: path.join(distDir, '**/*.html'),
		from: /(src|href)="(?!https?:\/\/)(.+?\.(js|css))"/g,
		to: `$1="$2?ver=${Date.now().toString(36)}"`
	});

	const entryPoints = await glob('src/*.{ts,tsx,js,jsx}');
	const define = Object.keys(process.env).reduce((acc, key) => ({
		...acc,
		[`process.env.${key}`]: JSON.stringify(process.env[key])
	}), {});

	await build({
		bundle: true,
		format: 'esm',
		platform: 'browser',
		entryPoints,
		define,
		outdir: path.join(distDir, 'src'),
		sourcemap: isDev ? 'inline' : false,
	});
	console.log('Bundle completed');
};

if (isDev) {
	try {
		await bundle();
	} catch (e) {
		console.log('Bundle error:', e);
	}

	const watchDirs = ['public', 'src'];
	watchDirs.forEach(dir => {
		fs.watch(dir, { recursive: true }, async (eventType, filename) => {
			if (filename) {
				console.log(`File ${eventType}: ${filename}`);
				try {
					await bundle();
				} catch (error) {
					console.log('Bundle error:', error);
				}
			}
		});
	});
} else {
	try {
		await bundle();
		process.exit(0);
	} catch(e) {
		console.error(e);
		process.exit(1);
	}
}
