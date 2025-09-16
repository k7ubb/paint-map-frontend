'use strict';

import { getMapData } from '../mapdata';
import { getFillGeoJSON, getOutlineGeoJSON } from '../geojson';
import { createPolygon } from './polygon';
import type { TooltipRenderer } from '../tooltip';

const L = window.L as typeof import('leaflet');

export const leafletMapElement: HTMLElement = document.getElementById('leaflet_map')!;

if (!leafletMapElement) {
	throw new Error("Element 'leaflet_map' does not exist");
}

let leafletMap: L.Map;

let isPolygonClicked: boolean = false;

let clickedPolygon: L.Polygon | null = null;

let fillPolygonHash: { [code: string]: L.Polygon } = {};

let baseLayers: { [name: string]: L.TileLayer } = {};

export const initLeafletMap = async (options: {
	tooltipRenderer?: TooltipRenderer
} = {}) => {
	const mapData = getMapData();
	const params = new URLSearchParams(location.search);
	const lat = Number(params.get('lat') ?? mapData.position.lat);
	const lng = Number(params.get('lng') ?? mapData.position.lng);
	const zoom = Number(params.get('zoom') ?? mapData.position.zoom);
	leafletMap = L.map(leafletMapElement, {
		minZoom: mapData.minZoom ?? 2,
		maxZoom: mapData.maxZoom ?? 18,
		...(mapData.worldCopyJump && { worldCopyJump: true })
	}).setView([lat, lng], zoom);

	leafletMap.zoomControl.setPosition('topright');

	const cleanupTooltip = () => {
		if (clickedPolygon) {
			leafletMap.removeLayer(clickedPolygon);
			clickedPolygon = null;
		}
		options.tooltipRenderer?.();
	};

	baseLayers = {
		blank: L.tileLayer('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
			attribution: mapData.source
		}),
		OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: mapData.source + ' | <a href="https://www.openstreetmap.org/copyright" target="_blank">©OpenStreetMap</a> contributors'
		})
	};
	baseLayers.blank.addTo(leafletMap);
	L.control.layers(baseLayers).addTo(leafletMap);

	// レイヤーを切り替えたら、すべての塗りつぶしポリゴンを再描画
	leafletMap.on('baselayerchange', () => {
		updateMap({
			...Object.fromEntries(Object.keys(fillPolygonHash).map(key => [key, 0])),
			...mapData.data
		});
		cleanupTooltip();
	});

	// 地図をドラッグしたら、選択中の表示を解除
	leafletMap.on('dragstart', () => {
		cleanupTooltip();
	});

	// なにもないところをクリックしたら、選択中の表示を解除
	leafletMap.on('click', () => {
		if (isPolygonClicked) {
			isPolygonClicked = false;
			return;
		}
		cleanupTooltip();
	});

	// ズームレベルを削除したら、選択中の表示を解除
	leafletMap.on('zoomstart', () => cleanupTooltip());

	const fillGeoJSON = getFillGeoJSON();
	const outlineGeoJSON = getOutlineGeoJSON();
	const fillPolygon = createPolygon(fillGeoJSON, Boolean(mapData.worldCopyJump));
	const outlinePolygon = outlineGeoJSON ? createPolygon(outlineGeoJSON, Boolean(mapData.worldCopyJump)) : [];

	fillPolygon.forEach(({ properties, polygon }) => {
		polygon.setStyle({
			color: '#999999',
			weight: 1
		});
		polygon.on('click', (e) => {
			isPolygonClicked = true;
			if (clickedPolygon) {
				leafletMap.removeLayer(clickedPolygon);
			}
			clickedPolygon = L.polygon(polygon.getLatLngs(), {
				color: '#ff0000',
				weight: 2,
				fillOpacity: 0,
				interactive: false
			});
			clickedPolygon.addTo(leafletMap);
			const rect = leafletMapElement.getBoundingClientRect();
			options.tooltipRenderer?.(
				properties,
				// changedTouchesを参照するコードを削除。スマホでの動作を要確認
				e.originalEvent.clientX - rect.left,
				e.originalEvent.clientY - rect.top,
				cleanupTooltip,
			);
		});
		polygon.addTo(leafletMap);
		fillPolygonHash[properties.code] = polygon;
	});

	outlinePolygon.forEach(({ polygon }) => {
		polygon.setStyle({
			color: '#000000',
			weight: 1,
			fillOpacity: 0,
			interactive: false
		});
		polygon.addTo(leafletMap);
	});
	
	// 初回はdataにないポリゴンもupdate
	updateMap({
		...Object.fromEntries(Object.keys(fillPolygonHash).map(key => [key, 0])),
		...mapData.data
	});
};

export const updateMap = (data: { [code: string]: number }) => {
	const isBlankLayer = leafletMap.hasLayer(baseLayers.blank);
	const mapData = getMapData();
	for (const [ code, value ] of Object.entries(data)) {
		fillPolygonHash[code].setStyle({
			fillColor: mapData.legend[value].color,
			fillOpacity: isBlankLayer ? 1 : .5
		});
	}
};
