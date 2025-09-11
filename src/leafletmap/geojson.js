'use strict';

/**
 * [lng, lat] の配列を [lat, lng] の配列に変換
 * @param {number[][][]} coordinates - 座標の配列（多角形の境界線）
 * @returns {number[][][]} 変換された座標の配列
 */
const permutateCoordinates = (coordinates) => {
	return coordinates.map(points => points.map(point => [point[1], point[0]]));
};


/**
 * GeoJSONを読み込み、Leaflet用の座標データに変換
 * @param {Object} geojson
 * @param {Array<Object>} geojson.features
 * @param {Object} geojson.features[].properties
 * @param {Object} geojson.features[].geometry
 * @returns {Array<{properties: Object, coordinates: number[][][]}>}
 */
export const convertCoordinates = (geojson) => {
	if (!geojson || !Array.isArray(geojson?.features)) {
		console.error('Invalid GeoJSON data');
		return [];
	}
	return geojson.features
		.filter(feature => {
			const type = feature?.geometry?.type;
			return type === 'MultiPolygon' || type === 'Polygon';
		})
		.map(({ properties, geometry }) => ({
			properties,
			coordinates: geometry.type === 'MultiPolygon'
				? geometry.coordinates.map(permutateCoordinates)
				: [permutateCoordinates(geometry.coordinates)]
		}));
};
