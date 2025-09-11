'use strict';

import { getMapData, loadMapData } from './mapdata';
import { leafletMapElement, initLeafletMap } from './leafletmap';

const main = async () => {
	await loadMapData();
	leafletMapElement.classList.remove('loading');
	const mapData = getMapData();
	document.getElementById('map_title').innerHTML = mapData.title;
	await initLeafletMap();
};

await main();
