import 'ol/ol.css';
import Feature from 'ol/Feature';
import OLMap from 'ol/Map';
import { LineString, Point } from 'ol/geom';
import View from 'ol/View';
import { Icon, Style, Fill, Stroke } from 'ol/style';
import { Tile as TileLayer, Vector as VectorLayer, VectorImage as VectorImageLayer, } from 'ol/layer';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM,Cluster, XYZ, BingMaps, Vector as VectorSource } from 'ol/source';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import { get as getProjection, getTransform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import { ZoomSlider } from 'ol/control.js';
import proj4 from 'proj4';
import randomColor from 'randomcolor';
import $ from "jquery";
import Control from 'ol/control/Control';
import { BASE_SERVER_URL } from '@/utils/constants';
import {
    Circle as CircleStyle,
    Text,
  } from 'ol/style.js';




window.Create2dMap = function (mapDivId) {


    proj4.defs("EPSG:32647", "+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32645", "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32644", "+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32642", "+proj=utm +zone=42 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32646", "+proj=utm +zone=46 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4);

    let startcoords = fromLonLat([85.9075867, 53.1155423]);

    //Создаем вид
    let view = new View({
        center: startcoords,
        zoom: 8.5
    });
 

    window.selectLocationHandler = function (item) {
        const newCord = fromLonLat([item.lon, item.lat]);

        view.animate({ duration: 500 }, { center: newCord, extent: extent,zoom:view.getZoom + 10});
    }
    


        
    // document.getElementById('btnsearch').onclick = function () {
    //     var searchstring = document.getElementById('search').value
    //     const params = {
    //         q:searchstring,
    //         format: 'json',
    //         addressdetails: 1,
    //         polygon_geojson:0
    //     }
    //     const queryString = new URLSearchParams(params).toString();
    //     const requestOptions ={
    //         method:"GET",
    //         redirect: "follow"
    //     }
    //     var result = fetch(`https://nominatim.openstreetmap.org/search?${queryString}`,requestOptions)
    //         .then((response) => response.text())
    //         .then((result)=> JSON.parse(result))
    //         .then((result) =>{
    //             const newCord = fromLonLat([result[0].lon, result[0].lat]);
    //             console.log(result)

    //             //view.fit(result[0], { duration: 500 });

    //             view.animate({ duration: 500 }, { center: newCord});
    //         })
    //         .catch((err)=>console.log("err", err))
    
    //         console.log(result);
    
    // };




    //Базовый слой карты
    const baseLayer = new TileLayer();




    const count = 20000;
    const features = new Array(count);
    const e = 4500000;
    for (let i = 0; i < count; ++i) {
      const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
      features[i] = new Feature(new Point(coordinates));
    }
    
    const source = new VectorSource({
      features: features,
    });

    const clusterSource = new Cluster({
        distance: parseInt(1000, 10),
        minDistance: parseInt(5, 10),
        source: source,
      });

      const styleCache = {};
      const clusters = new VectorLayer({
        source: clusterSource,
        style: function (feature) {
          const size = feature.get('features').length;
          let style = styleCache[size];
          if (!style) {
            style = new Style({
              image: new CircleStyle({
                radius: 10,
                stroke: new Stroke({
                  color: '#fff',
                }),
                fill: new Fill({
                  color: '#3399CC',
                }),
              }),
              text: new Text({
                text: size.toString(),
                fill: new Fill({
                  color: '#fff',
                }),
              }),
            });
            styleCache[size] = style;
          }
          return style;
        },
      });



    //создаем новую карту
    const map = new OLMap({
        layers: [baseLayer,clusters],
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


    //////////////**************************//////////////
    //////////////Преобразования координат/////////////
    let fromProjToWgs = getTransform(view.getProjection(), 'EPSG:4326');
    let fromWgsToProj = getTransform('EPSG:4326', view.getProjection());

    //Устанавливаем базовый слой
    baseLayer.setSource(getBaseLayerSourse("OSM"));

    //Отслеживание события изменения базового слоя
    $(document).on("click", ".baseLayerSelector", function (e) {
        baseLayer.setSource(getBaseLayerSourse($(this).data("scrtype")));
        $(".baseLayerButtonText").html($(this).html());
    });

    //Отслеживание события изменения проекции
    $(".projSelector").on("click", function (e) {
        let prjKey = $(this).data("scrtype");
        //const newProjection = getProjection(getBaseLayerSourse($(this).data("scrtype")));
        //const newProjection = getProjection("EPSG:32647");
        let newProjection = getProjection(prjKey);
        newProjection.setWorldExtent(getProjWorldExcent(prjKey));
        newProjection.setExtent(getProjExcent(prjKey));
        updateCoordTransforms(newProjection);
        let oldProjection = view.getProjection();
        let fromOldProjToNew = getTransform(oldProjection, newProjection);
        //Переводим векторные обьекты в новую систему координат
        tramsformVectorCoords(oldProjection, newProjection);
        let newview = new View({
            center: fromOldProjToNew(view.getCenter()),
            zoom: view.getZoom(),
            projection: newProjection
        });
        map.setView(newview);
        $(".projButtonText").html($(this).html());
        view = newview;

    });





    //Функция преобразования координат в WGS
    function updateCoordTransforms(newProjection) {
        fromProjToWgs = getTransform(newProjection, 'EPSG:4326');
        fromWgsToProj = getTransform('EPSG:4326', newProjection);
    }

    let layers = new Map();
    loadLayers();
    //Загружает слои
    function loadLayers() {
        layers.set('SoilObjects', getLayer('SoilObject', fromWgsToProj));
        layers.set('EcoSystem', getLayer('EcoSystem', fromWgsToProj));
        layers.set('Publication', getLayer('Publication', fromWgsToProj));
        for (let lay of layers.values()) {
            map.addLayer(lay);
            lay.setZIndex(5);
        }

    }
    //Отслеживает изменения выбранных слоев
    $(".layerCheker").on("change", function (e) {
        //Получаем чекбокс по которому кликнули
        let prjKey = $(this).data("scrtype");
        //Получаем слой
        let currentLayer = layers.get(prjKey);
        //Если слой существует
        if (currentLayer) {
            let isCheced = $(this).prop('checked');
            currentLayer.setVisible(isCheced);
        }
        if (prjKey === "GeoMaps") unloadGeoMapLayers();
    });






    ///////////////////////
    //    GeoLayersFunk
    ///////////////////////



    //Слой выбранных данных (при наведении)
    const featureOverlay = new VectorLayer({
        source: new VectorSource(),
        map: map,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 0.7)',
                width: 3,
            }),
        }),
    });

    //Слой выбранных данных (при наведении)
    const selectedFeatureGeoMapLayer = new VectorLayer({
        source: new VectorSource(),
        map: map,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 1)',
                width: 4,
            }),
        }),
    });

    //Словарь для хранения ссылок на слои GeoLayer с дополнительной информацией
    let geoMapLayers = new Map();

    let selectedGeoMapFeature;

    //Загружает слои GeoMap
    function loadGeoMapLayers(geoMapId) {
        unloadGeoMapLayers();
        let url = `/api/MapLayers/GetGeoMapLayers/${geoMapId}`;
        $.getJSON(url,
            function (layerObj) {
                //Находим максимальный индекс загруженных слоев
                if (!layerObj) return;
                for (let layer of layerObj) {
                    //let layerSettingsString = layer.layersettings.replace('\\', '');
                    let layerSettings = JSON.parse(layer.layerSettings);
                    let layerId = layer.id;
                    let layerName = layer.layerName;
                    let layerPath = layer.filePath;

                    $.get("/" + layerPath,
                        function (data) {
                            //$('#mapinfobox').html(data);
                            //let geoJsonProvider = new GeoJSON({ featureProjection: view.getProjection() });
                            let geoJsonProvider = new GeoJSON();
                            //let features = geoJsonProvider.readFeatures(data, { featureProjection: view.getProjection()});
                            let features = geoJsonProvider.readFeatures(data);
                            createNewGeoLayer(layerId,
                                layerSettings.fillcolor,
                                layerSettings.bordercolor,
                                features,
                                layerName,
                                layerSettings.isVizible);
                        });
                }
            });
    }

    //Выгружает слои GeoMap
    function unloadGeoMapLayers() {
        for (let lay of geoMapLayers.values()) {
            map.removeLayer(lay.layer);
        }
        geoMapLayers = new Map();
        $('#layerTableContainer').html("");
    }

    //Создает новый слой карты
    function createNewGeoLayer(newLayerId, fillcolor, bordercolor, features, layerName, isVizibleLayer) {
        //Обьект для хранения свойств слоя
        let layerProops = new Object();

        layerProops.id = newLayerId;
        layerProops.name = layerName;
        layerProops.isVizible = isVizibleLayer;
        layerProops.fillcolor = fillcolor;
        layerProops.bordercolor = bordercolor;
        /*let sorseProjection = getProjection("EPSG:32647");
        sorseProjection.setWorldExtent(getProjWorldExcent("EPSG:32647"));
        sorseProjection.setExtent(getProjExcent("EPSG:32647"));*/
        //Устанавливаем стили отдельных эл-ов
        for (let f of features) {

            //f.getGeometry().transform(sorseProjection, view.getProjection());
            //f.getGeometry().applyTransform(fromWgsToProj);
            let fillcolor = f.get('map_fill_color');
            let bordercolor = f.get('map_border_color');
            if (fillcolor && bordercolor) {
                f.setStyle(getStyleByColor(fillcolor, bordercolor));
            }
        }
        //Создаем новый источник данных
        const vectorSource = new VectorSource({
            features: features,
        });
        //Устанавливаем id слоя
        vectorSource.forEachFeature(function (f) {
            f.set("ol_layer_map_id", newLayerId);
            f.set("isGeoMapFeature", true);
        });
        //Создаем новый слой
        const newLayer = new VectorImageLayer({
            source: vectorSource,
            style: getStyleByColor(layerProops.fillcolor, layerProops.bordercolor)
        });
        //Сохраняем слой в словаре
        layerProops.layer = newLayer;
        //Добавляем слой на карту
        map.addLayer(newLayer);
        //Сохраняем слой в словаре
        geoMapLayers.set(newLayerId, layerProops);
        //Устанавливаем видимость слоя по-умолчанию
        newLayer.setVisible(isVizibleLayer);
        //Получаем строку для состояния чекбокса
        let checkBoxViziblStatus = "checked";
        if (!isVizibleLayer) {
            checkBoxViziblStatus = "unchecked";
        }
        //Отображаем слой в интерфейсе
        $('#layerTableContainer').append(`
            <div>
                <input type="checkbox" id="layer_inp_${newLayerId}" class="sr-only peer m-layerShow" data-layern="${newLayerId}" ${checkBoxViziblStatus}>

                <label for="layer_inp_${newLayerId}" class="inline-flex items-center p-2 bg-gray-100 rounded-full peer-checked:bg-indigo-400 peer-checked:text-white  hover:bg-gray-200 cursor-pointer text-s font-medium text-gray-700 grayscale hover:grayscale-0 peer-checked:grayscale-0 transition">
                    <img src="/img/ui/mapicons/layers-icon.png" class="object-cover w-8 h-8 rounded-full ">
                    <span class="ml-2 mr-1">
                        ${layerProops.name}
                    </span>
                </label>
            </div>
        `);
    }

    //Отображает таблицу для выбранной сущности GeoMap
    function printSelectedFeatureTable() {
        $('#selectedlayerTableContainer').html('');

        let attrTableHtml = '';
        let keys = selectedGeoMapFeature.getKeys();

        keys.forEach(element => {
            if (element !== "geometry" &&
                element !== "ol_layer_map_id" &&
                element !== "map_fill_color" &&
                element !== "map_border_color" &&
                element !== "isGeoMapFeature") {
                attrTableHtml += `
                <tr class="text-gray-500 transition">
                    <td class="border-t-0 px-4 align-middle text-gray-500 p-4 text-left">
                        ${element}
                    </td>
                    <td class="border-t-0 px-4 align-middle text-gray-500 p-4 text-left">
                        ${selectedGeoMapFeature.get(element)}
                    </td>
                    <td class="border-t-0 px-4 align-middle text-gray-500 p-4 text-left">
                        <strong class="inline-flex items-center p-2 space-x-2 bg-gray-100 rounded-full hover:cursor-pointer hover:bg-gray-200 tooltip m-rndColorProp" data-tip="Случайные цвета по этому свойству" data-layern="${selectedGeoMapFeature.get("ol_layer_map_id")}" data-layel="${element}">
                            <img src="/img/ui/mapicons/color-wheel.png" class="object-cover w-6 h-6 rounded-full">
                        </strong>
                    </td>
                </tr>`;
            }
        });

        $('#selectedlayerTableContainer').html(attrTableHtml);
    }

    //Происходит при наведении курсора на элемент
    let highlight;
    map.on('pointermove',
        function (evt) {
            if (evt.dragging) {
                return;
            }
            const pixel = map.getEventPixel(evt.originalEvent);
            if (map.hasFeatureAtPixel(pixel) === true) {
                let highlightFeatures = map.getFeaturesAtPixel(pixel);

                for (let feature of highlightFeatures) {
                    if (feature.get("isGeoMapFeature") === false) return;

                    if (feature !== highlight) {
                        if (highlight) {
                            featureOverlay.getSource().removeFeature(highlight);
                        }
                        if (feature) {
                            featureOverlay.getSource().addFeature(feature);
                        }
                        highlight = feature;
                    }
                    return;
                }
            }
            featureOverlay.getSource().removeFeature(highlight);
            highlight = undefined;
        });

    //При изменении видимости слоя
    $(document).on('change',
        '.m-layerShow',
        function () {
            let layer = geoMapLayers.get($(this).data("layern"));
            layer.layer.setVisible($(this).prop('checked'));
            layer.isVizible = $(this).prop('checked');

        });

    //При нажатии на кнопку генерации случайных цветов по слою
    $(document).on('click',
        '.m-rndColorProp',
        function () {
            let layerId = $(this).data("layern");
            let propKey = $(this).data("layel");

            const Color = require('color');
            let borderAlfa = Color(geoMapLayers.get(layerId).bordercolor).alpha();
            let fillAlfa = Color(geoMapLayers.get(layerId).fillcolor).alpha();

            let fech = geoMapLayers.get(layerId).layer.getSource().getFeatures();
            let uniKeys = [];
            let uniStyles = [];
            let mapColors = [];
            for (let f of fech) {
                let val = f.get(propKey);
                if (!uniKeys.includes(f.get(propKey))) {
                    uniKeys.push(val);

                    let newLayerColor = randomColor({ format: "rgbArray" });
                    let fillcolor = `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, ${fillAlfa})`;
                    let bordercolor =
                        `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, ${borderAlfa})`;
                    let newStyle = getStyleByColor(fillcolor, bordercolor);
                    uniStyles.push(newStyle);
                    mapColors.push({ fill: fillcolor, border: bordercolor });
                    f.setStyle(newStyle);
                } else {
                    f.setStyle(uniStyles[uniKeys.indexOf(val)]);
                }
                let styleIndex = uniKeys.indexOf(val);
                f.set('map_border_color', mapColors[styleIndex].border);
                f.set('map_fill_color', mapColors[styleIndex].fill);
            }

        });

    ///////////////////////
    // END GeoLayersFunk
    ///////////////////////

    //Переводит геометрию слоев в новую систему координат
    function tramsformVectorCoords(oldPrj, newPrj) {
        for (let lay of layers.values()) {
            let sourse = lay.getSource().getFeatures();
            for (let fet of sourse) {
                fet.getGeometry().transform(oldPrj, newPrj);
            }
        }
        for (let lay of geoMapLayers.values()) {
            let sourse = lay.layer.getSource().getFeatures();
            for (let fet of sourse) {
                fet.getGeometry().transform(oldPrj, newPrj);
            }
        }
    }

    map.on('singleclick', function (event) {

        if (map.hasFeatureAtPixel(event.pixel) === true) {
            let selectedFeatures = map.getFeaturesAtPixel(event.pixel);
            console.log(selectedFeatures)
            
            document.getElementById("selectInput").value = "/api/" + selectedFeatures[0].get("p_type") + "/GetById?Id=" + selectedFeatures[0].get("p_Id");

            var event = new Event('change');
            document.getElementById("selectInput").dispatchEvent(event);
        }

        selectedGeoMapFeature = null;
    });

}

