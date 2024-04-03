import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';




window.CreatePointViewMap = function (mapDivId, latDec,lonDec) {

    var isCoordExist = true;

    //если координаты пустые
    if (latDec === "" || lonDec === "") {
        isCoordExist = false;
    }

    var startcoords = fromLonLat([lonDec, latDec]);

    //если координаты не действительны
    if (isNaN(startcoords[0]) || isNaN(startcoords[1])) {
        isCoordExist = false;
        startcoords = fromLonLat([85.9075867, 53.1155423]);
    }

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
        view: view
    });

    if (isCoordExist) {
        //Геометрия метки
        const selectedPointGeom = new Point(startcoords);

        //Создаем метку
        const selectedPoint = new Feature({
            geometry: selectedPointGeom,
        });

        //Стиль метки
        selectedPoint.setStyle(
            new Style({
                image: new Icon({
                    anchor: [0.5, 1],
                    scale: 0.15,
                    src: '/img/ui/mapicons/map-marker.svg'
                }),
            })
        );

        //Слой метки
        const vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [selectedPoint]
            })
        });

        map.addLayer(vectorLayer);
    }
}





