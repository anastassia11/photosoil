import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import {DragAndDrop, defaults as defaultInteractions} from 'ol/interaction';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import { Tile as TileLayer, VectorImage as VectorImageLayer, Vector as VectorLayer } from 'ol/layer';
import { LineString, Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import { OSM, XYZ, BingMaps, Vector as VectorSource } from 'ol/source';
import { Circle, Fill, Stroke } from 'ol/style';
import { get as getProjection, getTransform } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import randomColor from 'randomcolor';
//import { Color} from 'color';

const dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [GeoJSON]
});




window.CreateGeoMapView = function(mapDivId, geoMapId) {

    var nextNewLayerId = 0;

    //Регистрируем возможные проекции
    proj4.defs("EPSG:32647", "+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32645", "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32644", "+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32642", "+proj=utm +zone=42 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32646", "+proj=utm +zone=46 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:3857",
        "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
    register(proj4);

    var startcoords = fromLonLat([85.9075867, 53.1155423]);

    //Создаем вид
    var view = new View({
        center: startcoords,
        zoom: 8.5
    });

    //Базовый слой карты
    const baseLayer = new TileLayer();


    //создаем новую карту
    const map = new OLMap({
        interactions: defaultInteractions().extend([dragAndDropInteraction]),
        layers: [baseLayer],
        target: mapDivId,
        view: view
    });

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
    const featureSelect = new VectorLayer({
        source: new VectorSource(),
        map: map,
        style: new Style({
            stroke: new Stroke({
                color: 'rgba(255, 255, 255, 1)',
                width: 4,
            }),
            /*fill: new Fill({
                color: 'rgba(255, 255, 255, 0.7)',
            }),*/
        }),

    });

    //////////////**************************//////////////
    //////////////Преобразования координат/////////////
    var fromProjToWgs = getTransform(view.getProjection(), 'EPSG:4326');
    var fromWgsToProj = getTransform('EPSG:4326', view.getProjection());

    //Устанавливаем базовый слой
    baseLayer.setSource(getBaseLayerSourse("OSM"));


    //Отслеживание события изменения базового слоя
    $(".baseLayerSelector").click(function(e) {
        baseLayer.setSource(getBaseLayerSourse($(this).data("scrtype")));
        $(".baseLayerButtonText").html($(this).html());
    });

    //Отслеживание события изменения проекции
    $(".projSelector").click(function(e) {
        var prjKey = $(this).data("scrtype");
        setNewProjection(prjKey);

        $(".projButtonText").html($(this).html());

    });

    //Устанавливает новую проекцию
    function setNewProjection(prjKey) {
        var newProjection = getProjection(prjKey);
        newProjection.setWorldExtent(getProjWorldExcent(prjKey));
        newProjection.setExtent(getProjExcent(prjKey));
        updateCoordTransforms(newProjection);
        var oldProjection = view.getProjection();
        var fromOldProjToNew = getTransform(oldProjection, newProjection);
        var newview = new View({
            center: fromOldProjToNew(view.getCenter()),
            zoom: view.getZoom(),
            projection: newProjection
        });
        map.setView(newview);
        view = newview;
        //Переводим векторные обьекты в новую систему координат
        tramsformVectorCoords(oldProjection, newProjection);
    }

    //Функция преобразования координат в WGS
    function updateCoordTransforms(newProjection) {
        fromProjToWgs = getTransform(newProjection, 'EPSG:4326');
        fromWgsToProj = getTransform('EPSG:4326', newProjection);
    }

    var layers = new Map();

    ////////////////////////////////////////////////
    if (geoMapId) {
        loadLayers(geoMapId);
    }


    //Загружает слои
    function loadLayers(geoMapId) {

        var url = `/api/MapLayers/GetGeoMapLayers/${geoMapId}`;
        $.getJSON(url,
            function(layerObj) {
                //var layerObj = JSON.parse(layerJson);
                //Находим максимальный индекс загруженных слоев
                if (!layerObj) return;
                nextNewLayerId = Math.max.apply(Math, layerObj.map(function(o) { return o.id; }));
                for (let layer of layerObj) {
                    //let layerSettingsString = layer.layersettings.replace('\\', '');
                    let layerSettings = JSON.parse(layer.layerSettings);
                    let layerId = layer.id;
                    let layerName = layer.layerName;
                    let layerPath = layer.filePath;

                    $.get("/" + layerPath,
                        function(data) {
                            //$('#mapinfobox').html(data);
                            var geoJsonProvider = new GeoJSON();
                            var features = geoJsonProvider.readFeatures(data);
                            createNewLayer(layerId,
                                "nochanged",
                                layerSettings.fillcolor,
                                layerSettings.bordercolor,
                                layerPath,
                                features,
                                layerName,
                                layerSettings.isVizible);
                        });
                }
            });


    }


    //Переводит геометрию слоев в новую систему координат
    function tramsformVectorCoords(oldPrj, newPrj) {
        for (let lay of layers.values()) {
            var sourse = lay.layer.getSource().getFeatures();
            for (let fet of sourse) {
                fet.getGeometry().transform(oldPrj, newPrj);
            }
        }
    }

    let selectedFeature;
    //Отображение данных выбранной геометрии
    map.on('singleclick',
        function(evt) {
            $('#selectedlayerTableContainer').html('');
            if (map.hasFeatureAtPixel(evt.pixel) === true) {

                const pixel = map.getEventPixel(evt.originalEvent);
                const feature = map.forEachFeatureAtPixel(pixel,
                    function(feature) {
                        return feature;
                    });

                if (feature !== selectedFeature) {
                    if (selectedFeature) {
                        featureSelect.getSource().removeFeature(selectedFeature);
                    }
                    if (feature) {
                        featureSelect.getSource().addFeature(feature);
                    }
                    selectedFeature = feature;
                }

                printSelectedFeatureTable();

                //todo:отображение данных выбранной геометрии
                /*var selectedFeatures = map.getFeaturesAtPixel(event.pixel);
                $('#mapinfobox').html(getMapInfoBoxStartData());
                $('#mapinfobox').fadeIn();

                $.get("/MapInfoBox/" + selectedFeatures[0].get("p_type") + "?id=" + selectedFeatures[0].get("p_Id"), function (data) {
                    $('#mapinfobox').html(data);
                });*/
            } else {
                featureSelect.getSource().removeFeature(selectedFeature);
                selectedFeature = null;

            }
        });

    function printSelectedFeatureTable() {
        $('#selectedlayerTableContainer').html('');

        var attrTableHtml = '';
        var keys = selectedFeature.getKeys();

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
                        ${selectedFeature.get(element)}
                    </td>
                    <td class="border-t-0 px-4 align-middle text-gray-500 p-4 text-left">
                        <strong class="inline-flex items-center p-2 space-x-2 bg-gray-100 rounded-full hover:cursor-pointer hover:bg-gray-200 tooltip m-rndColorProp" data-tip="Случайные цвета по этому свойству" data-layern="${selectedFeature.get("ol_layer_map_id")}" data-layel="${element}">
                            <img src="/img/ui/mapicons/color-wheel.png" class="object-cover w-6 h-6 rounded-full">
                        </strong>
                    </td>
                </tr>`;
            }
        });

        $('#selectedlayerTableContainer').html(attrTableHtml);
    }


    //Создает новый слой карты
    function createNewLayer(newLayerId,
        layerStatus,
        fillcolor,
        bordercolor,
        layerUrl,
        features,
        layerName,
        isVizibleLayer) {
        var layerProops = new Object();

        layerProops.id = newLayerId;
        layerProops.status = layerStatus;
        layerProops.name = layerName;
        layerProops.isVizible = isVizibleLayer;

        layerProops.fillcolor = fillcolor;
        layerProops.bordercolor = bordercolor;
        layerProops.url = layerUrl;

        for (let f of features) {
            var fillcolor = f.get('map_fill_color');
            var bordercolor = f.get('map_border_color');

            if (fillcolor && bordercolor) {
                f.setStyle(getStyleByColor(fillcolor, bordercolor));
            }


        }

        const vectorSource = new VectorSource({
            features: features,
        });

        vectorSource.forEachFeature(function(f) {
            f.set("ol_layer_map_id", newLayerId);
        });

        const newLayer = new VectorImageLayer({
            source: vectorSource,
            style: getStyleByColor(layerProops.fillcolor, layerProops.bordercolor)
        });

        layerProops.layer = newLayer;

        map.addLayer(newLayer);

        map.getView().fit(vectorSource.getExtent());

        layers.set(newLayerId, layerProops);

        newLayer.setVisible(isVizibleLayer);

        let checkBoxViziblStatus = "checked";
        if (!isVizibleLayer) {
            checkBoxViziblStatus = "unchecked";
        }

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

    //Происходит при наведении курсора на элемент
    let highlight;
    map.on('pointermove',
        function(evt) {
            if (evt.dragging) {
                return;
            }
            const pixel = map.getEventPixel(evt.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel,
                function(feature) {
                    return feature;
                });

            if (feature !== highlight) {
                if (highlight) {
                    featureOverlay.getSource().removeFeature(highlight);
                }
                if (feature) {
                    featureOverlay.getSource().addFeature(feature);
                }
                highlight = feature;
            }
        });

    $('#layerTableContainer').html('');


    //При изменении видимости слоя
    $(document).on('change',
        '.m-layerShow',
        function() {
            var layer = layers.get($(this).data("layern"));
            layer.layer.setVisible($(this).prop('checked'));
            layer.isVizible = $(this).prop('checked');

        });


    //При нажатии на кнопку генерации случайных цветов по слою
    $(document).on('click',
        '.m-rndColorProp',
        function() {
            var layerId = $(this).data("layern");
            var propKey = $(this).data("layel");

            const Color = require('color');
            var borderAlfa = Color(layers.get(layerId).bordercolor).alpha();
            var fillAlfa = Color(layers.get(layerId).fillcolor).alpha();

            var fech = layers.get(layerId).layer.getSource().getFeatures();
            let uniKeys = [];
            let uniStyles = [];
            let mapColors = [];
            for (let f of fech) {
                let val = f.get(propKey);
                if (!uniKeys.includes(f.get(propKey))) {
                    uniKeys.push(val);

                    var newLayerColor = randomColor({ format: "rgbArray" });
                    var fillcolor = `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, ${fillAlfa})`;
                    var bordercolor =
                        `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, ${borderAlfa})`;
                    var newStyle = getStyleByColor(fillcolor, bordercolor);
                    uniStyles.push(newStyle);
                    mapColors.push({ fill: fillcolor, border: bordercolor });
                    f.setStyle(newStyle);
                } else {
                    f.setStyle(uniStyles[uniKeys.indexOf(val)]);
                }
                var styleIndex = uniKeys.indexOf(val);
                f.set('map_border_color', mapColors[styleIndex].border);
                f.set('map_fill_color', mapColors[styleIndex].fill);
            }

            //Устанавливаем новый статус для слоя (модифицированный)
            var layerprop = layers.get($(this).data("layern"));
            layerprop.status = "changed";
            /*if (layerprop.status !== "new") {
                layerprop.status = "file_modif";
                layerprop.status = "file_modif";
            }*/
        });
}


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