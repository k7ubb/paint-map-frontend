'use strict';

import { fetchJSON, getURLParam, getCookie } from 'utils';
import { getMapData, setMapData } from 'mapData';
import { loadGeoJSON } from 'geoJSONData';
import { leafletMapElement, initLeafletMap } from 'leafletMap';
import { renderTooltipWithButton } from 'tooltip/renderTooltipWithButton';
import { updateLegend } from 'legend';

const main = async () => {
	try {
		const userName = getCookie('user_name');
		const password = getCookie('password');
		if (userName && password) {
			setMapData(await fetchJSON(`${process.env.API_URL}?function=account_map_get&user_name=${userName}&password=${password}`));
			document.body.classList.add('login');
		} else {
			const type = getURLParam('type') ?? 'city';
			setMapData(await fetchJSON(`${process.env.API_URL}?function=map_get_empty&type=${type}`));
		}

		await loadGeoJSON();
		leafletMapElement.classList.remove('loading');
		const mapData = getMapData();
		(document.getElementById('map_title') as HTMLElement).innerText = mapData.title;
		await initLeafletMap({
			tooltipRenderer: renderTooltipWithButton
		});
		updateLegend();
	} catch(e) {
		console.error(e);
	}
};

await main();
