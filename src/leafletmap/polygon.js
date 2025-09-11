'use strict';

import { fetchJSON } from '../utils';
import { convertCoordinates } from './geojson';

/**
 * 座標データをL.Polygonオブジェクトに変換
 * @param {{properties: any, coordinates: number[][][]}[]} coordinatesData
 * @param {boolean} worldCopyJump
 * @returns {Promise<Array<{properties: any, polygon: L.Polygon}>}
 */
const createPolygon = (coordinatesData, worldCopyJump) => {
	return coordinatesData.map(({ coordinates, properties }) => ({
		properties,
		polygon: L.polygon(worldCopyJump
			? [
				...coordinates,
				...coordinates.map(points => points.map(point => point.map(([lat, lng]) => [lat, lng - 360]))),
				...coordinates.map(points => points.map(point => point.map(([lat, lng]) => [lat, lng + 360])))
			]
			: coordinates
		)
	}));
};

/**
 * GeoJsonファイルを読み込み、L.Polygonオブジェクトを作成
 * @param {string} url
 * @param {boolean} worldCopyJump
 * @returns {Promise<Array<{properties: any, polygon: L.Polygon}>}
 */
export const loadPolygon = async (url, isWorldCopyJump) => {
	const geojson = await fetchJSON(url, { cache: 'force-cache' });
	const coordinatesData = convertCoordinates(geojson);
	return createPolygon(coordinatesData, isWorldCopyJump);
};
