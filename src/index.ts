'use strict';

import { fetchJSON, getURLParam, getElementById, getCookie, clearCookie } from 'utils';
import { getMapData, setMapData } from 'mapData';
import { loadGeoJSON } from 'geoJSONData';
import { leafletMapElement, initLeafletMap } from 'leafletMap';
import { renderTooltipWithButton } from 'tooltip/renderTooltipWithButton';
import { updateLegend } from 'legend';
import { showErrorDialog } from 'dialog/errorDialog';
import { initSaveButton } from 'saveButton';

const main = async () => {
	const userName = getCookie('user_name');
	const password = getCookie('password');
	if (userName && password) {
		try {
			setMapData(await fetchJSON(`${process.env.API_URL}?function=account_map_get&user_name=${userName}&password=${password}`));
			document.body.classList.add('login');
		} catch(e) {
			clearCookie('user_name');
			clearCookie('password');
			showErrorDialog({
				message: 'ログインに失敗しました。トップページに戻ります。',
				description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
				onClose: () => { location.href = '/'; }
			});
			return;
		}
	} else {
		try {
			const type = getURLParam('type') ?? 'city';
			setMapData(await fetchJSON(`${process.env.API_URL}?function=map_get_empty&type=${type}`));
		} catch(e) {
			showErrorDialog({
				message: '地図の取得に失敗しました。トップページに戻ります。',
				description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
				onClose: () => { location.href = '/'; }
			});
			return;
		}
	}

	try {
		await loadGeoJSON();
		await initLeafletMap({
			tooltipRenderer: renderTooltipWithButton
		});
		leafletMapElement.classList.remove('loading');

		const mapData = getMapData();
		getElementById('map_title').innerText = mapData.title;
		updateLegend();

		if (mapData.id) {
			initSaveButton();
		}
	} catch(e) {
		showErrorDialog({
			message: 'エラーが発生しました。トップページに戻ります。',
			description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
			onClose: () => { location.href = '/'; }
		});
	}
};

await main();
