'use strict';

import { fetchJSON } from '../utils';
import { convertCoordinates, type CoordinateData } from './geojson';

const L = window.L as typeof import('leaflet');

const moveCoordinates = (coordinates: L.LatLngTuple[][][], latDiff: number, lngDiff: number): L.LatLngTuple[][][] => {
	return coordinates.map(points => points.map(point => point.map(([lat, lng]) => [lat + latDiff, lng + lngDiff])));
};

const createPolygon = (coordinatesData: CoordinateData[], worldCopyJump?: boolean) => {
	return coordinatesData.map(({ coordinates, properties }) => ({
		properties,
		polygon: L.polygon(worldCopyJump
			? [
				...coordinates,
				...moveCoordinates(coordinates, 0, -360),
				...moveCoordinates(coordinates, 0, +360)
			]
			: coordinates
		)
	}));
};

export const loadPolygon = async (url: string, isWorldCopyJump?: boolean) => {
	const geojson = await fetchJSON(url, { cache: 'force-cache' });
	const coordinatesData = convertCoordinates(geojson);
	return createPolygon(coordinatesData, isWorldCopyJump);
};
