'use strict';

import { getMapData, updateMapData } from './mapdata';
import { leafletMapElement, updateMap } from './leafletmap';
import type { PolygonProperty } from './leafletmap/geojson';

export function updateTooltip(clear: any, properties: PolygonProperty, x: number, y: number): void;
export function updateTooltip(): void;

export function updateTooltip (clear?: any, properties?: PolygonProperty, x?: number, y?: number) {
	const mapData = getMapData();
	const tooltip = document.getElementById('tooltip') as HTMLElement;
  if (!clear || !properties || typeof x !== 'number' || typeof y !== 'number') {
		tooltip.style.display = '';
		return;
	}
	(document.getElementById('tooltip_cityname') as HTMLElement).innerHTML = properties.name;

	tooltip.style.display = 'block';
	// 幅・高さ計算のために、一瞬だけ左上に配置する
	tooltip.style.top = "0";
	tooltip.style.left = "0";

	tooltip.style.top = `${Math.min(y, leafletMapElement.clientHeight - tooltip.clientHeight - 4)}px`;
	tooltip.style.left = `${Math.min(x, leafletMapElement.clientWidth - tooltip.clientWidth - 4)}px`;
	const tooltip_buttons = document.getElementById('tooltip_buttons') as HTMLElement;
	while (tooltip_buttons.firstChild) {
		tooltip_buttons.firstChild.remove();
	}
	for (let i = mapData.legend.length - 1; i >= 0; i--) {
		const a = document.createElement('a');
		a.style.borderColor = (i === (mapData.data[properties.code] ?? 0)) ? '#fcc' : '';
		a.style.background = mapData.legend[i].color;
		tooltip_buttons.append(a);
		a.addEventListener('click', () => {
			updateMapData({[properties.code]: i});
			updateMap({[properties.code]: i});
			clear();
		});
	}
};
