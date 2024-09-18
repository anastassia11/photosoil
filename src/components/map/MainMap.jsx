'use client'

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import { Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style, Fill, Stroke, RegularShape } from 'ol/style';
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
import { useParams } from 'next/navigation';
import SearchRegion from './SearchRegion';

export default function MainMap() {
    const [baseLayer, setBaseLayer] = useState(null);

    const [clusterLayer, setClusterLayer] = useState(null);
    const [features, setFeatures] = useState([]);

    const [sidebarOpen, setSideBarOpen] = useState(false);
    const { locale } = useParams();

    const { selectedTerms, selectedCategories, selectedAuthors } = useSelector(state => state.data);
    const [selectedLayer, setSelectedLayer] = useState('');

    const [selectedObjects, setSelectedObjects] = useState([]);
    const [layersVisible, setLayersVisible] = useState({
        soil: true,
        ecosystem: false,
        publication: false,
    })
    const [objects, setObjects] = useState([]);
    const [soils, setSoils] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [publications, setPublications] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [draftIsVisible, setDraftIsVisible] = useState(false);

    const [filterName, setFilterName] = useState('');

    const didLogRef = useRef(false);
    const mapElement = useRef();

    const mapRef = useRef(null);
    const _isEng = locale === 'en';

    useLayoutEffect(() => {
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
        if (clusterLayer) {
            const layerSource = clusterLayer.getSource().getSource(); // Получаем источник кластера
            features.forEach(feature => {
                if (layersVisible[feature.get('p_type')]) {
                    !layerSource.hasFeature(feature) && layerSource.addFeature(feature); // Добавляем Feature обратно в источник, если checked
                } else {
                    layerSource.removeFeature(feature); // Удаляем Feature из источника, если unchecked
                }
            });
        }
    }, [layersVisible, clusterLayer, soils, ecosystems, publications, features])

    useEffect(() => {
        addListeners();
        return () => removeListeners();
    }, [soils, ecosystems, publications])

    useEffect(() => {
        if (window.innerWidth < 640) {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [])

    const handleClickOutside = useCallback((e) => {
        if (!e.target.closest(".sideBar")) {
            setSideBarOpen(false);
        }
    }, []);

    const filterById = useCallback((filteredIds) => {
        const layerSource = clusterLayer.getSource().getSource(); // Получаем источник кластера
        features.forEach(feature => {
            if (feature.get('p_type')) {
                const featureId = feature.get('p_Id');
                const featureType = feature.get('p_type');
                if (filteredIds.find(obj => obj.id === featureId && obj._type === featureType) && layersVisible[featureType]) {
                    !layerSource.hasFeature(feature) && layerSource.addFeature(feature);
                } else {
                    layerSource.removeFeature(feature);
                }
            }
        });
        filterName.length ? setSelectedObjects(objects.filter(item => filteredIds.find(obj => obj.id === item.id && obj._type === item._type))) : setSelectedObjects([])
    }, [clusterLayer, features, layersVisible, objects, filterName]);

    useEffect(() => {
        const _filterName = filterName.toLowerCase().trim();
        const filteredAllIds = objects.filter(obj =>
            (layersVisible[obj._type]) &&
            (draftIsVisible ? true : obj.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible) &&
            (filterName.length ? (obj.translations?.find(transl => transl.isEnglish === _isEng)?.name?.toLowerCase().includes(_filterName)
                || obj.translations?.find(transl => transl.isEnglish === _isEng)?.code?.toLowerCase().includes(_filterName)) : true) &&
            (obj.objectType ? (selectedCategories.length === 0 || selectedCategories.includes(obj.objectType)) : true) &&
            (obj.authors ? (selectedAuthors.length === 0 || selectedAuthors.some(selectedAuthor => obj.authors?.some(author => author === selectedAuthor))) : true) &&
            (obj.terms ? (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => obj.terms?.some(term => term === selectedTerm))) : true)
        ).map(({ id, _type }) => ({ id, _type }));
        if (clusterLayer) {
            filterById(filteredAllIds);
        }
    }, [selectedTerms, selectedCategories, selectedAuthors,
        objects, draftIsVisible, clusterLayer,
        filterName, layersVisible, filterById, _isEng])

    const init = () => {
        let startcoords = fromLonLat([85.9075867, 53.1155423]);

        //Создаем вид
        let view = new View({
            center: startcoords,
            zoom: 3,
            rotation: 0,
            constrainRotation: true,
            rotateExtent: [0, 0, 0, 0],
        });

        // Базовый слой карты
        const baseLayer = new TileLayer();

        baseLayer.setSource(getBaseLayerSourse("OSM"));
        mapRef.current = new OLMap({
            layers: [baseLayer],
            target: mapElement.current,
            view: view,
            controls: [],
            // transition: 0,
            // renderers: ['Canvas', 'VML']
        });
        setBaseLayer(baseLayer);
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
                culture: locale
            });
        }
        if (layerValue === "BingSat") {
            return new BingMaps({
                key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
                imagerySet: 'Aerial',
                culture: locale
            });
        }
        if (layerValue === "BingHibrid") {
            return new BingMaps({
                key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
                imagerySet: 'AerialWithLabelsOnDemand',
                culture: locale
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

    const typeConfig = [
        {
            type: 'soil',
            fetch: getSoils,
            setState: setSoils
        },
        {
            type: 'ecosystem',
            fetch: getEcosystems,
            setState: setEcosystems
        },
        {
            type: 'publication',
            fetch: getPublications,
            setState: setPublications
        }
    ];

    const fetchData = async () => {
        const fetchPromises = typeConfig.map(async ({ type, fetch, setState }) => {
            const result = await fetch();
            if (result.success && setState) {
                setState(result.data);
                const dataWithType = result.data.map(item => ({
                    ...item,
                    _type: type
                }));
                return dataWithType;
            }
        });

        const results = await Promise.all(fetchPromises);
        const combinedResults = results.flat(); // Объединяем все массивы в один
        setObjects(combinedResults);
        return combinedResults;
    };

    const getLayer = () => {
        let layerVectorSource = new VectorSource();

        fetchData()
            .then(data => {
                const newFeatures = [];
                data?.forEach(item => {
                    const coordinates = item._type === 'publication' && item.coordinates
                        ? JSON.parse(item.coordinates)
                        : [{ longtitude: item.longtitude, latitude: item.latitude }];
                    // Создаем точки на основе координат
                    coordinates.forEach(coord => {
                        if (coord.longtitude && coord.latitude) {
                            const newPointFeature = new Feature({
                                geometry: new Point(fromLonLat([coord.longtitude, coord.latitude])),
                            });
                            newPointFeature.set("p_Id", item.id);
                            newPointFeature.set("p_type", item._type);
                            newPointFeature.setStyle(getIconStyleByLayerName(item._type));
                            layersVisible[item._type] && layerVectorSource.addFeature(newPointFeature);
                            newFeatures.push(newPointFeature);
                        }
                    })
                });
                setFeatures(prevFeatures => [...prevFeatures, ...newFeatures]);
            });
        const clusterSource = new Cluster({
            distance: 18, // Расстояние для кластеризации в пикселях
            minDistance: 18,
            source: layerVectorSource // Исходный источник
        });
        const _clusterLayer = new VectorLayer({
            source: clusterSource,
            style: clusterStyle,
        });
        _clusterLayer.setZIndex(5);
        setClusterLayer(_clusterLayer);
        return _clusterLayer;
    }

    const loadLayers = () => {
        mapRef.current.addLayer(getLayer());
    }

    const clusterStyle = (feature) => {
        const size = feature.get('features').length;
        if (size > 1) {
            // Стиль для кластеров
            return new Style({
                image: new RegularShape({
                    stroke: new Stroke({ color: 'rgba(255, 69, 0, 1)', width: 2 }),
                    fill: new Fill({ color: 'rgba(255, 69, 0, 0.6)' }),
                    points: 4, // Количество углов (4 для квадрата)
                    radius: 13, // Радиус квадрата
                    angle: Math.PI / 4, // Угол поворота
                }),
                text: new Text({
                    text: size.toString(),
                    fill: new Fill({ color: '#ffffff' }),
                    font: '500 14px sans-serif',
                    offsetX: 0,
                    offsetY: 1,
                    textAlign: 'center',
                    textBaseline: 'middle'
                }),
                zIndex: 2
            });
        } else {
            const singleFeature = feature.get('features')[0];
            return singleFeature.getStyle();
        }
    }

    //Создает стиль иконки по типу слоя
    const getIconStyleByLayerName = (layerName) => {
        return createIconStyle(layerName)
    }

    //Создает стиль иконки по Url
    const createIconStyle = (layerName) => {
        if (layerName === 'soil') {
            return new Style({
                image: new RegularShape({
                    stroke: new Stroke({ color: 'rgba(153, 51, 0, 1)', width: 1.7 }),
                    fill: new Fill({ color: 'rgba(153, 51, 0, 0.7)' }),
                    points: 4, // Количество углов (4 для квадрата)
                    radius: 10, // Радиус квадрата
                    angle: Math.PI / 4, // Угол поворота
                }),
                zIndex: 1
            });
        } else if (layerName === 'ecosystem') {
            return new Style({
                image: new RegularShape({
                    stroke: new Stroke({ color: 'rgba(115, 172, 19, 1)', width: 1.7 }),
                    fill: new Fill({ color: 'rgba(115, 172, 19, 0.7)' }),
                    points: 4, // Количество углов (4 для квадрата)
                    radius: 10, // Радиус квадрата
                    angle: Math.PI / 4, // Угол поворота
                }),
                zIndex: 1
            });
        } else if (layerName === 'publication') {
            return new Style({
                image: new RegularShape({
                    stroke: new Stroke({ color: 'rgba(139, 0, 139, 1)', width: 1.7 }),
                    fill: new Fill({ color: 'rgba(139, 0, 139, 0.7)' }),
                    points: 4, // Количество углов (4 для квадрата)
                    radius: 10, // Радиус квадрата
                    angle: Math.PI / 4, // Угол поворота
                }),
                zIndex: 1
            });
        }
    }

    const hangleMapClick = (e) => {
        const features = mapRef.current.getFeaturesAtPixel(e.pixel);
        const _objects = [];
        if (features.length > 0) {
            const feature = features[0];
            const points = feature.get('features');

            setPopupVisible(true);
            setSideBarOpen(true);

            points.forEach(point => {
                const type = point.get("p_type");
                const _id = point.get("p_Id");

                const foundObject = objects.find(({ id, _type }) => {
                    if (_type === 'publication') {
                        return !_objects.some(obj => obj.id === _id) && ((id == _id) && (type == _type));
                    }
                    return (id == _id) && (type == _type);
                });
                if (foundObject) {
                    _objects.push({
                        ...foundObject
                    });
                }
            })
        };
        if (_objects.length) {
            setSelectedObjects(_objects);
        }
    }

    const handleMapHover = (e) => {
        const features = mapRef.current.getFeaturesAtPixel(e.pixel);

        if (features.length > 0) {
            const feature = features[0];
            const size = feature.get('features').length;
            const points = feature.get('features');
            if (points.length == 1) {
                const point = points[0];
                const layerName = point.get("p_type");
                if (layerName === 'soil') {
                    feature.setStyle(new Style({
                        image: new RegularShape({
                            stroke: new Stroke({ color: 'rgba(153, 51, 0, 1)', width: 1.7 }),
                            fill: new Fill({ color: 'rgba(153, 51, 0, 0.8)' }),
                            points: 4, // Количество углов (4 для квадрата)
                            radius: 11, // Радиус квадрата
                            angle: Math.PI / 4, // Угол поворота
                        }),
                        zIndex: 1
                    }));
                } else if (layerName === 'ecosystem') {
                    feature.setStyle(new Style({
                        image: new RegularShape({
                            stroke: new Stroke({ color: 'rgba(115, 172, 19, 1)', width: 1.7 }),
                            fill: new Fill({ color: 'rgba(115, 172, 19, 0.8)' }),
                            points: 4, // Количество углов (4 для квадрата)
                            radius: 11, // Радиус квадрата
                            angle: Math.PI / 4, // Угол поворота
                        }),
                        zIndex: 1
                    }));
                } else if (layerName === 'publication') {
                    feature.setStyle(new Style({
                        image: new RegularShape({
                            stroke: new Stroke({ color: 'rgba(139, 0, 139, 1)', width: 1.7 }),
                            fill: new Fill({ color: 'rgba(139, 0, 139, 0.8)' }),
                            points: 4, // Количество углов (4 для квадрата)
                            radius: 11, // Радиус квадрата
                            angle: Math.PI / 4, // Угол поворота
                        }),
                        zIndex: 1
                    }));
                }
            } else {
                feature.setStyle(new Style({
                    image: new RegularShape({
                        stroke: new Stroke({ color: 'rgba(255, 69, 0, 1)', width: 2 }),
                        fill: new Fill({ color: 'rgba(255, 69, 0, 0.75)' }),
                        points: 4, // Количество углов (4 для квадрата)
                        radius: 14, // Радиус квадрата
                        angle: Math.PI / 4, // Угол поворота
                    }),
                    text: new Text({
                        text: size.toString(),
                        fill: new Fill({ color: '#ffffff' }),
                        font: '500 14px sans-serif',
                        offsetX: 0,
                        offsetY: 1,
                        textAlign: 'center',
                        textBaseline: 'middle'
                    }),
                    zIndex: 2
                }));
            }

            mapRef.current.getTargetElement().style.cursor = 'pointer'
        } else {
            handleMapOut();
            mapRef.current.getLayers().getArray()[1].getSource().getFeatures().forEach((feature) => {
                feature.setStyle(null); // Сброс стиля
            });
        }
    }

    const handleMapOut = () => {
        mapRef.current.getTargetElement().style.cursor = 'default';
    };

    const addListeners = () => {
        mapRef.current.on('singleclick', hangleMapClick);
        mapRef.current.on('pointermove', handleMapHover);
    }

    const removeListeners = () => {
        mapRef.current.un('singleclick', hangleMapClick);
        mapRef.current.un('pointermove', handleMapHover);
    }

    const handleLayerChange = useCallback(({ name, checked }) => {
        setLayersVisible(prev => ({ ...prev, [name]: checked }));
    }, []);

    const selectLocationHandler = (item) => {
        let up = fromLonLat([item.boundingbox[3], item.boundingbox[1]]);
        let down = fromLonLat([item.boundingbox[2], item.boundingbox[0]]);

        let combined = down.concat(up);
        mapRef.current.getView().fit(combined, {
            duration: 500,
            maxZoom: 15,
            padding: [20, 20, 20, 20]
        });
    }

    const handlePopupClose = () => {
        setPopupVisible(false);
        setFilterName('');
        setSelectedObjects([]);
    }

    return (
        <div ref={mapElement} className="w-full h-full z-10">
            <div className={`z-40 absolute top-0 right-0 m-2 flex flex-row duration-300 lg:w-[500px] w-full pl-2`}>
                <SearchRegion onLocationHandler={selectLocationHandler} />
                <LayersPanel onLayerChange={handleBaseLayerChange} currentLayer={selectedLayer} />
            </div>
            <div className='z-20 absolute top-[calc(50%-100px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>

            <SideBar sidebarOpen={sidebarOpen}
                filterName={filterName} objects={selectedObjects}
                setFilterName={setFilterName}
                setSideBarOpen={setSideBarOpen} popupVisible={popupVisible}
                popupClose={handlePopupClose}
                layersVisible={layersVisible}
                onVisibleChange={handleLayerChange} onLocationHandler={selectLocationHandler}
                draftIsVisible={draftIsVisible} setDraftIsVisible={setDraftIsVisible} />
            {/* <ObjectsPopup visible={popupVisible} objects={selectedObjects} onCloseClick={handlePopupClose} /> */}
        </div>
    )
}