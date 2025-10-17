import type { PolygonProperty } from 'leafletMap/polygon';

export type TooltipRenderer = {
	(): void,
	(properties: PolygonProperty, x: number, y: number, cleanup?: any): void
};
