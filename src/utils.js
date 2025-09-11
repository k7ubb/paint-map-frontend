'use strict';

/**
 * @param {string} url
 * @param {RequestInfo | undefined} init
 * @returns {Promise<any>} パースされたJSONオブジェクト
 */
export const fetchJSON = async (url, init) =>{
	const response = await fetch(url, init);
	if (!response.ok) {
		throw new Error(`Failed to fetch JSON from ${url}: ${response.statusText}`);
	}
	try {
		return await response.json();
	} catch (e) {
		throw new Error(`Failed to parse JSON from ${url}: ${e.message}`);
	}
};
