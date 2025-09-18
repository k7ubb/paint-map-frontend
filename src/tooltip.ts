'use strict';

import { getMapData, updateMapData } from './mapdata';
import { leafletMapElement, updateMap } from './leafletmap';
import type { PolygonProperty } from './leafletmap/polygon';

export interface TooltipRenderer {
  (): void,
  (properties: PolygonProperty, x: number, y: number, cleanup?: any): void
};

// 共有画面用
export const renderTooltip = ((properties?: PolygonProperty, x?: number, y?: number) => {
	const mapData = getMapData();
	const tooltip = document.getElementById('tooltip') as HTMLElement;
  if (!properties || typeof x !== 'number' || typeof y !== 'number') {
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

	const tooltipLegend = document.getElementById("tooltip_legend") as HTMLElement;
	while (tooltipLegend.firstChild) {
		tooltipLegend.firstChild.remove();
	}

	const legend = mapData.legend[mapData[properties.code] ?? 0];
	const color = document.createElement("span");
	color.className = "color";
	color.style.backgroundColor = legend.color;
	const text = document.createTextNode(legend.title);
	tooltipLegend.append(color, text);
}) as TooltipRenderer;

// 編集画面用
export const renderTooltipWithButton = ((properties?: PolygonProperty, x?: number, y?: number, cleanup?: any) => {
	const mapData = getMapData();
	const tooltip = document.getElementById('tooltip') as HTMLElement;
  if (!properties || typeof x !== 'number' || typeof y !== 'number' || !cleanup) {
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

	const tooltipButtons = document.getElementById('tooltip_buttons') as HTMLElement;
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
