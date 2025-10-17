'use strict';

import { fetchJSON } from 'utils';
import { getMapData } from 'mapData';

let fillGeoJSON: GeoJSON.FeatureCollection | undefined;
let outlineGeoJSON: GeoJSON.FeatureCollection | null | undefined;

export const getFillGeoJSON = () => {
	if (fillGeoJSON === undefined) { throw new Error('geoJSON is not loaded'); }
	return fillGeoJSON;
};

export const getOutlineGeoJSON = () => {
	if (outlineGeoJSON === undefined) { throw new Error('geoJSON is not loaded'); }
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
