'use strict';

import { fetchJSON, getURLParam } from 'utils';
import { getMapData, setMapData } from 'mapData';
import { loadGeoJSON } from 'geoJSONData';
import { leafletMapElement, initLeafletMap } from 'leafletMap';
import { renderTooltipWithButton } from 'tooltip/renderTooltipWithButton';

const main = async () => {
	try {
		const type = getURLParam('type') ?? 'city';
		setMapData(await fetchJSON(`${process.env.API_URL}?function=map_get_empty&type=${type}`));

		await loadGeoJSON();
		leafletMapElement.classList.remove('loading');
		const mapData = getMapData();
		(document.getElementById('map_title') as HTMLElement).innerText = mapData.title;
		await initLeafletMap({
			controllerPosition: 'topright',
			tooltipRenderer: renderTooltipWithButton
		});
	} catch(e) {
		console.error(e);
	}
};

await main();
