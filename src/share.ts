'use strict';

import { fetchJSON, getURLParam } from 'utils';
import { getMapData, setMapData } from 'mapData';
import { loadGeoJSON } from 'geoJSONData';
import { leafletMapElement, initLeafletMap } from 'leafletMap';
import { renderTooltipWithLegend } from 'tooltip/renderTooltipWithLegend';
import { updateLegend } from 'legend';

const main = async () => {
	try {
		const id = getURLParam('id');
		if (!id) {
			throw new Error('id is required');
		}
		setMapData(await fetchJSON(`${process.env.API_URL}?function=shared_map_get&id=${id}`));
		await loadGeoJSON();
		leafletMapElement.classList.remove('loading');
		const mapData = getMapData();
		document.title = mapData.title + ' - ペイントマップ';
		(document.getElementById('map_title') as HTMLElement).innerText = mapData.title;
		(document.getElementById('description') as HTMLElement).innerText = mapData.description;
		await initLeafletMap({
			tooltipRenderer: renderTooltipWithLegend
		});
		updateLegend();
	} catch(e) {
		console.error(e);
	}
};

await main();
