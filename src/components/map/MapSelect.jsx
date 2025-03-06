'use select'

import { useParams } from 'next/navigation'
import { memo, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'

import { getMapLayers } from '@/hooks/getMapLayers'

import Feature from 'ol/Feature'
import OLMap from 'ol/Map'
import View from 'ol/View'
import Point from 'ol/geom/Point'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import 'ol/ol.css'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Vector as VectorSource } from 'ol/source'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'

import LayersPanel from './LayersPanel'
import Zoom from './Zoom'
import { getTranslation } from '@/i18n/client'

const MapSelect = memo(function MapSelect({
	id,
	type,
	latitude,
	longtitude,
	onCoordinateChange
}) {
	const dispatch = useDispatch()

	const didLogRef = useRef(false)
	const mapElement = useRef()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [isCoordExist, setIsCoordExist] = useState(false)
	const [vectorLayer, setVectorLayer] = useState(null)
	const [selectedPointGeom, setSelectedPointGeom] = useState(null)
	const [baseLayer, setBaseLayer] = useState(null)
	const [selectedLayer, setSelectedLayer] = useState('')

	const mapRef = useRef(null)

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

		onCoordinateChange && addMapListeners()
		return () => {
			document.removeEventListener('DOMContentLoaded', initializeMap)
			onCoordinateChange && removeMapListeners()
		}
	}, [onCoordinateChange])

	useEffect(() => {
		setIsCoordExist(false)
		mapRef.current.removeLayer(vectorLayer)
	}, [id])

	useEffect(() => {
		vectorLayer && inputCoordChenged()
	}, [latitude, longtitude, vectorLayer])

	const init = () => {
		// let startcoords = fromLonLat([85.9075867, 53.1155423]);
		let startcoords = fromLonLat([93.36224004774232, 63.11575949726813])

		//Создаем вид
		let view = new View({
			center: startcoords,
			zoom: onCoordinateChange ? 3 : 6.5
		})

		// Базовый слой карты
		const baseLayer = new TileLayer()
		const _default = onCoordinateChange ? 'ArcGis_World_Topo_Map' : 'OSM'
		baseLayer.setSource(getMapLayers(_default, locale))
		setSelectedLayer(_default)

		mapRef.current = new OLMap({
			layers: [baseLayer],
			target: mapElement.current,
			view: view,
			controls: []
		})
		setBaseLayer(baseLayer)
		//Геометрия метки
		const selectedPointGeom = new Point(startcoords)
		setSelectedPointGeom(selectedPointGeom)

		//Создаем метку
		const selectedPoint = new Feature({
			geometry: selectedPointGeom
		})

		let pointStyle = getIconStyleByLayerName(type)
		selectedPoint.setStyle(pointStyle)

		//Слой метки
		const vectorLayer = new VectorLayer({
			source: new VectorSource({
				features: [selectedPoint]
			})
		})
		setVectorLayer(vectorLayer)
	}

	const addMapListeners = () => {
		mapRef.current.addEventListener('click', handleMapClick)
	}

	const removeMapListeners = () => {
		mapRef.current.removeEventListener('click', handleMapClick)
	}

	const handleMapClick = e => {
		const clickCoordinate = e.coordinate
		const newCord = toLonLat(clickCoordinate)
		onCoordinateChange({ latitude: newCord[1], longtitude: newCord[0] })
	}

	const inputCoordChenged = () => {
		//если координаты не определены
		if (latitude === '' || longtitude === '') {
			setIsCoordExist(false)
			mapRef.current.removeLayer(vectorLayer)
			return
		}
		const newCord = fromLonLat([longtitude, latitude])

		//если координаты не действительны
		if (isNaN(newCord[0]) || isNaN(newCord[1])) {
			mapRef.current.removeLayer(vectorLayer)
			return
		}
		//Проверяем есть ли метка на карте
		if (!isCoordExist) {
			//Добавляем метку на карту
			mapRef.current.addLayer(vectorLayer)
			setIsCoordExist(true)
		}

		//Изменяем позицию метки
		selectedPointGeom?.setCoordinates(newCord)

		//Удаляем все запущенные анимации
		// mapRef.current.getView().cancelAnimations();

		//Запускаем анимацию перемещения к метки
		mapRef.current.getView().animate({ duration: 500 }, { center: newCord })
	}

	//Создает стиль иконки по типу слоя
	const getIconStyleByLayerName = type => {
		return createIconStyle(type)
	}

	const handleBaseLayerChange = layer => {
		baseLayer.setSource(getMapLayers(layer, locale))
		setSelectedLayer(layer)
	}

	//Создает стиль иконки по Url
	const createIconStyle = layerName => {
		if (layerName === 'soil') {
			return new Style({
				image: new RegularShape({
					stroke: new Stroke({ color: 'rgba(153, 51, 0, 1)', width: 1.7 }),
					fill: new Fill({ color: 'rgba(153, 51, 0, 0.7)' }),
					points: 4, // Количество углов (4 для квадрата)
					radius: window.innerWidth < 640 ? 12 : 20, // Радиус квадрата
					angle: Math.PI / 4 // Угол поворота
				}),
				zIndex: 1
			})
		} else if (layerName === 'ecosystem') {
			return new Style({
				image: new RegularShape({
					stroke: new Stroke({ color: 'rgba(115, 172, 19, 1)', width: 1.7 }),
					fill: new Fill({ color: 'rgba(115, 172, 19, 0.7)' }),
					points: 4, // Количество углов (4 для квадрата)
					radius: window.innerWidth < 640 ? 12 : 20, // Радиус квадрата
					angle: Math.PI / 4 // Угол поворота
				}),
				zIndex: 1
			})
		} else if (layerName === 'publication') {
			return new Style({
				image: new RegularShape({
					stroke: new Stroke({ color: 'rgba(139, 0, 139, 1)', width: 1.7 }),
					fill: new Fill({ color: 'rgba(139, 0, 139, 0.7)' }),
					points: 4, // Количество углов (4 для квадрата)
					radius: window.innerWidth < 640 ? 12 : 20, // Радиус квадрата
					angle: Math.PI / 4 // Угол поворота
				}),
				zIndex: 1
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

	const handleFullClick = () => {
		if (mapElement.current.requestFullscreen) {
			mapElement.current.requestFullscreen()
		} else if (mapElement.current.mozRequestFullScreen) {
			mapElement.current.mozRequestFullScreen()
		} else if (mapElement.current.webkitRequestFullscreen) {
			mapElement.current.webkitRequestFullscreen()
		} else if (mapElement.current.msRequestFullscreen) {
			mapElement.current.msRequestFullscreen()
		}
	}

	// Функция для получения координат пользователя
	const getUserLocation = e => {
		e.preventDefault()
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const coords = [position.coords.longitude, position.coords.latitude]
					onCoordinateChange({ latitude: coords[1], longtitude: coords[0] })
					mapRef.current.getView().animate({ duration: 500 }, { zoom: 12 })
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
				{/* <FullScreen onClick={handleFullClick} /> */}
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
})
export default MapSelect
