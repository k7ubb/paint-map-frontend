'use strict';

import { getMapData, loadMapData } from './mapdata';
import { loadGeoJSON } from './geojson';
import { leafletMapElement, initLeafletMap } from './leafletmap';

const main = async () => {
	await loadMapData();
	await loadGeoJSON();
	leafletMapElement?.classList.remove('loading');
	const mapData = getMapData();
	(document.getElementById('map_title') as HTMLElement).innerText = mapData.title;
	await initLeafletMap();
};

await main();
