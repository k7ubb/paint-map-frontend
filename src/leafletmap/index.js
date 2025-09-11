'use strict';

import { getMapData } from '../mapdata';
import { loadPolygon } from './polygon';

export const leafletMapElement = document.getElementById('leaflet_map');

let leafletMap;

let isPolygonClicked = false;

/**
 * クリック中の領域の赤枠を保持しておくポリゴン
 * @type {L.Polygon | null}
 */
let clickedPolygon = null;

/**
 * 入力受付、赤枠表示様のpolygonのハッシュ
 * @type {Object<string, L.Polygon>}
 */
let fillPolygonHash = {};


/**
 * リソース読込・Leaflet地図を初期化
 * @returns {Promise<void>}
 */
export const initLeafletMap = async () => {
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

	// なにもないところをクリックしたら、選択中の表示を解除
	leafletMap.on('click', () => {
		if (isPolygonClicked) {
			isPolygonClicked = false;
			return;
		}
		if (clickedPolygon) {
			leafletMap.removeLayer(clickedPolygon);
			clickedPolygon = null;
		}
	});

	const [fillPolygon, outlinePolygon] = await Promise.all([
		loadPolygon(mapData.fillLayer, Boolean(mapData.worldCopyJump)),
		mapData.outlineLayer
			? loadPolygon(mapData.outlineLayer, Boolean(mapData.worldCopyJump))
			: Promise.resolve([])
	]);

	fillPolygon.forEach(({ properties, polygon }) => {
		polygon.setStyle({
			color: '#999999',
			weight: 1,
			fillOpacity: 1
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
	
	// 初回はdataにないポリゴンもupdate
	updateMap({
		...Object.fromEntries(Object.keys(fillPolygonHash).map(key => [key, 0])),
		...mapData.data
	});
};

/**
 * 変更があったポリゴンの色を変更
 * @param {Object<string, number>} data 
 */
export const updateMap = (data) => {
	const mapData = getMapData();
	for (const [ code, value ] of Object.entries(data)) {
		fillPolygonHash[code].setStyle({
			fillColor: mapData.legend[value].color
		});
	}
};
