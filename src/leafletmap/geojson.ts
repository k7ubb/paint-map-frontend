'use strict';

import type { FeatureCollection, Feature, Polygon, MultiPolygon, Position } from 'geojson';
import type { LatLngTuple } from 'leaflet';

/**
 * [lng, lat] の配列を [lat, lng] の配列に変換
 */
const permutateCoordinates = (coordinates: Position[][]) => {
	return coordinates.map(points => points.map(point => [point[1], point[0]])) as LatLngTuple[][];
};

export type PolygonProperty = {
	code: string;
	name: string;
	fullname?: string;	
};

export type CoordinateData = {
	properties: PolygonProperty;
	coordinates: LatLngTuple[][][];
};

export const convertCoordinates = (geojson: FeatureCollection): CoordinateData[] => {
	if (!geojson || geojson.type !== 'FeatureCollection') {
		console.error('Invalid GeoJSON data: Expected FeatureCollection');
		return [];
	}
	const features = geojson.features
		.filter(feature => {
			const type = feature.geometry.type;
			return type === 'MultiPolygon' || type === 'Polygon';
		}) as Feature<Polygon | MultiPolygon, PolygonProperty>[];

	return features.map(({ properties, geometry }) => ({
		properties,
		coordinates: geometry.type === 'MultiPolygon'
			? geometry.coordinates.map(permutateCoordinates)
			: [permutateCoordinates(geometry.coordinates)]
	}));
};
