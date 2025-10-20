'use strict';

import { updateLegend } from 'legend';

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
	attribution: string,
	maxZoom?: number,
	minZoom?: number,
	worldCopyJump?: boolean,
};

let mapData: MapData | undefined;

export const setMapData = (data: any) => {
	if (!data || typeof data !== 'object' || !data.title) {
		throw new Error(data?.error ?? 'Invalid map data'); 
	}
	mapData = data;
};

export const getMapData = () => {
	if (!mapData) {
		throw new Error('mapData is not loaded');
	}
	return mapData;
};

export const updateMapData = (data: { [code: string]: number }) => {
	if (!mapData) {
		throw new Error('mapData is not loaded');
	}
	for (const [ code, value ] of Object.entries(data)) {
		mapData.data[code] = value;
	}
	updateLegend();
};
