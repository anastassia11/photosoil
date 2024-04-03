import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Icon, Style } from 'ol/style';
import { Modify } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, Vector as VectorSource } from 'ol/source';
import { toStringHDMS, degreesToStringHDMS } from 'ol/coordinate';




window.CreateSamplPointOrCoordSelectMap = function (mapDivId, latitudeDecSelector, longtitudeDecSelector, latitudeMinSecSelector, longtitudeMinSecSelector, sumbitbuttonSelector, samplPointIdSelector) {

    var isCoordExist = false;
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

    const basePointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.1,
            src: '/img/ui/mapicons/map-marker_v1.svg'
        }),
    });

    //Стиль выбранных точек
    const selectedPointStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: 0.1,
            src: '/img/ui/mapicons/map-marker.svg'
        }),
    });

    //Геометрия метки
    const selectedPointGeom = new Point(startcoords);

    //Создаем метку
    const selectedPoint = new Feature({
        geometry: selectedPointGeom,
    });

    //Стиль метки
    selectedPoint.setStyle(selectedPointStyle);

    //Слой метки
    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            features: [selectedPoint]
        })
    });

    //Получаем input для координат
    const latitudeDec = $(latitudeDecSelector);
    const longtitudeDec = $(longtitudeDecSelector);
    const latitudeMinSec = $(latitudeMinSecSelector);
    const longtitudeMinSec = $(longtitudeMinSecSelector);

    const samplPointId = $(samplPointIdSelector);

    var selectedPointFeature = null;

    const probeLayer = getProbesLayer();

    map.addLayer(probeLayer);

    onInputCoordChenged(false);

    //Обработчик изменения координат через input
    function onInputCoordChenged(setIdNull = true) {
        //если координаты не определены
        if (latitudeDec.val() === "" || longtitudeDec.val() === "") {
            isCoordExist = false;
            map.removeLayer(vectorLayer);
            latitudeMinSec.val("");
            longtitudeMinSec.val("");
            return;
        }
        const newCord = fromLonLat([longtitudeDec.val(), latitudeDec.val()]);
        //если координаты не действительны
        if (isNaN(newCord[0]) || isNaN(newCord[1])) {
            isCoordExist = false;
            map.removeLayer(vectorLayer);
            latitudeMinSec.val("");
            longtitudeMinSec.val("");
            return;
        }
        //Проверяем есть ли метка на карте
        if (!isCoordExist) {
            //Добавляем метку на карту
            map.addLayer(vectorLayer);
            isCoordExist = true;
        }
        //Изменяем позицию метки
        selectedPointGeom.setCoordinates(newCord);
        //view.fit(point, { padding: [170, 50, 30, 150], minResolution: 50 });
        //Удаляем все запущенные анимации
        view.cancelAnimations();
        //Запускаем анимацию перемещения к метки
        view.animate({ duration: 500 }, { center: newCord });
        //latitudeMinSec.val(toStringHDMS(newCord));
        //Обновляем координаты в градусах

        var coords = toLonLat(selectedPointGeom.getCoordinates());
        latitudeMinSec.val(degreesToStringHDMS('NS', coords[1], 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', coords[0], 3));
        if (setIdNull) samplPointId.val("null");
        if (selectedPointFeature !== null) { selectedPointFeature.setStyle(basePointStyle) }
        /*latitudeMinSec.val(degreesToStringHDMS('NS', latitudeDec.val(), 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', longtitudeDec.val(), 3));*/
    }

   

    //Когда пользователь кликнул по карте
    map.on('click', function (e) {

        var createNew = true;

        //проверяем кликнули ли мы по существующей точке
        map.forEachFeatureAtPixel(e.pixel, function (f) {
            if (selectedPointFeature !== null) { selectedPointFeature.setStyle(basePointStyle)}
            //если кликнули то выделяем точку и устанавливаем стиль выделения
            selectedPointFeature = f;
            f.setStyle(selectedPointStyle);
            samplPointId.val(f.get("p_Id"));

            var coords = toLonLat(selectedPointFeature.getGeometry().getCoordinates());
            longtitudeDec.val(coords[0]);
            latitudeDec.val(coords[1]);
            latitudeMinSec.val(degreesToStringHDMS('NS', coords[1], 3));
            longtitudeMinSec.val(degreesToStringHDMS('EW', coords[0], 3));

            isCoordExist = false;
            map.removeLayer(vectorLayer);
            createNew = false;
            return true;
        });

        //selectedPointFeature = null;

        //если не кликнули - то создаем новую точку
        //if (selectedPointFeature == null) {
        if (createNew) {
            if (selectedPointFeature !== null) { selectedPointFeature.setStyle(basePointStyle) }
            const clickCoordinate = e.coordinate;
            const newCord = toLonLat(clickCoordinate);
            longtitudeDec.val(newCord[0]);
            latitudeDec.val(newCord[1]);
            latitudeMinSec.val(degreesToStringHDMS('NS', newCord[1], 3));
            longtitudeMinSec.val(degreesToStringHDMS('EW', newCord[0], 3));
            samplPointId.val("null");
            selectedPointGeom.setCoordinates(clickCoordinate);
            //Проверяем есть ли метка на карте
            if (!isCoordExist) {
                //Добавляем метку на карту
                map.addLayer(vectorLayer);
                isCoordExist = true;
            }

        }


        
    });

    latitudeDec.on('input', function () {
        onInputCoordChenged();
    });
    longtitudeDec.on('input', function () {
        onInputCoordChenged();
    });

    //Если координаты не действительны то перед отправкой формы чистим все поля
    $(sumbitbuttonSelector).click(function () {
        if (!isCoordExist) {
            longtitudeDec.val('');
            latitudeDec.val('');
            latitudeMinSec.val('');
            longtitudeMinSec.val('');
        }
    });


    function getProbesLayer() {
        var layerName = "Probes";
        var layerVectorSource = new VectorSource();

        var url = `/api/MapLayers/Get${layerName}`;
        $.getJSON(url, function (data) {

            var layerStyle = basePointStyle;

            for (var i = 0; i < data.length; i++) {
                //создаем новую точку
                var newPointFeature = new Feature({
                    geometry: new Point(fromLonLat([data[i].lon, data[i].lat]))
                });
                newPointFeature.set("p_Id", data[i].id);
                newPointFeature.set("p_type", data[i].type);
                //устанавливаем стиль
                newPointFeature.setStyle(layerStyle);

                layerVectorSource.addFeature(newPointFeature);
            }
        });
        return new VectorLayer({
            source: layerVectorSource,
            //zIndex: layerZIndex
        });
    }
}







