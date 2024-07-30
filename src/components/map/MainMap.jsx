'use client'

import { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import { Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style, Fill, Stroke } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, Cluster, XYZ, BingMaps, Vector as VectorSource } from 'ol/source';
import {
    Circle as CircleStyle,
    Text,
} from 'ol/style.js';

import Zoom from './Zoom';
import LayersPanel from './LayersPanel';
import { getSoils } from '@/api/soil/get_soils';
import { getEcosystems } from '@/api/ecosystem/get_ecosystems';
import SideBar from './SideBar';
import { useSelector } from 'react-redux';
import { getPublications } from '@/api/publication/get_publications';
import ObjectsPopup from './ObjectsPopup';

export default function MainMap() {
    const [baseLayer, setBaseLayer] = useState(null);
    const [layers, setLayers] = useState(null);
    const { selectedTerms, selectedCategories } = useSelector(state => state.data);
    const [selectedLayer, setSelectedLayer] = useState('');

    const [objects, setObjects] = useState([]);

    const [soils, setSoils] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [publications, setPublications] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);

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
            document.removeEventListener('DOMContentLoaded', initializeMap);
        }
    }, [])

    useEffect(() => {
        addListeners();
        return () => removeListeners();
    }, [soils, ecosystems, publications])

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
        ecosystem: { fetch: getEcosystems, setState: setEcosystems },
        publication: { fetch: getPublications, setState: setPublications }
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
                data?.forEach(item => {
                    const coordinates = layerName === 'publication' && item.coordinates
                        ? JSON.parse(item.coordinates)
                        : [{ longtitude: item.longtitude, latitude: item.latitude }];
                    console.log(layerName, coordinates)
                    // Создаем точки на основе координат
                    coordinates.forEach(coord => {
                        if (coord.longtitude && coord.latitude) {
                            const newPointFeature = new Feature({
                                geometry: new Point(fromLonLat([coord.longtitude, coord.latitude])),
                            });
                            newPointFeature.set("p_Id", item.id);
                            newPointFeature.set("p_type", layerName);
                            newPointFeature.setStyle(layerStyle);
                            layerVectorSource.addFeature(newPointFeature);
                        }
                    })
                })
            });
        const clusterSource = new Cluster({
            distance: 35, // Расстояние для кластеризации в пикселях
            source: layerVectorSource // Исходный источник
        });
        const clusterLayer = new VectorLayer({
            source: clusterSource,
            style: clusterStyle
        });
        return clusterLayer;
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

    const clusterStyle = (feature) => {
        const size = feature.get('features').length;
        if (size > 1) {
            // Стиль для кластеров
            return new Style({
                image: new CircleStyle({
                    radius: 20,
                    fill: new Fill({ color: '#fa9405' }),
                    stroke: new Stroke({ color: '#fff4e5', width: 5 }),
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({ color: '#ffffff' }),
                    font: 'bold 16px sans-serif',
                    offsetX: 0,
                    offsetY: 2,
                    textAlign: 'center',
                }),
            });
        } else {
            const singleFeature = feature.get('features')[0];
            return singleFeature.getStyle();
        }
    }

    //Создает стиль иконки по типу слоя
    const getIconStyleByLayerName = (layerName) => {
        if (layerName === "publication") {
            return createIconStyle('/publ-marker_v2.svg');
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

    const hangleMapClick = (e) => {
        const features = mapRef.current.getFeaturesAtPixel(e.pixel);
        const _objects = [];
        if (features.length > 0) {
            const feature = features[0];
            const points = feature.get('features');


            setPopupVisible(true);

            points.forEach(point => {
                const type = point.get("p_type");
                const _id = point.get("p_Id");

                switch (type) {
                    case 'soil': {
                        _objects.push({ ...soils.find(({ id }) => id == _id), _type: 'soil' });
                        break;
                    }
                    case 'ecosystem': {
                        _objects.push({ ...ecosystems.find(({ id }) => id == _id), _type: 'ecosystem' });
                        break;
                    }
                    case 'publication': {
                        !_objects.some(obj => obj.id === _id) && _objects.push({ ...publications.find(({ id }) => id == _id), _type: 'publication' });
                        break;
                    }
                }
            })
        };
        if (_objects.length) {
            setObjects(_objects);
        }
    }


    const addListeners = () => {
        mapRef.current.addEventListener('singleclick', hangleMapClick)
    }

    const removeListeners = () => {
        mapRef.current.removeEventListener('singleclick', hangleMapClick)
    }


    const handleLayerChange = ({ name, checked }) => {
        let currentLayer = layers.get(name);
        if (currentLayer) {
            currentLayer.setVisible(checked);
        }
    }

    const selectLocationHandler = (item) => {
        let up = fromLonLat([item.boundingbox[3], item.boundingbox[1]]);
        let down = fromLonLat([item.boundingbox[2], item.boundingbox[0]]);

        let combined = down.concat(up);
        mapRef.current.getView().fit(combined, {
            duration: 500, // Анимация в 500 миллисекунд
            maxZoom: 15, // Максимальный уровень масштабирования
            padding: [20, 20, 20, 20] // Отступы: [верх, право, низ, лево]
        });
    }

    const handlePopupClose = () => {
        setPopupVisible(false);
        setObjects([]);
    }

    return (
        <div ref={mapElement} className="w-full h-full z-10">
            <div className='z-20 absolute top-0 right-0 m-2'>
                <LayersPanel onLayerChange={handleBaseLayerChange} currentLayer={selectedLayer} />
            </div>
            <div className='z-30 absolute top-[calc(50%-100px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
            <SideBar popupVisible={popupVisible}
                onVisibleChange={handleLayerChange} onLocationHandler={selectLocationHandler} />
            <ObjectsPopup visible={popupVisible} objects={objects} onCloseClick={handlePopupClose} />
        </div>
    )
}