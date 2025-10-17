'use strict';

import { getMapData } from 'mapData';
import { leafletMapElement } from 'leafletMap';
import type { PolygonProperty } from 'leafletMap/polygon';
import type { TooltipRenderer } from 'tooltip/TooltipRenderer';

export const renderTooltipWithLegend = ((properties?: PolygonProperty, x?: number, y?: number) => {
	const mapData = getMapData();
	const tooltip = document.getElementById('tooltip') as HTMLElement;
	if (!properties || typeof x !== 'number' || typeof y !== 'number') {
		tooltip.style.display = '';
		return;
	}
	(document.getElementById('tooltip_cityname') as HTMLElement).innerHTML = properties.name;

	tooltip.style.display = 'block';
	// 幅・高さ計算のために、一瞬だけ左上に配置する
	tooltip.style.top = '0';
	tooltip.style.left = '0';
	tooltip.style.top = `${Math.min(y, leafletMapElement.clientHeight - tooltip.clientHeight - 4)}px`;
	tooltip.style.left = `${Math.min(x, leafletMapElement.clientWidth - tooltip.clientWidth - 4)}px`;

	const tooltipLegend = document.getElementById('tooltip_legend') as HTMLElement;
	while (tooltipLegend.firstChild) {
		tooltipLegend.firstChild.remove();
	}

	const legend = mapData.legend[mapData.data[properties.code] ?? 0];
	const color = document.createElement('span');
	color.className = 'color';
	color.style.backgroundColor = legend.color;
	const text = document.createTextNode(legend.title);
	tooltipLegend.append(color, text);
}) as TooltipRenderer;
