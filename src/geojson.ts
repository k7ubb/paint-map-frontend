'use strict';

import { fetchJSON } from './utils';
import { getMapData } from "./mapdata";

let fillGeoJSON: GeoJSON.FeatureCollection | null = null;
let outlineGeoJSON: GeoJSON.FeatureCollection | null = null;

export const getFillGeoJSON = () => {
	if (!fillGeoJSON) { throw new Error('fillGeoJSON not loaded'); }
	return fillGeoJSON;
};

export const getOutlineGeoJSON = () => {
	return outlineGeoJSON;
};

export const loadGeoJSON = async () => {
	const mapData = getMapData();

	[fillGeoJSON, outlineGeoJSON] = await Promise.all([
		fetchJSON(mapData.fillLayer, { cache: 'force-cache' }),
		mapData.outlineLayer
			? fetchJSON(mapData.outlineLayer, { cache: 'force-cache' })
			: Promise.resolve(null)
	]);
};
