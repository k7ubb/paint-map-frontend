'use strict';

import { fetchJSON, getURLParam, getElementById } from 'utils';
import { getMapData, setMapData } from 'mapData';
import { loadGeoJSON } from 'geoJSONData';
import { leafletMapElement, initLeafletMap } from 'leafletMap';
import { renderTooltipWithLegend } from 'tooltip/renderTooltipWithLegend';
import { updateLegend } from 'legend';
import { showErrorDialog } from 'dialog/errorDialog';

const main = async () => {
	try {
		const id = getURLParam('id');
		if (!id) {
			throw new Error('id is required');
		}
		setMapData(await fetchJSON(`${process.env.API_URL}?function=shared_map_get&id=${id}`));
	} catch(e) {
		showErrorDialog({
			message: '地図の取得に失敗しました。トップページに戻ります。',
			description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
			onClose: () => { location.href = '/'; }
		});
		return;
	}

	try {
		await loadGeoJSON();
		leafletMapElement.classList.remove('loading');
		const mapData = getMapData();
		document.title = mapData.title + ' - ペイントマップ';
		getElementById('map_title').innerText = mapData.title;
		getElementById('description').innerText = mapData.description;
		await initLeafletMap({
			tooltipRenderer: renderTooltipWithLegend
		});
		updateLegend();
	} catch(e) {
		showErrorDialog({
			message: 'エラーが発生しました。トップページに戻ります。',
			description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
			onClose: () => { location.href = '/'; }
		});
	}
};

await main();
