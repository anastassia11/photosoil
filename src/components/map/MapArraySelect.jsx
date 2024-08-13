'use select'

import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { LineString, Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import FullScreen from './FullScreen';
import Zoom from './Zoom';

function MapArraySelect({ coordinates, onInputChange, onCoordinatesChange }, ref) {
    const didLogRef = useRef(false);
    const mapElement = useRef();

    const selectedPointFeature = useRef(null);
    const mapRef = useRef(null);
    const modifyRef = useRef(null);

    const [isDataLoaded, setIsDataLoaded] = useState(false);

    //Стиль невыбранных точек
    const basePointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.15,
            src: '/publ-marker.svg'
        }),
    });

    //Стиль выбранных точек
    const selectedPointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.15,
            src: '/publ-marker_v2.svg'
        }),
    });

    //Источник данных точек
    const [pointVectorSource, setPointVectorSource] = useState(new VectorSource({}));

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
            document.addEventListener('DOMContentLoaded', initializeMap);
        }
        onInputChange && addListeners();
        return () => {
            document.removeEventListener('DOMContentLoaded', initializeMap);
            onInputChange && removeListeners();
        }
    }, [])

    useEffect(() => {
        if (!isDataLoaded && coordinates && coordinates.length > 0) {
            loadStartData();
            setIsDataLoaded(true);
        }
    }, [coordinates])

    useImperativeHandle(ref, () => ({
        deleteCurrentPoint
    }))

    const init = () => {
        let startcoords = fromLonLat([85.9075867, 53.1155423]);

        //Создаем вид
        let view = new View({
            center: startcoords,
            zoom: 6.5
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

        modifyRef.current = new Modify({ source: pointVectorSource });
        mapRef.current.addInteraction(modifyRef.current);

        //добавляем функцию привязки к точке
        const snap = new Snap({ source: pointVectorSource });
        mapRef.current.addInteraction(snap);

        //Слой точек метки
        const pointVectorLayer = new VectorLayer({
            source: pointVectorSource
        });

        //добавляем слой точек
        mapRef.current.addLayer(pointVectorLayer);
    }

    const addListeners = () => {
        mapRef.current.addEventListener('click', handleMapClick);
        modifyRef.current.addEventListener('modifyend', handleModifyend);
    }

    const removeListeners = () => {
        mapRef.current.removeEventListener('click', handleMapClick);
        modifyRef.current.removeEventListener('modifyend', handleModifyend);
    }

    const deleteCurrentPoint = () => {
        if (selectedPointFeature.current) {
            pointVectorSource.removeFeature(selectedPointFeature.current);
            selectedPointFeature.current = null;
        }

        const features = pointVectorSource.getFeatures();
        if (features.includes(selectedPointFeature.current)) {
            pointVectorSource.removeFeature(selectedPointFeature.current);
        }

    }

    const handleMapClick = (e) => {
        //сбрасываем стиль прошлого выделения
        if (selectedPointFeature.current) {
            selectedPointFeature.current.setStyle(basePointStyle);
            //сбрасываем прошлое выделение
            selectedPointFeature.current = null;
        }

        //проверяем кликнули ли мы по существующей точке
        mapRef.current.forEachFeatureAtPixel(e.pixel, function (f) {
            //выделяем точку и устанавливаем стиль выделения
            f.setStyle(selectedPointStyle);
            selectedPointFeature.current = f;
            selectedPointFeature.current.setStyle(selectedPointStyle);
            return true;
        });

        //создаем новую точку
        if (selectedPointFeature.current == null) {
            const clickCoordinate = e.coordinate;
            const newCord = toLonLat(clickCoordinate);
            const newPointFeature = new Feature({
                geometry: new Point(clickCoordinate)
            });
            //устанавливаем стиль новой точки
            newPointFeature.setStyle(selectedPointStyle);
            //добавляем её на слой
            pointVectorSource.addFeature(newPointFeature);
            //делаем точку выделенной
            selectedPointFeature.current = newPointFeature;
        }

        //обновляем текстбоксы
        onSelectedPointFeatureChenged();
    }

    const handleModifyend = (e) => {
        //сбрасываем старое выделение
        if (selectedPointFeature.current) {
            selectedPointFeature.current.setStyle(basePointStyle);
            selectedPointFeature.current = null;
        }
        //выделяем точку которая движется
        selectedPointFeature.current = e.features.getArray()[0];
        selectedPointFeature.current.setStyle(selectedPointStyle);

        //обновляем данные в текстбоксе
        onSelectedPointFeatureChenged();
    }

    function onSelectedPointFeatureChenged() {
        let coords = toLonLat(selectedPointFeature.current.getGeometry().getCoordinates());
        onInputChange({
            latitude: coords[1],
            longtitude: coords[0]
        })

        generateJson();
    }

    //генерирует json 
    function generateJson() {
        //Массив всех обьектов для экспорта
        let datarouts = [];
        //все точки
        let features = pointVectorSource.getFeatures();

        for (let i = 0; i < features.length; i++) {
            let coords = toLonLat(features[i].getGeometry().getCoordinates());
            let point = {
                latitude: coords[1],
                longtitude: coords[0],
            };
            datarouts.push(point);
        }
        onCoordinatesChange(datarouts);
    }

    function loadStartData() {
        for (let i = 0; i < coordinates.length; i++) {
            const newPointFeature = new Feature({
                geometry: new Point(fromLonLat([coordinates[i].longtitude, coordinates[i].latitude]))
            });
            //устанавливаем стиль новой точки
            newPointFeature.setStyle(!onInputChange ? selectedPointStyle : basePointStyle);
            //добавляем её на слой
            pointVectorSource.addFeature(newPointFeature);
        }
        if (coordinates.length > 0) {
            const routLineVectorSource = new VectorSource();
            var coords = pointVectorSource.getFeatures().map(function (item) {
                return item.getGeometry().getCoordinates();
            });
            const routLineFeature = new Feature(
                new LineString(coords)
            );
            routLineVectorSource.addFeature(routLineFeature);
            mapRef.current.getView().fit(routLineVectorSource.getFeatures()[0].getGeometry(),
                {
                    padding: [30, 30, 30, 30],
                    maxZoom: 6.5
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
            <div className='z-20 absolute top-0 right-0 m-2 sm:block hidden'>
                <FullScreen onClick={handleFullClick} />
            </div>
            <div className='z-20 absolute top-[calc(50%-50px)] right-0 m-2 '>
                <Zoom onClick={handleZoomClick} />
            </div>
        </div>
    )
}

export default forwardRef(MapArraySelect)
