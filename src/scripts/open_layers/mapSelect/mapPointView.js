import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';
import $ from "jquery";

window.CreatePointViewMap = function (mapDivId, latDec, lonDec) {
    var isCoordExist = true;

    //если координаты пустые
    if (latDec === "" || lonDec === "") {
        console.log('координаты пустые')
        isCoordExist = false;
    }

    var startcoords = fromLonLat([lonDec, latDec]);

    //если координаты не действительны
    if (isNaN(startcoords[0]) || isNaN(startcoords[1])) {
        console.log('координаты не действительны')
        isCoordExist = false;
        startcoords = fromLonLat([85.9075867, 53.1155423]);
    }
    console.log(startcoords)
    //Создаем вид
    const view = new View({
        center: startcoords,
        zoom: 8.5
    });

    //создаем новую карту
    const map = new Map({
        layers: [
            new TileLayer({
                source: new OSM()
            })
        ],
        target: mapDivId,
        view: view,
        controls: []
    });

    let zoomType;
    document.getElementById('customZoomOut').onclick = function () {
        zoomType = "customZoomOut";
    };
    document.getElementById('customZoomIn').onclick = function () {
        zoomType = "customZoomIn";
    };

    $(document).on('click', ".customZoom", function (e) {
        if (zoomType == "customZoomOut") {
            let view = map.getView();
            let zoom = view.getZoom();
            view.animate({ zoom: zoom - 1 })
        }
        if (zoomType == "customZoomIn") {
            let view = map.getView();
            let zoom = view.getZoom();
            view.animate({ zoom: zoom + 1 })
        }
    });

    if (isCoordExist) {
        //Геометрия метки
        const selectedPointGeom = new Point(startcoords);
        console.log(selectedPointGeom)

        //Создаем метку
        const selectedPoint = new Feature({
            geometry: selectedPointGeom,
        });
        console.log(selectedPoint)

        //Стиль метки
        selectedPoint.setStyle(
            new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    scale: 0.15,
                    src: '/map-marker.svg'
                }),
            })
        );

        //Слой метки
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [selectedPoint]
            })
        });
        console.log(vectorLayer);
        map.addLayer(vectorLayer);
    }
}





