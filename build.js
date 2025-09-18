import { build } from 'esbuild';
import { config } from 'dotenv';
import { replaceInFile } from 'replace-in-file';
import fs from 'fs-extra';
import path from 'path';

const isDev = process.argv.includes('--dev');
config({ path: '.env' });

const buildOptions = {
	bundle: true,
	format: 'esm',
	platform: 'browser',
	minify: true,
	define: {
		'process.env.API_URL': JSON.stringify(process.env.API_URL)
	}
};

const performBuild = async () => {
	try {
		const distDir = path.resolve(process.env.DEPLOY_PATH ?? 'dist');
		const publicDir = path.resolve('public');
		
		await fs.ensureDir(distDir);
		if (process.env.DEPLOY_PATH) {
			// DEPLOY_PATHが指定されている場合、.から始まるファイルは残す
			const entries = await fs.readdir(distDir, { withFileTypes: true });
			for (const entry of entries) {
				if (entry.name.startsWith('.')) { continue; }
				const entryPath = path.join(distDir, entry.name);
				if (entry.isDirectory()) {
					await fs.rmdir(entryPath, { recursive: true });
				} else {
					await fs.unlink(entryPath);
				}
			}
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
			entryPoints: ['src/main.ts'],
			outfile: (process.env.DEPLOY_PATH ?? 'dist') + '/bundle.js'
		});
		await fs.remove(path.join(distDir, 'bundle.js.map'));
		console.log('✅ Build completed successfully');
	} catch (error) {
		console.error('❌ Build failed:', error);
	}
}
if (isDev) {
	console.log('🚀 Starting development mode...');
	await performBuild();

	const watchDirs = ['src', 'public'];
	watchDirs.forEach(dir => {
		fs.watch(dir, { recursive: true }, async (eventType, filename) => {
			if (filename) {
				console.log(`🔄 Public file ${eventType}: ${filename}`);
				await performBuild();
			}
		});
	});
} else {
	try {
		await performBuild();
		process.exit(0);
	} catch {
		process.exit(1);
	}
}
