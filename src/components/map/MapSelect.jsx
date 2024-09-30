'use select'

import 'ol/ol.css';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Style, Fill, Stroke, RegularShape } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import { memo, useEffect, useRef, useState } from 'react';
import Zoom from './Zoom';
import { getMapLayers } from '@/hooks/getMapLayers';
import { useParams } from 'next/navigation';
import LayersPanel from './LayersPanel';

const MapSelect = memo(function MapSelect({ id, type, latitude, longtitude, onCoordinateChange }) {
    const didLogRef = useRef(false);
    const mapElement = useRef();
    const { locale } = useParams();
    const [isCoordExist, setIsCoordExist] = useState(false);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [selectedPointGeom, setSelectedPointGeom] = useState(null);
    const [baseLayer, setBaseLayer] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState('');

    const mapRef = useRef(null);

    useEffect(() => {
        const initializeMap = () => {
            if (didLogRef.current === false) {
                didLogRef.current = true;
                init();
            }
        }

        if (mapElement.current) {
            initializeMap();
        } else {
            document.addEventListener('DOMContentLoaded', initializeMap)
        }

        onCoordinateChange && addMapListeners();
        return () => {
            document.removeEventListener('DOMContentLoaded', initializeMap);
            onCoordinateChange && removeMapListeners();
        }
    }, [onCoordinateChange])

    useEffect(() => {
        setIsCoordExist(false);
        mapRef.current.removeLayer(vectorLayer);
    }, [id])

    useEffect(() => {
        vectorLayer && inputCoordChenged();
    }, [latitude, longtitude, vectorLayer])

    const init = () => {
        let startcoords = fromLonLat([85.9075867, 53.1155423]);

        //Создаем вид
        let view = new View({
            center: startcoords,
            zoom: 10
        });

        // Базовый слой карты
        const baseLayer = new TileLayer();
        const _default = onCoordinateChange ? "ArcGis_World_Topo_Map" : "OSM";
        baseLayer.setSource(getMapLayers(_default, locale));
        setSelectedLayer(_default);

        mapRef.current = new OLMap({
            layers: [baseLayer],
            target: mapElement.current,
            view: view,
            controls: []
        });
        setBaseLayer(baseLayer);
        //Геометрия метки
        const selectedPointGeom = new Point(startcoords);
        setSelectedPointGeom(selectedPointGeom);

        //Создаем метку
        const selectedPoint = new Feature({
            geometry: selectedPointGeom,
        });

        let pointStyle = getIconStyleByLayerName(type);
        selectedPoint.setStyle(pointStyle);

        //Слой метки
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [selectedPoint]
            })
        });
        setVectorLayer(vectorLayer);
    }

    const addMapListeners = () => {
        mapRef.current.addEventListener('click', handleMapClick)
    }

    const removeMapListeners = () => {
        mapRef.current.removeEventListener('click', handleMapClick)
    }

    const handleMapClick = (e) => {
        const clickCoordinate = e.coordinate;
        const newCord = toLonLat(clickCoordinate);
        onCoordinateChange({ latitude: newCord[1], longtitude: newCord[0] });
    }

    const inputCoordChenged = () => {
        //если координаты не определены
        if (latitude === "" || longtitude === "") {
            setIsCoordExist(false);
            mapRef.current.removeLayer(vectorLayer);
            return;
        }
        const newCord = fromLonLat([longtitude, latitude]);

        //если координаты не действительны
        if (isNaN(newCord[0]) || isNaN(newCord[1])) {
            mapRef.current.removeLayer(vectorLayer);
            return;
        }
        //Проверяем есть ли метка на карте
        if (!isCoordExist) {
            //Добавляем метку на карту
            mapRef.current.addLayer(vectorLayer);
            setIsCoordExist(true);
        }

        //Изменяем позицию метки
        selectedPointGeom?.setCoordinates(newCord);

        //Удаляем все запущенные анимации
        mapRef.current.getView().cancelAnimations();

        //Запускаем анимацию перемещения к метки
        mapRef.current.getView().animate({ duration: 500 }, { center: newCord });
    }

    //Создает стиль иконки по типу слоя
    const getIconStyleByLayerName = (type) => {
        return createIconStyle(type)
    }

    const handleBaseLayerChange = (layer) => {
        baseLayer.setSource(getMapLayers(layer, locale));
        setSelectedLayer(layer);
    }

    //Создает стиль иконки по Url
    const createIconStyle = (layerName) => {
        if (layerName === 'soil') {
            return new Style({
                image: new RegularShape({
                    stroke: new Stroke({ color: 'rgba(153, 51, 0, 1)', width: 1.7 }),
                    fill: new Fill({ color: 'rgba(153, 51, 0, 0.7)' }),
                    points: 4, // Количество углов (4 для квадрата)
                    radius: 20, // Радиус квадрата
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
                    radius: 20, // Радиус квадрата
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
                    radius: 20, // Радиус квадрата
                    angle: Math.PI / 4, // Угол поворота
                }),
                zIndex: 1
            });
        }
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

    const handleFullClick = () => {
        if (mapElement.current.requestFullscreen) {
            mapElement.current.requestFullscreen();
        } else if (mapElement.current.mozRequestFullScreen) {
            mapElement.current.mozRequestFullScreen();
        } else if (mapElement.current.webkitRequestFullscreen) {
            mapElement.current.webkitRequestFullscreen();
        } else if (mapElement.current.msRequestFullscreen) {
            mapElement.current.msRequestFullscreen();
        }
    }

    return (
        <div ref={mapElement} className="w-full h-full z-10 relative">
            <div className='z-30 absolute top-0 right-0 m-2 sm:block hidden'>
                {/* <FullScreen onClick={handleFullClick} /> */}
                <LayersPanel onLayerChange={handleBaseLayerChange} currentLayer={selectedLayer} />
            </div>
            <div className='z-20 absolute top-[calc(50%-50px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
        </div>
    )
})
export default MapSelect;
