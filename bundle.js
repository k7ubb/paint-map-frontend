import path from 'path';
import fs from 'fs-extra';

const isDev = process.argv.includes('--dev');

const bundle = async () => {
	const distDir = path.resolve('dist');
	const publicDir = path.resolve('public');
	
	await fs.emptyDir(distDir);
	await fs.copy(publicDir, distDir);
	console.log('Bundle completed');
};

if (isDev) {
	try {
		await bundle();
	} catch (e) {
		console.log('Bundle error:', e);
	}

	const watchDirs = ['public'];
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