function getMapInfoBoxStartData() {
    return `<div class="place-self-center">
        <div class="flex items-center place-content-center space-x-2">
            <div class="w-4 h-4 rounded-full animate-pulse bg-violet-600"></div>
            <div class="w-4 h-4 rounded-full animate-pulse bg-violet-600"></div>
            <div class="w-4 h-4 rounded-full animate-pulse bg-violet-600"></div>
        </div>
    </div>`;
}

//Генерирует стиль по цвету заливки и границе
function getStyleByColor(fillcolor, bordercolor) {
    return new Style({
        fill: new Fill({
            color: fillcolor,
        }),
        stroke: new Stroke({
            color: bordercolor,
            width: 2,
        })
    });
}

function getLayer(layerName, fromWgsToProj) {

    let layerVectorSource = new VectorSource();
    let layerZIndex = 5;

    let url = `${BASE_SERVER_URL}/api/${layerName}/GetAll`;
    $.getJSON(url, function (data) {

        let layerStyle = getIconStyleByLayerName(layerName);
        console.log(data.response)

            for (let i = 0; i < data.response.length; i++) {
                console.log(data.response[i].longtitude)
                console.log(data.response[i].latitude)
                //создаем новую точку
                let newPointFeature = new Feature({
                    geometry: new Point(fromWgsToProj([data.response[i].longtitude, data.response[i].latitude]))
                });
                newPointFeature.set("p_Id", data.response[i].id);
                newPointFeature.set("p_type", layerName);
                newPointFeature.set("isGeoMapFeature", false);
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


//Создает стиль иконки по типу слоя
function getIconStyleByLayerName(layerName) {
    if (layerName === "Publication") {

        return createIconStyle('/mapicons/StationMap.png');
    }
    if (layerName === "EcoSystem") {
        return createIconStyle('/mapicons/MeteoMao.png');
    }
    if (layerName === "SoilObject") {
        return createIconStyle('/mapicons/PublicationMap.png');
    }

    return createIconStyle('/public/mapicons/map-marker.svg');
}

//Создает стиль иконки по Url
function createIconStyle(iconUrl, scale = 0.1) {
    return new Style({
        image: new Icon({
            anchor: [0.5, 1],
            scale: scale,
            src: iconUrl
        }),
    });
}

//возвращает базовый слой карты
function getBaseLayerSourse(layerValue) {
    if (layerValue === "OSM") {
        return new OSM();
    }
    if (layerValue === "BingRoud") {
        return new BingMaps({
            key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
            imagerySet: 'RoadOnDemand',
            culture: 'ru'
        });
    }
    if (layerValue === "BingSat") {
        return new BingMaps({
            key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
            imagerySet: 'Aerial',
            culture: 'ru'
        });
    }
    if (layerValue === "BingHibrid") {
        return new BingMaps({
            key: 'Ap9BYST6-nbFhg-aHFXmWRfqd0Tsq5a7aEPxHs_b7E5tBAb4cFTvj7td6SorYRdu',
            imagerySet: 'AerialWithLabelsOnDemand',
            culture: 'ru'
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

function getProjExcent(projCode) {
    if (projCode === "EPSG:32642") {
        return [166021.44308054046, 0, 833978.5569194609, 9329005.182447437];
    }
    if (projCode === "EPSG:32643") {
        return [166021.44308053917, 0, 833978.5569194595, 9329005.182447437];
    }
    if (projCode === "EPSG:32644") {
        return [166021.44308053917, 0, 833978.5569194609, 9329005.182447437];
    }
    if (projCode === "EPSG:32645") {
        return [166021.44308054046, 0, 833978.5569194609, 9329005.182447437];
    }
    if (projCode === "EPSG:32646") {
        return [166021.44308053917, 0, 833978.5569194609, 9329005.182447437];
    }
    if (projCode === "EPSG:32647") {
        return [166021.44308054046, 0, 833978.5569194609, 9329005.182447437];
    }
    return [-20037508.342789244, -20048966.1040146, 20037508.342789244, 20048966.104014594];

}

function getProjWorldExcent(projCode) {
    if (projCode === "EPSG:32642") {
        return [66, 0, 72, 84];
    }
    if (projCode === "EPSG:32643") {
        return [72, 0, 78, 84];
    }
    if (projCode === "EPSG:32644") {
        return [78, 0, 84, 84];
    }
    if (projCode === "EPSG:32645") {
        return [84, 0, 90, 84];
    }
    if (projCode === "EPSG:32646") {
        return [90, 0, 96, 84];
    }
    if (projCode === "EPSG:32647") {
        return [96, 0, 102, 84];
    }
    return [-180, -85.06, 180, 85.06];
}