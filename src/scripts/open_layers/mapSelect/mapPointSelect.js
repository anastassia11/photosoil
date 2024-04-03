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
import $ from "jquery";



window.CreatePointSelectMap = function (mapDivId, latitudeDecSelector, longtitudeDecSelector, latitudeMinSecSelector, longtitudeMinSecSelector, sumbitbuttonSelector) {

    var isCoordExist = false;
    const startLonLat = [85.9075867, 53.1155423];
    const startcoords = fromLonLat(startLonLat);

    //Создаем вид
    const view = new View({
        center: startcoords,
        zoom: 10
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

    document.getElementById('fullScreenButton').onclick = function () {
        const mapDiv = document.getElementById(mapDivId);
        if (mapDiv.requestFullscreen) {
            mapDiv.requestFullscreen();
        } else if (mapDiv.mozRequestFullScreen) {
            mapDiv.mozRequestFullScreen();
        } else if (mapDiv.webkitRequestFullscreen) {
            mapDiv.webkitRequestFullscreen();
        } else if (mapDiv.msRequestFullscreen) {
            mapDiv.msRequestFullscreen();
        }
    };

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

    //Получаем input для координат
    const latitudeDec = $(latitudeDecSelector);
    const longtitudeDec = $(longtitudeDecSelector);
    const latitudeMinSec = $(latitudeMinSecSelector);
    const longtitudeMinSec = $(longtitudeMinSecSelector);
    onInputCoordChenged();
    //Обработчик изменения координат через input
    function onInputCoordChenged() {
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
        /*latitudeMinSec.val(degreesToStringHDMS('NS', latitudeDec.val(), 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', longtitudeDec.val(), 3));*/
    }

    //Когда пользователь кликнул по карте
    map.on('click', function (evt) {
        const clickCoordinate = evt.coordinate;
        const newCord = toLonLat(clickCoordinate);
        longtitudeDec.val(newCord[0]);
        latitudeDec.val(newCord[1]);
        latitudeMinSec.val(degreesToStringHDMS('NS', newCord[1], 3));
        longtitudeMinSec.val(degreesToStringHDMS('EW', newCord[0], 3));
        selectedPointGeom.setCoordinates(clickCoordinate);
        //Проверяем есть ли метка на карте
        if (!isCoordExist) {
            //Добавляем метку на карту
            map.addLayer(vectorLayer);
            isCoordExist = true;
        }
    });

    latitudeDec.on('input', function () {
        onInputCoordChenged();
    });
    longtitudeDec.on('input', function () {
        onInputCoordChenged();
    });

    //Если координаты не действительны то перед отправкой формы чистим все поля
    $(sumbitbuttonSelector).on('click', function () {
        if (!isCoordExist) {
            longtitudeDec.val('');
            latitudeDec.val('');
            latitudeMinSec.val('');
            longtitudeMinSec.val('');
        }
    });

}

window.LanLotToDegHelper = function (lon, lat) {
    let latdeg = degreesToStringHDMS('NS', lat, 3);
    let londeg = degreesToStringHDMS('EW', lon, 3);
    return { lon: londeg, lat: latdeg };
}





