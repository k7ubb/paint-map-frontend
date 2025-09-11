'use strict';

import { getMapData } from './mapdata';
import { leafletMapElement } from './leafletmap';

/**
 * @param {{
 *   code: string;
 *   name: string;
 *   fullname?: string;
 * } | undefined} properties 
 * @param {number} x 
 * @param {number} y 
 */
export const updateTooltip = (properties, x, y) => {
	const mapData = getMapData();
	const tooltip = document.getElementById('tooltip');
	if (!properties) {
		tooltip.style.display = '';
		return;
	}
	document.getElementById('tooltip_cityname').innerHTML = properties.name;

	tooltip.style.display = 'block';
	// 幅・高さ計算のために、一瞬だけ左上に配置する
	tooltip.style.top = 0;
	tooltip.style.left = 0;

	tooltip.style.top = `${Math.min(y, leafletMapElement.clientHeight - tooltip.clientHeight - 4)}px`;
	tooltip.style.left = `${Math.min(x, leafletMapElement.clientWidth - tooltip.clientWidth - 4)}px`;
	const tooltip_buttons = document.getElementById('tooltip_buttons');
	while (tooltip_buttons.firstChild) {
		tooltip_buttons.firstChild.remove();
	}
	for (let i = mapData.legend.length - 1; i >= 0; i--) {
		const a = document.createElement('a');
		a.style.borderColor = (i === (mapData.data[properties.code] ?? 0)) ? '#fcc' : '';
		a.style.background = mapData.legend[i].color;
		tooltip_buttons.append(a);
	}
};
