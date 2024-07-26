'use client'

import { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import { LineString, Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style, Fill, Stroke } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer, VectorImage as VectorImageLayer, } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, Cluster, XYZ, BingMaps, Vector as VectorSource } from 'ol/source';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import { get as getProjection, getTransform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { ZoomSlider } from 'ol/control.js';
import proj4 from 'proj4';
import randomColor from 'randomcolor';
import Control from 'ol/control/Control';
import { BASE_SERVER_URL } from '@/utils/constants';
import {
    Circle as CircleStyle,
    Text,
} from 'ol/style.js';

import Zoom from './Zoom';
import LayersPanel from './LayersPanel';
import { getSoils } from '@/api/soil/get_soils';
import { getEcosystems } from '@/api/ecosystem/get_ecosystems';
import { getpublication } from '@/api/publication/get_publication';
import { getpublications } from '@/api/publication/get_publications';
import SideBar from './SideBar';
import { useSelector } from 'react-redux';

export default function NewMap() {
    const [baseLayer, setBaseLayer] = useState(null);
    const [layers, setLayers] = useState(null);
    const { selectedTerms, selectedCategories } = useSelector(state => state.data);
    const [selectedLayer, setSelectedLayer] = useState('');

    const [soils, setSoils] = useState([]);
    const [defaultSoilStyle, setSoilStyle] = useState(null);

    const didLogRef = useRef(false);
    const mapElement = useRef();

    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = () => {
            if (didLogRef.current === false) {
                didLogRef.current = true;
                init();
                loadLayers();
            }
        }

        if (mapElement.current) {
            initializeMap();
        } else {
            document.addEventListener('DOMContentLoaded', initializeMap)
        }

        return () => {
            document.removeEventListener('DOMContentLoaded', initializeMap)
        }
    }, [])

    useEffect(() => {
        const filteredIds = soils.filter(soil =>
            (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm)))
        ).map(({ id }) => id);
        filterSoilsById(filteredIds);
    }, [selectedTerms, selectedCategories, soils])

    const filterSoilsById = (filteredIds) => {
        const soilObjectLayer = layers?.get('soil');
        if (!soilObjectLayer) return;

        const source = soilObjectLayer.getSource();
        const hiddenStyle = new Style(null);
        source.getFeatures().forEach(feature => {
            if (feature.get('p_type') === 'soil') {
                const featureId = feature.get('p_Id');
                if (filteredIds.includes(featureId)) {
                    feature.setStyle(defaultSoilStyle);
                } else {
                    feature.setStyle(hiddenStyle);
                }
            }
        });
    };

    const init = () => {
        let startcoords = fromLonLat([85.9075867, 53.1155423]);

        //Создаем вид
        let view = new View({
            center: startcoords,
            zoom: 8.5
        });

        // Базовый слой карты
        const baseLayer = new TileLayer();

        baseLayer.setSource(getBaseLayerSourse("OSM"));
        mapRef.current = new OLMap({
            layers: [baseLayer],
            target: mapElement.current,
            view: view,
            controls: []
        });
        setBaseLayer(baseLayer);
        setSoilStyle(createIconStyle('/soil-marker.svg'));
    }

    const getBaseLayerSourse = (layerValue) => {
        setSelectedLayer(layerValue);
        if (layerValue === "OSM") {
            return new OSM();
        }
        if (layerValue === "BingRoud") {
            return new BingMaps({
                key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
                imagerySet: 'RoadOnDemand',
                culture: 'ru'
            });
        }
        if (layerValue === "BingSat") {
            return new BingMaps({
                key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
                imagerySet: 'Aerial',
                culture: 'ru'
            });
        }
        if (layerValue === "BingHibrid") {
            return new BingMaps({
                key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
                imagerySet: 'AerialWithLabelsOnDemand',
                culture: 'ru'
            });
        }
        if (layerValue === "ArcGis_World_Topo_Map") {
            return new XYZ({
                attributions:
                    'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url:
                    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                    'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            });
        }
        if (layerValue === "ArcGis_World_Imagery") {
            return new XYZ({
                attributions:
                    'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Imagery/MapServer">ArcGIS</a>',
                url:
                    'https://server.arcgisonline.com/ArcGIS/rest/services/' +
                    'World_Imagery/MapServer/tile/{z}/{y}/{x}',
            });
        }
        return new OSM();
    }

    const handleZoomClick = (zoomType) => {
        if (zoomType === "customZoomOut") {
            let view = mapRef.current.getView();
            let zoom = view.getZoom();
            view.animate({ zoom: zoom - 1 });
        }
        if (zoomType === "customZoomIn") {
            let view = mapRef.current.getView();
            let zoom = view.getZoom();
            view.animate({ zoom: zoom + 1 });
        }
    }

    const handleBaseLayerChange = (layer) => {
        baseLayer.setSource(getBaseLayerSourse(layer))
    }

    const typeConfig = {
        soil: { fetch: getSoils, setState: setSoils },
        ecosystem: { fetch: getEcosystems },
        publication: { fetch: getpublications }
    };

    const fetchData = async (type) => {
        if (!typeConfig[type]) return {};

        const { fetch, setState } = typeConfig[type];
        const result = await fetch();

        if (result.success && setState) {
            setState(result.data);
        }
        return result.data;
    };

    const getLayer = (layerName) => {
        let layerVectorSource = new VectorSource();

        fetchData(layerName)
            .then(data => {
                let layerStyle = getIconStyleByLayerName(layerName);
                for (let i = 0; i < data.length; i++) {
                    //создаем новую точку
                    let newPointFeature = new Feature({
                        geometry: new Point([data[i].longtitude, data[i].latitude])
                    });
                    newPointFeature.set("p_Id", data[i].id);
                    newPointFeature.set("p_type", layerName);
                    // newPointFeature.set("isGeoMapFeature", false);

                    //устанавливаем стиль
                    newPointFeature.setStyle(layerStyle);
                    layerVectorSource.addFeature(newPointFeature);
                }

            });
        return new VectorLayer({
            source: layerVectorSource,
        });
    }

    const loadLayers = () => {
        let layers = new Map();
        layers.set('soil', getLayer('soil'));
        layers.set('ecosystem', getLayer('ecosystem'));
        layers.set('publication', getLayer('publication'));
        for (let lay of layers.values()) {
            mapRef.current.addLayer(lay);
            lay.setZIndex(5);
        }
        setLayers(layers);
    }

    //Создает стиль иконки по типу слоя
    const getIconStyleByLayerName = (layerName) => {
        if (layerName === "publication") {
            return createIconStyle('/publ-marker.svg');
        }
        if (layerName === "ecosystem") {
            return createIconStyle('/ecosystem-marker.svg');
        }
        if (layerName === "soil") {
            return createIconStyle('/soil-marker.svg');
        }
        return createIconStyle('/public/mapicons/map-marker.svg');
    }

    //Создает стиль иконки по Url
    const createIconStyle = (iconUrl, scale = 0.1) => {
        return new Style({
            image: new Icon({
                anchor: [0.5, 1],
                scale: scale,
                src: iconUrl
            }),
        });
    }

    const handleLayerChange = ({ name, checked }) => {
        let currentLayer = layers.get(name);
        if (currentLayer) {
            currentLayer.setVisible(checked);
        }
    }

    const selectLocationHandler = (item) => {
        const newCord = fromLonLat([item.lon, item.lat]);
        mapRef.current.getView().animate({ duration: 500 }, { center: newCord });
    }

    return (
        <div ref={mapElement} className="w-full h-full z-10">
            <div className='z-20 absolute top-0 right-0 m-2'>
                <LayersPanel onLayerChange={handleBaseLayerChange} currentLayer={selectedLayer} />
            </div>
            <div className='z-30 absolute top-[calc(50%-100px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
            <SideBar onVisibleChange={handleLayerChange} onLocationHandler={selectLocationHandler} />
        </div>
    )
}