'use strict';

import { fetchJSON } from './utils';
import { updateLegend } from './legend';

type MapData = {
	type: string,
	title: string,
	description: string,
	data: {
		[code: string]: number
	},
	legend: {
		title: string,
		color: string
	}[],
	score_format: number,
	share_level: number,
	non_zero_legend?: string,
	last_update: number,
	fillLayer: string,
	outlineLayer?: string,
	position: {
		lat: number,
		lng: number,
		zoom: number
	},
	source: string,
	maxZoom?: number,
	minZoom?: number,
	worldCopyJump?: 0 | 1,
};

let mapData: MapData | undefined;

export const getMapData = () => {
	if (!mapData) { throw new Error("mapData is not loaded"); }
	return mapData;
};

export const loadMapData = async () => {
	const state = await fetchJSON(`${process.env.API_URL}?function=account_getstate`);
	if (state.login) {
		mapData = await fetchJSON(`${process.env.API_URL}?function=map_get&id=${state.id}`);
	} else {
		const type = new URLSearchParams(location.search).get('type') ?? 'city';
		mapData = await fetchJSON(`${process.env.API_URL}?function=map_generate&type=${type}`);
	}
};

export const updateMapData = (data: { [code: string]: number }) => {
	if (!mapData) { return; }
	for (const [ code, value ] of Object.entries(data)) {
		mapData.data[code] = value;
	}
	updateLegend();
};
