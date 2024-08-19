'use select'

import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';
import { useEffect, useRef, useState } from 'react';
import FullScreen from './FullScreen';
import Zoom from './Zoom';

export default function MapSelect({ id, type, latitude, longtitude, onCoordinateChange }) {
    const didLogRef = useRef(false);
    const mapElement = useRef();
    const [isCoordExist, setIsCoordExist] = useState(false);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [selectedPointGeom, setSelectedPointGeom] = useState(null);

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

        mapRef.current = new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                })
            ],
            target: mapElement.current,
            view: view,
            controls: []
        });

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
        if (type === "publication") {
            return createIconStyle('/publ-marker.svg');
        }
        if (type === "ecosystem") {
            return createIconStyle('/ecosystem-marker.svg');
        }
        if (type === "soil") {
            return createIconStyle('/soil-marker.svg');
        }
        return createIconStyle('/map-marker.svg');
    }


    //Создает стиль иконки по Url
    const createIconStyle = (iconUrl, scale = 0.15) => {
        return new Style({
            image: new Icon({
                anchor: [0.5, 1],
                scale: scale,
                src: iconUrl
            }),
        });
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
            <div className='z-20 absolute top-0 right-0 m-2 sm:block hidden'>
                <FullScreen onClick={handleFullClick} />
            </div>
            <div className='z-20 absolute top-[calc(50%-50px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
        </div>
    )
}
