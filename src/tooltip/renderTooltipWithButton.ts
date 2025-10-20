'use strict';

import { getElementById } from 'utils';
import { getMapData, updateMapData } from 'mapData';
import { leafletMapElement, updateMap } from 'leafletMap';
import type { PolygonProperty } from 'leafletMap/polygon';
import type { TooltipRenderer } from 'tooltip/TooltipRenderer';

export const renderTooltipWithButton = ((properties?: PolygonProperty, x?: number, y?: number, cleanup?: any) => {
	const mapData = getMapData();
	const tooltip = getElementById('tooltip');
	if (!properties || typeof x !== 'number' || typeof y !== 'number' || !cleanup) {
		tooltip.style.display = '';
		return;
	}
	getElementById('tooltip_cityname').innerHTML = properties.name;

	tooltip.style.display = 'block';
	// 幅・高さ計算のために、一瞬だけ左上に配置する
	tooltip.style.top = '0';
	tooltip.style.left = '0';
	tooltip.style.top = `${Math.min(y, leafletMapElement.clientHeight - tooltip.clientHeight - 4)}px`;
	tooltip.style.left = `${Math.min(x, leafletMapElement.clientWidth - tooltip.clientWidth - 4)}px`;

	const tooltipButtons = getElementById('tooltip_buttons');
	while (tooltipButtons.firstChild) {
		tooltipButtons.firstChild.remove();
	}

	for (let i = mapData.legend.length - 1; i >= 0; i--) {
		const a = document.createElement('a');
		a.style.borderColor = (i === (mapData.data[properties.code] ?? 0)) ? '#fcc' : '';
		a.style.background = mapData.legend[i].color;
		tooltipButtons.append(a);
		a.addEventListener('click', () => {
			updateMapData({[properties.code]: i});
			updateMap({[properties.code]: i});
			cleanup?.();
		});
	}
}) as TooltipRenderer;
