'use strict';

import type { FeatureCollection, Feature, Polygon, MultiPolygon, Position } from 'geojson';
import type { LatLngTuple } from 'leaflet';

const L = window.L as typeof import('leaflet');

export type PolygonProperty = {
	code: string;
	name: string;
	fullname?: string;	
};

/**
 * [lng, lat] の配列を [lat, lng] の配列に変換
 */
const permutateCoordinates = (coordinates: Position[][]) => {
	return coordinates.map(points => points.map(point => [point[1], point[0]])) as LatLngTuple[][];
};

const convertCoordinates = (geojson: FeatureCollection): {
	properties: PolygonProperty;
	coordinates: LatLngTuple[][][];
}[] => {
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

const moveCoordinates = (coordinates: L.LatLngTuple[][][], latDiff: number, lngDiff: number): L.LatLngTuple[][][] => {
	return coordinates.map(points => points.map(point => point.map(([lat, lng]) => [lat + latDiff, lng + lngDiff])));
};

export const createPolygon = (geojson: GeoJSON.FeatureCollection, isWorldCopyJump?: boolean) => {
	const coordinatesData = geojson ? convertCoordinates(geojson) : [];
	return coordinatesData.map(({ coordinates, properties }) => ({
		properties,
		polygon: L.polygon(isWorldCopyJump
			? [
				...coordinates,
				...moveCoordinates(coordinates, 0, -360),
				...moveCoordinates(coordinates, 0, 360)
			]
			: coordinates
		)
	}));
};
