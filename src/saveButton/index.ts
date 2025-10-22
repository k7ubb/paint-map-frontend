import { fetchJSON, getElementById, getCookie } from 'utils';
import { getMapData, type MapData } from 'mapData';
import { showErrorDialog } from 'dialog/errorDialog';
import { showInfoDialog } from 'dialog/infoDialog';

export const initSaveButton = () => {
	const saveButton = getElementById('map_save_button');
	if (!(saveButton instanceof HTMLButtonElement)) {
		throw new Error('Element \'map_save_button\' is not a button');
	}

	saveButton.disabled = false;
	saveButton.addEventListener('click', async () => {
		try {
			const mapData = getMapData();
			saveButton.disabled = true;
			saveButton.classList.add('loading');

			await saveMap(mapData);

			showInfoDialog({ message: '地図を保存しました。' });
		} catch(e) {
			showErrorDialog({
				message: '地図の保存に失敗しました。',
				description: 'Error: ' + (e instanceof Error ? e.message : String(e)),
			});
		} finally {
			saveButton.disabled = false;
			saveButton.classList.remove('loading');
		}
	});
};

const saveMap = async (mapData: MapData) => {
	const params = new URLSearchParams({
		function: 'map_save',
		user_name: getCookie('user_name') ?? '',
		password: getCookie('password') ?? '',
		map: JSON.stringify({
			id: mapData.id ?? '',
			type: mapData.type,
			title: mapData.title,
			description: mapData.description,
			legend: mapData.legend,
			score_format: mapData.score_format,
			data: mapData.data,
			share_level: mapData.share_level,
			...(mapData.non_zero_legend && { non_zero_legend: mapData.non_zero_legend })
		})
	});
	const result = await fetchJSON(process.env.API_URL!, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: params.toString()
	});
	if (!result.succeed) {
		throw new Error(result.error ?? 'Failed to save map');
	}
};
