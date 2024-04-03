import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { LineString, Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';



window.CreateRoutViewMap = function (mapDivId, routJsonSelector) {

    const startLonLat = [85.9075867, 53.1155423];
    const startcoords = fromLonLat(startLonLat);

    //Создаем вид
    const view = new View({
        center: startcoords,
        zoom: 6.5
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

    //Стиль невыбранных точек
    const basePointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.15,
            src: '/img/ui/mapicons/map-marker_v1.svg'
        }),
    });

    //Стиль выбранных точек
    const selectedPointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.15,
            src: '/img/ui/mapicons/map-marker.svg'
        }),
    });

    //Источник данных точек
    const pointVectorSource = new VectorSource({});

    //Слой точек метки
    const pointVectorLayer = new VectorLayer({
        source: pointVectorSource
    });

    //добавляем слой точек
    map.addLayer(pointVectorLayer);

    //Источник данных для линии пути
    const routLineVectorSource = new VectorSource();

    //Слой линии пути
    const routLineVectorLayer = new VectorLayer({
        source: routLineVectorSource
    });
    map.addLayer(routLineVectorLayer);

    loadStartData();

    function loadStartData() {
        if ($(routJsonSelector).val() === "") {
            return;
        }

        var datarouts = JSON.parse($(routJsonSelector).val()).sort(function (x, y) {
            return x.poz - y.poz;
        });
        for (var i = 0; i < datarouts.length; i++) {

            const newPointFeature = new Feature({
                geometry: new Point(fromLonLat([datarouts[i].lon, datarouts[i].lat]))
            });
            //устанавливаем стиль новой точки
            newPointFeature.setStyle(basePointStyle);
            //добавляем её на слой
            pointVectorSource.addFeature(newPointFeature);
            //привязываем дополнительные параметры к точке 
            //Описание введенное пользователем
            newPointFeature.set("disc", datarouts[i].disc);
            //позиция точки в маршруте
            newPointFeature.set("poz", datarouts[i].poz);
            updateRoutLine();
        }
        if (datarouts.length > 0) {
            view.fit(routLineVectorSource.getFeatures()[0].getGeometry(), { padding: [30, 30, 30, 30] });
        }

    }


    //Обновляет линии пути при изменении точек
    function updateRoutLine() {
        //сортируем элементы по возрастанию позиции
        var sortcoords = pointVectorSource.getFeatures().sort(function (x, y) {
            return x.get("poz") - y.get("poz");
        }).map(function (item) {
            return item.getGeometry().getCoordinates();
        });

        var routLineFeature = new Feature(
            new LineString(sortcoords)
        );
        routLineVectorSource.clear();
        routLineVectorSource.addFeature(routLineFeature);

    }
}



