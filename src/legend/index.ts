'use strict';

import { getMapData } from 'mapData';
import { getFillGeoJSON } from 'geoJSONData';

const legendElementNullable = document.getElementById('legend');
if (!(legendElementNullable instanceof HTMLElement)) {
	throw new Error('Element \'error_dialog\' does not exist');
}
const legendElement: HTMLElement = legendElementNullable;

export const updateLegend = () => {
	const mapData = getMapData();
	const fillGeoJSON = getFillGeoJSON();

	const count = Array(mapData.legend.length).fill(0);
	const total = fillGeoJSON.features.length;
	for (let citycode in mapData.data) {
		count[mapData.data[citycode]]++;
	}
	count[0] += total - count.reduce((a, b) => a + b);

	let score;
	if (mapData.score_format === 1) { score = count.reduce((a, b, i) => a + b * i, 0); }
	if (mapData.score_format === 2) { score = count.reduce((a, b, i) => i ? a + b : a, 0); }

	let result = mapData.score_format ? `score: <b>${score}</b><br>` : '';
	for (let i = mapData.legend.length - 1; i >= 0; i--){
		result += `<span class="color" style="background: ${mapData.legend[i].color}"></span>${mapData.legend[i].title} × ${count[i]}<br>`;
	}
	if (mapData.non_zero_legend) {
		result += `<span class="color"></span> ${(total - count[0])} / ${total} ${mapData.non_zero_legend}`;
	}

	legendElement.innerHTML = result;
};
