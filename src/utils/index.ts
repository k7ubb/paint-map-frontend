'use strict';

export const fetchJSON = async (url: string, options?: RequestInit) =>{
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error(`Failed to fetch JSON from ${url}: ${response.statusText}`);
	}
	try {
		return await response.json();
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		throw new Error(`Failed to parse JSON from ${url}: ${message}`);
	}
};


export const getURLParam = (name: string): string | null => {
	const params = new URLSearchParams(window.location.search);
	return params.get(name);
};
