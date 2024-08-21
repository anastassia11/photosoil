'use client'

import { useState, useEffect, useRef } from 'react';
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
import { Select } from 'ol/interaction';

export default function MainMap() {
    const [baseLayer, setBaseLayer] = useState(null);

    const [clusterLayer, setClusterLayer] = useState(null);
    const [features, setFeatures] = useState([]);
    const { locale } = useParams();

    const { selectedTerms, selectedCategories } = useSelector(state => state.data);
    const [selectedLayer, setSelectedLayer] = useState('');

    const [selectedObjects, setSelectedObjects] = useState([]);

    const [objects, setObjects] = useState([]);
    const [soils, setSoils] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [publications, setPublications] = useState([]);
    const [popupVisible, setPopupVisible] = useState(false);
    const [draftIsVisible, setDraftIsVisible] = useState(false);

    const didLogRef = useRef(false);
    const mapElement = useRef();

    const mapRef = useRef(null);
    const _isEng = locale === 'en';

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
            (draftIsVisible ? true : soil.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible) &&
            (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm)))
        ).map(({ id }) => id);
        clusterLayer && filterById(filteredIds, 'soil');
    }, [selectedTerms, selectedCategories, soils, draftIsVisible])

    useEffect(() => {
        const filteredPublIds = publications.filter(publication =>
            (draftIsVisible ? true : publication.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible)
        ).map(({ id }) => id);
        const filteredEcoIds = ecosystems.filter(ecosystem =>
            (draftIsVisible ? true : ecosystem.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible)
        ).map(({ id }) => id);
        if (clusterLayer) {
            filterById(filteredPublIds, 'publication');
            filterById(filteredEcoIds, 'ecosystem');
        }
    }, [publications, ecosystems, draftIsVisible])

    const filterById = (filteredIds, type) => {
        const layerSource = clusterLayer.getSource().getSource(); // Получаем источник кластера

        features.forEach(feature => {
            if (feature.get('p_type') === type) {
                const featureId = feature.get('p_Id');
                if (filteredIds.includes(featureId)) {
                    !layerSource.hasFeature(feature) && layerSource.addFeature(feature);
                } else {
                    layerSource.removeFeature(feature);
                }
            }
        });
    };

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
            controls: []
        });
        setBaseLayer(baseLayer);
        // mapRef.current.addInteraction(select);
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
            }
            const dataWithType = result.data.map(item => ({
                ...item,
                _type: type
            }));
            return dataWithType;
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
                            layerVectorSource.addFeature(newPointFeature);
                            newFeatures.push(newPointFeature);
                        }
                    })
                });
                setFeatures(prevFeatures => [...prevFeatures, ...newFeatures]);
            });
        const clusterSource = new Cluster({
            distance: 17, // Расстояние для кластеризации в пикселях
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

    // const select = new Select({
    //     style: function (feature) {
    //         // if (feature.get('p_type') === name) 
    //         // const size = feature.get('size') || 0; // Пример получения размера
    //         return new Style({
    //             image: new RegularShape({
    //                 stroke: new Stroke({ color: 'rgba(255, 69, 0, 1)', width: 2 }),
    //                 fill: new Fill({ color: 'rgba(255, 69, 0, 1)' }), // Изменяем цвет при наведении
    //                 points: 4,
    //                 radius: 13, // Увеличиваем радиус для эффекта тени
    //                 angle: Math.PI / 4,
    //             }),
    //             text: new Text({
    //                 // text: size.toString(),
    //                 fill: new Fill({ color: '#ffffff' }),
    //                 font: '500 14px sans-serif',
    //                 offsetX: 0,
    //                 offsetY: 1,
    //                 textAlign: 'center',
    //                 textBaseline: 'middle'
    //             }),
    //             zIndex: 2
    //         });
    //     }
    // });



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
            // return new Style({
            //     image: new CircleStyle({
            //         radius: 20,
            //         fill: new Fill({ color: '#fa9405' }),
            //         stroke: new Stroke({ color: '#fff4e5', width: 5 }),
            //     }),
            //     text: new Text({
            //         text: size.toString(),
            //         fill: new Fill({ color: '#ffffff' }),
            //         font: 'bold 16px sans-serif',
            //         offsetX: 0,
            //         offsetY: 1,
            //         textAlign: 'center',
            //         textBaseline: 'middle'
            //     }),
            // });
        } else {
            const singleFeature = feature.get('features')[0];
            return singleFeature.getStyle();
        }
    }

    //Создает стиль иконки по типу слоя
    const getIconStyleByLayerName = (layerName) => {
        return createIconStyle(layerName)
        // if (layerName === "publication") {
        //     return createIconStyle('/publ-marker_v2.svg');
        // }
        // if (layerName === "ecosystem") {
        //     return createIconStyle('/ecosystem-marker.svg');
        // }
        // if (layerName === "soil") {
        //     return createIconStyle('/soil-marker.svg');
        // }
        // return createIconStyle('/map-marker.svg');
    }

    //Создает стиль иконки по Url
    const createIconStyle = (layerName,
        // iconUrl, scale = 0.1
    ) => {
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

        // return new Style({
        //     image: new Icon({
        //         anchor: [0.5, 1],
        //         scale: scale,
        //         src: iconUrl
        //     }),
        // });
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
                _objects.push({
                    ...objects.find(({ id, _type }) => {
                        if (_type === 'publication') {
                            return !_objects.some(obj => obj.id === _id) && ((id == _id) && (type == _type));
                        }
                        return (id == _id) && (type == _type)
                    }
                    )
                });
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

    const handleLayerChange = ({ name, checked }) => {
        const layerSource = clusterLayer.getSource().getSource(); // Получаем источник кластера

        features.forEach(feature => {
            if (feature.get('p_type') === name) {
                if (checked) {
                    !layerSource.hasFeature(feature) && layerSource.addFeature(feature); // Добавляем Feature обратно в источник, если checked
                } else {
                    layerSource.removeFeature(feature); // Удаляем Feature из источника, если unchecked
                }
            }
        });
    };

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
        setSelectedObjects([]);
    }

    return (
        <div ref={mapElement} className="w-full h-full z-10">
            <div className='z-40 absolute top-0 right-0 m-2'>
                <LayersPanel onLayerChange={handleBaseLayerChange} currentLayer={selectedLayer} />
            </div>
            <div className='z-20 absolute top-[calc(50%-100px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
            <SideBar popupVisible={popupVisible}
                onVisibleChange={handleLayerChange} onLocationHandler={selectLocationHandler}
                draftIsVisible={draftIsVisible} setDraftIsVisible={setDraftIsVisible} />
            <ObjectsPopup visible={popupVisible} objects={selectedObjects} onCloseClick={handlePopupClose} />
        </div>
    )
}