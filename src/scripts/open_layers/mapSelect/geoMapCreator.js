import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import { DragAndDrop, defaults as defaultInteractions } from 'ol/interaction';
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




window.CreateGeoMapCreator = function (mapDivId, geoMapId, isEditMode = false) {

    var nextNewLayerId = 0;

    //Регистрируем возможные проекции
    proj4.defs("EPSG:32647", "+proj=utm +zone=47 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32645", "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32644", "+proj=utm +zone=44 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32643", "+proj=utm +zone=43 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32642", "+proj=utm +zone=42 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:32646", "+proj=utm +zone=46 +datum=WGS84 +units=m +no_defs");
    proj4.defs("EPSG:3857", "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs");
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
    $(".baseLayerSelector").click(function (e) {
        baseLayer.setSource(getBaseLayerSourse($(this).data("scrtype")));
        $(".baseLayerButtonText").html($(this).html());
    });

    //Отслеживание события изменения проекции
    $(".projSelector").click(function (e) {
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
        $.getJSON(url, function (layerObj) {
            //var layerObj = JSON.parse(layerJson);
            //Находим максимальный индекс загруженных слоев
            if (!layerObj) return;
            nextNewLayerId = Math.max.apply(Math, layerObj.map(function (o) { return o.id; }));
            for (let layer of layerObj) {
                //let layerSettingsString = layer.layersettings.replace('\\', '');
                let layerSettings = JSON.parse(layer.layerSettings);
                let layerId = layer.id;
                let layerName = layer.layerName;
                let layerPath = layer.filePath;

                $.get("/" + layerPath, function (data) {
                    //$('#mapinfobox').html(data);
                    var geoJsonProvider = new GeoJSON();
                    var features = geoJsonProvider.readFeatures(data);
                    createNewLayer(layerId, "nochanged", layerSettings.fillcolor, layerSettings.bordercolor, layerPath, features, layerName, layerSettings.isVizible);
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
    map.on('singleclick', function (evt) {
        $('#selectedlayerTableContainer').html('');
        if (map.hasFeatureAtPixel(evt.pixel) === true) {

            const pixel = map.getEventPixel(evt.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
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
            if (element !== "geometry" && element !== "ol_layer_map_id" && element !== "map_fill_color" && element !== "map_border_color") {
                attrTableHtml += `
                <tr>
                    <td>
                        ${element}
                    </td> 
                    

                    <td>
                        ${selectedFeature.get(element)}                        
                    </td>        
                    <td>
                        <a class="ui button mini m-rndColorProp"  style="width: 100%;" data-layern="${selectedFeature.get("ol_layer_map_id")}" data-layel="${element}" >Случайные цвета по этому свойству</a><br>
                        <a class="ui button mini m-dellProp" style="margin-top: 5px; width: 100%;" data-layern="${selectedFeature.get("ol_layer_map_id")}" data-layel="${element}" >Удалить свойство</a><br>
                        <div class="ui mini action input" style="height: 32px;padding: 0px;margin-top: 5px;width: 100%;">
                            <input type="text" class="m-renameLayerPropText" value="${element}" data-layel="${element}" data-layern="${selectedFeature.get("ol_layer_map_id")}">
                            <button class="ui mini button m-renameLayerProp" data-layel="${element}" data-layern="${selectedFeature.get("ol_layer_map_id")}">Переменовать</button>
                        </div>

                    </td>
                </tr>`;
            }
        });

        $('#selectedlayerTableContainer').html(attrTableHtml);
    }

    //Переменовать свойство
    $(document).on('click', '.m-renameLayerProp', function () {
        var layer = layers.get($(this).data("layern")).layer;
        var oldPropString = $(this).data("layel");
        var newPropString = $(`.m-renameLayerPropText[data-layel='${oldPropString}']`).val();

        var fech = layer.getSource().getFeatures();
        for (let f of fech) {
            let val = f.get(oldPropString);
            f.set(newPropString, val);
            f.unset(oldPropString);
        }
        printSelectedFeatureTable();

        //Устанавливаем новый статус для слоя (модифицированный)
        var layerprop = layers.get($(this).data("layern"));
        layerprop.status = "changed";
        /*if (layerprop.status !== "new") {
            layerprop.status = "file_modif";
            
        }*/
    });

    //Удалить свойство
    $(document).on('click', '.m-dellProp', function () {
        var layer = layers.get($(this).data("layern")).layer;
        var proptoDellString = $(this).data("layel");

        var fech = layer.getSource().getFeatures();
        for (let f of fech) {
            f.unset(proptoDellString);
        }
        printSelectedFeatureTable();

        //Устанавливаем новый статус для слоя (модифицированный)
        var layerprop = layers.get($(this).data("layern"));
        layerprop.status = "changed";
        /*if (layerprop.status !== "new") {
            layerprop.status = "file_modif";
            
        }*/
    });


    //При перетаскивании файла Json
    dragAndDropInteraction.on('addfeatures', function (event) {
        var newLayerColor = randomColor({ format: "rgbArray" });
        var fillcolor = `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, 0.4)`;
        var bordercolor = `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, 1.0)`;

        createNewLayer(nextNewLayerId, "changed", fillcolor, bordercolor, "", event.features, event.file.name, true);
        nextNewLayerId++;


    });

    //Создает новый слой карты
    function createNewLayer(newLayerId, layerStatus, fillcolor, bordercolor, layerUrl, features, layerName, isVizibleLayer) {
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

        vectorSource.forEachFeature(function (f) {
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
                <tr data-layern="${newLayerId}">
                    <td>
                        <div class="ui fitted slider checkbox"  style="border-width:0px">
                            <input type="checkbox" class="m-layerShow" data-layern="${newLayerId}" ${checkBoxViziblStatus}> <label></label>
                        </div>
                    </td>
                    <td>
                        <div class="ui input" style="padding-left: 0px; padding-right: 0px;">
                            <input type="text " class="m-layerName" data-layern="${newLayerId}" id="layer_name_inp_${newLayerId}" value="${layerProops.name}" placeholder="Введите название слоя">
                        </div>
                    </td>
                    <td><input type="text" data-layern="${newLayerId}" class="m-layerColorFill coloris"  data-coloris value="${layerProops.fillcolor}" ></td>
                    <td><input type="text" data-layern="${newLayerId}" class="m-layerColorBorder coloris"  data-coloris value="${layerProops.bordercolor}" ></td>
                    <td><a class="ui button m-layerDell" data-layern="${newLayerId}" >Удалить</a></td>
                </tr>`);


        Coloris({ el: '.coloris' });
    }

    //Происходит при наведении курсора на элемент
    let highlight;
    map.on('pointermove', function (evt) {
        if (evt.dragging) {
            return;
        }
        const pixel = map.getEventPixel(evt.originalEvent);
        const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
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

    //При изменении цвета заливки слоя
    $(document).on('change', '.m-layerColorFill', function () {
        var layer = layers.get($(this).data("layern"));
        layer.fillcolor = $(this).val();
        var newStyle = getStyleByColor(layer.fillcolor, layer.bordercolor);
        var fech = layer.layer.getSource().getFeatures();
        for (let f of fech) {
            f.setStyle(newStyle);
            f.unset('map_fill_color');
            f.unset('map_border_color');
        }
        layer.status = "changed";
        //layer.layer.setStyle(getStyleByColor(layer.fillcolor, layer.bordercolor));
    });

    //При изменении цвета границы слоя
    $(document).on('change', '.m-layerColorBorder', function () {
        var layer = layers.get($(this).data("layern"));
        layer.bordercolor = $(this).val();
        //layer.layer.setStyle(getStyleByColor(layer.fillcolor, layer.bordercolor));
        var newStyle = getStyleByColor(layer.fillcolor, layer.bordercolor);
        var fech = layer.layer.getSource().getFeatures();
        for (let f of fech) {
            f.setStyle(newStyle);
            f.unset('map_border_color');
            f.unset('map_fill_color');
        }
        layer.status = "changed";
    });

    //При изменении видимости слоя
    $(document).on('change', '.m-layerShow', function () {
        var layer = layers.get($(this).data("layern"));
        layer.layer.setVisible($(this).prop('checked'));
        layer.isVizible = $(this).prop('checked');

        //generateGeoJsonBlob($(this).data("layern"));
        //onPostForm();
    });

    //При удалении слоя
    $(document).on('click', '.m-layerDell', function () {
        var layerId = $(this).data("layern");
        var layer = layers.get(layerId);
        layer.status = "dell";
        map.removeLayer(layer.layer);
        if (!isEditMode) layers.delete(layerId);
        $("tr[data-layern='" + $(this).data("layern") + "']").remove();
    });
    //$('.m-layerColor').change( 

    //При нажатии на кнопку генерации случайных цветов по слою
    $(document).on('click', '.m-rndColorProp', function () {
        var layerId = $(this).data("layern");
        var propKey = $(this).data("layel");

        const Color = require('color');
        var borderAlfa = Color($(".m-layerColorBorder[data-layern='" + layerId + "']").val()).alpha();
        var fillAlfa = Color($(".m-layerColorFill[data-layern='" + layerId + "']").val()).alpha();

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
                var bordercolor = `rgba(${newLayerColor[0]}, ${newLayerColor[1]}, ${newLayerColor[2]}, ${borderAlfa})`;
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

    //function onPostForm() {
    $('#CreateButton').click(function () {
        $('#progressContainer').html('');
        for (var lo of layers.values()) {
            lo.name = $(`#layer_name_inp_${lo.id}`).val();
            if (lo.status === "changed") {
                lo.isUploded = false;
                var blobTosend = generateGeoJsonBlob(lo.layer);
                startUploadBloob(blobTosend, lo);
                var pbHtml = `
                    <div class="flex items-center p-1">
                        <span class="w-48 text-xs text-base-content text-opacity-60">Загрузка слоя: ${lo.name}</span>
                        <progress max="100" class="progress progress-secondary" id='pb_${lo.id}' value="0"></progress>
                    </div>
            `;
                $('#progressContainer').append(pbHtml);
            }
        }

        checkUpload();
    });

    //Конвентирует слой в GeoJson  и генерирует  bloob 
    function generateGeoJsonBlob(layerToJson) {
        //Переводим в проекцию по умолчанию
        setNewProjection('EPSG:3857');
        $(".projButtonText").html("Web Mercator (EPSG:3857)");
        //Получаем элементы слоя
        var layerFeatures = layerToJson.getSource().getFeatures();
        //Массив эл-ов для экспорта
        var layerFeaturesToExport = [];
        for (var lf of layerFeatures) {
            var exportFeature = lf.clone();
            exportFeature.unset('ol_layer_map_id');
            layerFeaturesToExport.push(exportFeature);
        }
        //Конвентируем в Json
        var geoJsonProvider = new GeoJSON();
        var geoJsonLayerString = geoJsonProvider.writeFeatures(layerFeaturesToExport);
        var retBlob = new Blob([geoJsonLayerString], { type: "text/plain" });
        return retBlob;
    }

    //Начинает загрузку одного слоя
    function startUploadBloob(blob, layerObj) {

        var upload = new tus.Upload(blob,
            {
                endpoint: "/files/tmp/",
                layerId: layerObj.id,
                isFileUpload: false,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                metadata: {
                    name: layerObj.id,
                    contentType: blob.type || 'application/octet-stream'
                },
                onError: function (error) {
                    //thisUploder.OnFileUplodeError(currentfileid, error, index);
                },
                onProgress: function (bytesUploaded, bytesTotal) {
                    var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    $(`pb_${layerObj.id}`).val(percentage);

                },
                onSuccess: function () {
                    /*upload.options.isFileUpload = true;
                    thisUploder.OnFileSecsessUploded(currentfileid, upload.file.name, upload.url, index);
                    thisUploder.checkfilesupload(true);*/
                    //.log("Download %s from %s", upload.url);
                    $(`#pb_${layerObj.id}`).val(100);
                    $(`#pb_${layerObj.id}`).removeClass('progress-secondary');
                    $(`#pb_${layerObj.id}`).addClass('progress-success');
                    layerObj.isUploded = true;
                    //layerObj.url = upload.url;
                    layerObj.url = upload.url.split("/").pop();
                    checkUpload();
                }
            });
        upload.start();
    }

    //Проверяет все ли файлы с слоями загружены
    //Если да, то отправляем форму
    function checkUpload() {
        for (let lo of layers.values()) {
            if (lo.status === "changed" && !lo.isUploded) {
                return;
            }
        }

        var layerIndex = 0;
        var hiddenInputHtml = '';
        for (let lo of layers.values()) {
            var layerSettings = { isVizible: lo.isVizible, bordercolor: lo.bordercolor, fillcolor: lo.fillcolor };
            hiddenInputHtml += `<input type="hidden" name="LayerProps[${layerIndex}].LayerName" value="${lo.name}" />`;
            hiddenInputHtml += `<input type="hidden" name="LayerProps[${layerIndex}].FilePath" value="${lo.url}" />`;
            hiddenInputHtml += `<input type="hidden" name="LayerProps[${layerIndex}].Id" value="${lo.id}" />`;
            hiddenInputHtml += `<input type="hidden" name="LayerProps[${layerIndex}].Status" value="${lo.status}" />`;
            hiddenInputHtml += `<input type="hidden" name="LayerProps[${layerIndex}].LayerSettings" value='${JSON.stringify(layerSettings)}' />`;
            layerIndex++;
        }
        $('#progressContainer').append(hiddenInputHtml);
        $('#GeoMapForm').submit();
    }

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