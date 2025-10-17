'use strict';

import { getURLParam } from 'utils';
import { getMapData } from 'mapData';
import { getFillGeoJSON, getOutlineGeoJSON } from 'geoJSONData';
import { createPolygon } from 'leafletMap/polygon';

const L = window.L as typeof import('leaflet');

const leafletMapElementNullable = document.getElementById('leaflet');
if (!leafletMapElementNullable) {
	throw new Error('Element \'leaflet_map\' does not exist');
}
export const leafletMapElement: HTMLElement = leafletMapElementNullable;

let leafletMap: L.Map;

let isPolygonClicked: boolean = false;

let clickedPolygon: L.Polygon | null = null;

let fillPolygonHash: { [code: string]: L.Polygon } = {};

let baseLayers: { [name: string]: L.TileLayer } = {};

export const initLeafletMap = async (option: {
	controllerPosition: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
}) => {
	const mapData = getMapData();
	const lat = Number(getURLParam('lat') ?? mapData.position.lat);
	const lng = Number(getURLParam('lng') ?? mapData.position.lng);
	const zoom = Number(getURLParam('zoom') ?? mapData.position.zoom);
	leafletMap = L.map(leafletMapElement, {
		minZoom: mapData.minZoom ?? 2,
		maxZoom: mapData.maxZoom ?? 18,
		...(mapData.worldCopyJump && { worldCopyJump: true })
	}).setView([lat, lng], zoom);

	leafletMap.zoomControl.setPosition(option.controllerPosition);

	baseLayers = {
		blank: L.tileLayer('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', {
			attribution: mapData.attribution
		}),
		OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: mapData.attribution + ' | <a href="https://www.openstreetmap.org/copyright" target="_blank">©OpenStreetMap</a>'
		})
	};
	baseLayers.blank.addTo(leafletMap);
	L.control.layers(
		baseLayers,
		undefined,
		{ position: option.controllerPosition }
	).addTo(leafletMap);

	const cleanupTooltip = () => {
		if (clickedPolygon) {
			leafletMap.removeLayer(clickedPolygon);
			clickedPolygon = null;
		}
	};

	const fillGeoJSON = getFillGeoJSON();
	const outlineGeoJSON = getOutlineGeoJSON();
	const fillPolygon = createPolygon(fillGeoJSON, Boolean(mapData.worldCopyJump));
	const outlinePolygon = outlineGeoJSON ? createPolygon(outlineGeoJSON, Boolean(mapData.worldCopyJump)) : [];

	fillPolygon.forEach(({ properties, polygon }) => {
		polygon.setStyle({
			color: '#999999',
			weight: 1
		});
		polygon.on('click', () => {
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
	
	// レイヤーを切り替えたら、全てのfillPolygonを描画 (透明度を変更するため)
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

	// 初回は全てのfillPolygonを描画
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
