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
import { toStringHDMS, degreesToStringHDMS } from 'ol/coordinate';



window.CreateRoutSelectMap = function (mapDivId, latitudeDecSelector, longtitudeDecSelector, latitudeMinSecSelector, longtitudeMinSecSelector, discriptionSelector, routJsonSelector, clearAllPointsSelector, removeLastPointSelector) {
    
    const startLonLat = [85.9075867, 53.1155423];
    const startcoords = fromLonLat(startLonLat);

    var currentpozition = 0;

    var selectedPointFeature = null;

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
            //обновляем глобальный счетчик позиций
            currentpozition++;
            updateRoutLine();
        }
        if (datarouts.length>0) {
            view.fit(routLineVectorSource.getFeatures()[0].getGeometry(), { padding: [30,30,30,30] });
        }
        
    }


    //Обновляет линии пути при изменении точек
    function updateRoutLine() {
        var features = pointVectorSource.getFeatures();
        //сортируем элементы по возрастанию позиции
        var sortcoords = pointVectorSource.getFeatures().sort(function (x, y) {
            return x.get("poz") - y.get("poz");
        }).map(function(item) {
            return item.getGeometry().getCoordinates();
        });
        
        var routLineFeature = new Feature(
            new LineString(sortcoords)
        );
        routLineVectorSource.clear();
        routLineVectorSource.addFeature(routLineFeature);
        
    }

    //добавляем функцию для перетаскивания точек
    const modify = new Modify({ source: pointVectorSource });
    map.addInteraction(modify);

    //При перетаскивании точек
    modify.on('modifyend',
        function (e) {
            //сбрасываем старое выделение
            if (selectedPointFeature !== null) {
                selectedPointFeature.setStyle(basePointStyle);
                selectedPointFeature = null;
            }
            //выделяем точку которая движеться
            selectedPointFeature = e.features.getArray()[0];
            selectedPointFeature.setStyle(selectedPointStyle);
            //обновляем данные в текстбоксе
            onSelectedPointFeatureChenged();
        });

    //добавляем функцию привязки к точке
    const snap = new Snap({ source: pointVectorSource });
    map.addInteraction(snap);

    //при клике на карте
    map.on('click', function (e) {
        //сбрасываем стиль прошлого выделения
        if (selectedPointFeature !== null) {
            selectedPointFeature.setStyle(basePointStyle);
            //сбрасываем прошлое выделение
            selectedPointFeature = null;
        }

        //проверяем кликнули ли мы по существующей точке
        map.forEachFeatureAtPixel(e.pixel, function (f) {
            //если кликнули то выделяем точку и устанавливаем стиль выделения
            selectedPointFeature = f;
            f.setStyle(selectedPointStyle);
            return true;
        });

        //если не кликнули - то создаем новую точку маршрута
        if (selectedPointFeature == null) {
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
            selectedPointFeature = newPointFeature;
            //привязываем дополнительные параметры к точке 
            //Описание введенное пользователем
            selectedPointFeature.set("disc", "");
            //позиция точки в маршруте
            selectedPointFeature.set("poz", currentpozition);
            //обновляем глобальный счетчик позиций
            currentpozition++;

        }

        //обновляем текстбоксы
        onSelectedPointFeatureChenged();
    });

    //Получаем input для координат
    const latitudeDec = $(latitudeDecSelector);
    const longtitudeDec = $(longtitudeDecSelector);
    const latitudeMinSec = $(latitudeMinSecSelector);
    const longtitudeMinSec = $(longtitudeMinSecSelector);
    const discription = $(discriptionSelector);
    const routJson = $(routJsonSelector);

    //Обработчик изменения координат через input
    function onInputCoordChenged() {
        //если координаты не определены
        if (latitudeDec.val() === "" || longtitudeDec.val() === "") {
            return;
        }
        const newCord = fromLonLat([longtitudeDec.val(), latitudeDec.val()]);
        //если координаты не действительны
        if (isNaN(newCord[0]) || isNaN(newCord[1])) {
            return;
        }
        //Изменяем позицию метки
        selectedPointFeature.getGeometry().setCoordinates(newCord);
        //Устанавливаем описание
        selectedPointFeature.set("disc", discription.val());
        //обновляем координаты в минутах
        var coords = toLonLat(selectedPointFeature.getGeometry().getCoordinates());
        latitudeMinSec.val(degreesToStringHDMS('NS', coords[1], 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', coords[0], 3));
        //генерируем Json
        generateJson();
        updateRoutLine();
    }

    //Привязываем события изменения в текстбоксах
    latitudeDec.on('input', function () {
        onInputCoordChenged();
    });
    longtitudeDec.on('input', function () {
        onInputCoordChenged();
    });
    discription.on('input', function () {
        onInputCoordChenged();
    });

    //обновляет данные в текстбоксе при изменении выбранного элемента
    function onSelectedPointFeatureChenged() {
        var coords = toLonLat(selectedPointFeature.getGeometry().getCoordinates());
        longtitudeDec.val(coords[0]);
        latitudeDec.val(coords[1]);
        latitudeMinSec.val(degreesToStringHDMS('NS', coords[1], 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', coords[0], 3));
        discription.val(selectedPointFeature.get("disc"));
        generateJson();
        updateRoutLine();
    }

    //генерирует json 
    function generateJson() {
        //Массив всех обьектов для экспорта
        var datarouts = [];
        //все точки
        var features = pointVectorSource.getFeatures();

        for (var i = 0; i < features.length; i++) {
            var coords = toLonLat(features[i].getGeometry().getCoordinates());
            var point = {
                poz: features[i].get("poz"),
                lat: coords[1],
                lon: coords[0],
                latmin: degreesToStringHDMS('NS', coords[1], 3),
                lonmin: degreesToStringHDMS('NS', coords[0], 3),
                disc: features[i].get("disc")
            };
            datarouts.push(point);
        }
        routJson.val(JSON.stringify(datarouts));
    }
    
    //отчистить все точки
    $(clearAllPointsSelector).click(function () {
        pointVectorSource.clear();
        selectedPointFeature = null;
        currentpozition = 0;
        longtitudeDec.val('');
        latitudeDec.val('');
        latitudeMinSec.val('');
        longtitudeMinSec.val('');
        discription.val('');
        routJson.val('');
        updateRoutLine();
    });

    //удалить последнюю точку
    $(removeLastPointSelector).click(function () {
        var features = pointVectorSource.getFeatures();
        var lastfeature = features.find(function (e) {
            return e.get("poz") === currentpozition - 1;
        });
        if (lastfeature) {
            pointVectorSource.removeFeature(lastfeature);
            currentpozition--;
        }
        generateJson();
        updateRoutLine();
    });

    



}



