import { BingMaps, OSM, XYZ } from 'ol/source'

export const getMapLayers = (layerValue, locale) => {
	if (layerValue === 'OSM') {
		return new OSM()
	}
	if (layerValue === 'BingRoud') {
		return new BingMaps({
			key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
			imagerySet: 'RoadOnDemand',
			culture: locale
		})
	}
	if (layerValue === 'BingSat') {
		return new BingMaps({
			key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
			imagerySet: 'Aerial',
			culture: locale
		})
	}
	if (layerValue === 'BingHibrid') {
		return new BingMaps({
			key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
			imagerySet: 'AerialWithLabelsOnDemand',
			culture: locale
		})
	}
	if (layerValue === 'ArcGis_World_Topo_Map') {
		return new XYZ({
			attributions:
				'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
				'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
			url:
				'https://server.arcgisonline.com/ArcGIS/rest/services/' +
				'World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
		})
	}
	if (layerValue === 'ArcGis_World_Imagery') {
		return new XYZ({
			attributions:
				'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
				'rest/services/World_Imagery/MapServer">ArcGIS</a>',
			url:
				'https://server.arcgisonline.com/ArcGIS/rest/services/' +
				'World_Imagery/MapServer/tile/{z}/{y}/{x}'
		})
	}
	return new OSM()
}
