'use strict';

export const fetchJSON = async (url: string, init?: RequestInit) =>{
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
