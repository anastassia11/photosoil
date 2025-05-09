'use select'

import { useParams } from 'next/navigation'
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState
} from 'react'
import { useDispatch } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'

import { getMapLayers } from '@/hooks/getMapLayers'

import Feature from 'ol/Feature'
import OLMap from 'ol/Map'
import View from 'ol/View'
import { LineString, Point } from 'ol/geom'
import { Modify, Snap } from 'ol/interaction'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import 'ol/ol.css'
import { fromLonLat, toLonLat } from 'ol/proj'
import { OSM, Vector as VectorSource } from 'ol/source'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'

import LayersPanel from './LayersPanel'
import Zoom from './Zoom'
import { getTranslation } from '@/i18n/client'

function MapArraySelect(
	{ coordinates, onInputChange, onCoordinatesChange },
	ref
) {
	const dispatch = useDispatch()
	const didLogRef = useRef(false)
	const mapElement = useRef()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const selectedPointFeature = useRef(null)
	const mapRef = useRef(null)
	const modifyRef = useRef(null)
	const [baseLayer, setBaseLayer] = useState(null)
	const [selectedLayer, setSelectedLayer] = useState('')

	const [isDataLoaded, setIsDataLoaded] = useState(false)

	//Стиль невыбранных точек
	const basePointStyle = new Style({
		image: new RegularShape({
			stroke: new Stroke({ color: 'rgba(139, 0, 139, 1)', width: 1.7 }),
			fill: new Fill({ color: 'rgba(139, 0, 139, 0.5)' }),
			points: 4, // Количество углов (4 для квадрата)
			radius: window.innerWidth < 640 ? 12 : 20, // Радиус квадрата
			angle: Math.PI / 4 // Угол поворота
		}),
		zIndex: 1
	})

	//Стиль выбранных точек
	const selectedPointStyle = new Style({
		image: new RegularShape({
			stroke: new Stroke({ color: 'rgba(139, 0, 139, 1)', width: 1.7 }),
			fill: new Fill({ color: 'rgba(139, 0, 139, 0.9)' }),
			points: 4, // Количество углов (4 для квадрата)
			radius: window.innerWidth < 640 ? 12 : 20, // Радиус квадрата
			angle: Math.PI / 4 // Угол поворота
		}),
		zIndex: 1
	})

	//Источник данных точек
	const [pointVectorSource, setPointVectorSource] = useState(
		new VectorSource({})
	)

	useEffect(() => {
		const initializeMap = () => {
			if (didLogRef.current === false) {
				didLogRef.current = true
				init()
			}
		}

		if (mapElement.current) {
			initializeMap()
		} else {
			document.addEventListener('DOMContentLoaded', initializeMap)
		}
		onInputChange && addListeners()
		return () => {
			document.removeEventListener('DOMContentLoaded', initializeMap)
			onInputChange && removeListeners()
		}
	}, [])

	useEffect(() => {
		if (!isDataLoaded && coordinates && coordinates.length > 0) {
			loadStartData()
			setIsDataLoaded(true)
		}
	}, [coordinates])

	useImperativeHandle(ref, () => ({
		deleteCurrentPoint,
		currentCoordChange
	}))

	const init = () => {
		// let startcoords = fromLonLat([85.9075867, 53.1155423]);
		let startcoords = fromLonLat([93.36224004774232, 63.11575949726813])

		//Создаем вид
		let view = new View({
			center: startcoords,
			zoom: onCoordinatesChange ? 3 : 6.5
		})

		const baseLayer = new TileLayer()

		const _default = onCoordinatesChange ? 'ArcGis_World_Topo_Map' : 'OSM'
		baseLayer.setSource(getMapLayers(_default, locale))
		setSelectedLayer(_default)

		mapRef.current = new OLMap({
			layers: [baseLayer],
			target: mapElement.current,
			view: view,
			controls: []
		})
		setBaseLayer(baseLayer)

		if (onInputChange) {
			modifyRef.current = new Modify({ source: pointVectorSource })
			mapRef.current.addInteraction(modifyRef.current)

			//добавляем функцию привязки к точке
			const snap = new Snap({ source: pointVectorSource })
			mapRef.current.addInteraction(snap)
		}

		//Слой точек метки
		const pointVectorLayer = new VectorLayer({
			source: pointVectorSource
		})

		//добавляем слой точек
		mapRef.current.addLayer(pointVectorLayer)
	}

	const addListeners = () => {
		mapRef.current.addEventListener('click', handleMapClick)
		modifyRef.current.addEventListener('modifyend', handleModifyend)
	}

	const removeListeners = () => {
		mapRef.current.removeEventListener('click', handleMapClick)
		modifyRef.current.removeEventListener('modifyend', handleModifyend)
	}

	const deleteCurrentPoint = () => {
		if (selectedPointFeature.current) {
			pointVectorSource.removeFeature(selectedPointFeature.current)
			selectedPointFeature.current = null
		}

		const features = pointVectorSource.getFeatures()
		if (features.includes(selectedPointFeature.current)) {
			pointVectorSource.removeFeature(selectedPointFeature.current)
		}
	}

	const handleBaseLayerChange = layer => {
		baseLayer.setSource(getMapLayers(layer, locale))
		setSelectedLayer(layer)
	}

	const resetStyle = () => {
		//сбрасываем стиль прошлого выделения
		if (selectedPointFeature.current) {
			selectedPointFeature.current.setStyle(basePointStyle)
			//сбрасываем прошлое выделение
			selectedPointFeature.current = null
		}
	}

	const createPoint = clickCoordinate => {
		//создаем новую точку
		if (selectedPointFeature.current == null) {
			setIsDataLoaded(true)
			// const newCord = toLonLat(clickCoordinate);
			const newPointFeature = new Feature({
				geometry: new Point(clickCoordinate)
			})
			//устанавливаем стиль новой точки
			newPointFeature.setStyle(selectedPointStyle)
			//добавляем её на слой
			pointVectorSource.addFeature(newPointFeature)
			//делаем точку выделенной
			selectedPointFeature.current = newPointFeature
		}
	}

	const handleMapClick = e => {
		resetStyle()

		//проверяем кликнули ли мы по существующей точке
		mapRef.current.forEachFeatureAtPixel(e.pixel, function (f) {
			//выделяем точку и устанавливаем стиль выделения
			f.setStyle(selectedPointStyle)
			selectedPointFeature.current = f
			selectedPointFeature.current.setStyle(selectedPointStyle)
			return true
		})

		createPoint(e.coordinate)

		//обновляем текстбоксы
		onSelectedPointFeatureChenged()
	}

	const currentCoordChange = coordinates => {
		if (selectedPointFeature.current) {
			const newCord = fromLonLat(coordinates)
			selectedPointFeature.current.setGeometry(new Point(newCord))
			generateJson()
		}
	}

	const handleModifyend = e => {
		//сбрасываем старое выделение
		if (selectedPointFeature.current) {
			selectedPointFeature.current.setStyle(basePointStyle)
			selectedPointFeature.current = null
		}
		//выделяем точку которая движется
		selectedPointFeature.current = e.features.getArray()[0]
		selectedPointFeature.current.setStyle(selectedPointStyle)

		//обновляем данные в текстбоксе
		onSelectedPointFeatureChenged()
	}

	function onSelectedPointFeatureChenged() {
		let coords = toLonLat(
			selectedPointFeature.current.getGeometry().getCoordinates()
		)

		onInputChange({
			latitude: coords[1],
			longtitude: coords[0]
		})

		generateJson()
	}

	//генерирует json
	function generateJson() {
		//Массив всех обьектов для экспорта
		let datarouts = []
		//все точки
		let features = pointVectorSource.getFeatures()

		for (let i = 0; i < features.length; i++) {
			let coords = toLonLat(features[i].getGeometry().getCoordinates())
			let point = {
				latitude: coords[1],
				longtitude: coords[0]
			}
			datarouts.push(point)
		}
		onCoordinatesChange(datarouts)
	}

	function loadStartData() {
		for (let i = 0; i < coordinates.length; i++) {
			const newPointFeature = new Feature({
				geometry: new Point(
					fromLonLat([coordinates[i].longtitude, coordinates[i].latitude])
				)
			})
			//устанавливаем стиль новой точки
			newPointFeature.setStyle(
				!onInputChange ? selectedPointStyle : basePointStyle
			)
			//добавляем её на слой
			pointVectorSource.addFeature(newPointFeature)
		}
		if (coordinates.length > 0) {
			const routLineVectorSource = new VectorSource()
			let coords = pointVectorSource.getFeatures().map(function (item) {
				return item.getGeometry().getCoordinates()
			})
			const routLineFeature = new Feature(new LineString(coords))
			routLineVectorSource.addFeature(routLineFeature)
			mapRef.current
				.getView()
				.fit(routLineVectorSource.getFeatures()[0].getGeometry(), {
					padding: [30, 30, 30, 30],
					maxZoom: 6.5
				})
		}
	}

	const handleZoomClick = zoomType => {
		if (zoomType === 'customZoomOut') {
			let view = mapRef.current.getView()
			let zoom = view.getZoom()
			view.animate({ zoom: zoom - 1 })
		}
		if (zoomType === 'customZoomIn') {
			let view = mapRef.current.getView()
			let zoom = view.getZoom()
			view.animate({ zoom: zoom + 1 })
		}
	}

	// Функция для получения координат пользователя
	const getUserLocation = e => {
		e.preventDefault()
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const coords = fromLonLat([
						position.coords.longitude,
						position.coords.latitude
					])
					resetStyle()
					createPoint(coords)
					//обновляем текстбоксы
					onSelectedPointFeatureChenged()
					mapRef.current
						.getView()
						.animate({ duration: 500 }, { center: coords, zoom: 12 })
				},
				error => {
					dispatch(
						openAlert({
							title: t('error'),
							message: t('error_location'),
							type: 'error'
						})
					)
				},
				{ enableHighAccuracy: true }
			)
		} else {
			dispatch(
				openAlert({
					title: t('warning'),
					message: t('not_supported_location'),
					type: 'warning'
				})
			)
		}
	}

	return (
		<div
			ref={mapElement}
			className='w-full h-full z-10 relative'
		>
			<div className='z-30 absolute top-0 right-0 m-2'>
				<LayersPanel
					locale={locale}
					onLayerChange={handleBaseLayerChange}
					currentLayer={selectedLayer}
				/>
			</div>

			<div className='z-20 absolute top-[calc(50%-88px)] right-0 m-2'>
				<button
					className='mb-2 duration-300 bg-white rounded-md p-1 shadow-md text-zinc-600 hover:text-zinc-800 hover:shadow-lg'
					onClick={getUserLocation}
					type='button'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='32'
						height='32'
						viewBox='0 0 32 32'
					>
						<path
							fill='currentColor'
							d='M17.89 26.27l-2.7-9.46-9.46-2.7 18.92-6.76zm-5.62-12.38l4.54 1.3 1.3 4.54 3.24-9.08z'
						></path>
					</svg>
				</button>
				<Zoom onClick={handleZoomClick} />
			</div>
		</div>
	)
}

export default forwardRef(MapArraySelect)
