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

// DEPLOY_PATHが指定されている場合、.から始まるファイル以外を削除
const cleanDir = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await fs.rm(entryPath, { recursive: true, force: true });
    } else {
      await fs.unlink(entryPath);
    }
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
	const distDir = path.resolve(process.env.DEPLOY_PATH ?? 'dist');
	const publicDir = path.resolve('public');

	await fs.ensureDir(distDir);
	if (process.env.DEPLOY_PATH) {
		await cleanDir(distDir);
	} else {
		await fs.emptyDir(distDir);
	}
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
		await fs.remove(path.join(distDir, 'bundle.js.map'));
	} catch {
		// no error handling
	}
}
