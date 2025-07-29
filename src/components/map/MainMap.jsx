'use client'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react'
import { useDispatch } from 'react-redux'

import { openAlert } from '@/store/slices/alertSlice'

import { getMapLayers } from '@/hooks/getMapLayers'

import Feature from 'ol/Feature'
import OLMap from 'ol/Map'
import View from 'ol/View'
import { Point } from 'ol/geom'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import 'ol/ol.css'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Cluster, Vector as VectorSource } from 'ol/source'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'
import { Text } from 'ol/style.js'

import LayersPanel from './LayersPanel'
import SearchRegion from './SearchRegion'
import SideBar from './SideBar'
import Zoom from './Zoom'
import { getTranslation } from '@/i18n/client'
import useSoils from '@/hooks/data/useSoils'
import useEcosystems from '@/hooks/data/useEcosystems'
import usePublications from '@/hooks/data/usePublications'
import { throttle } from 'lodash'

export default function MainMap() {
	const dispatch = useDispatch()
	const [baseLayer, setBaseLayer] = useState(null)

	const [clusterLayer, setClusterLayer] = useState(null)
	const [features, setFeatures] = useState([])

	const [sidebarOpen, setSideBarOpen] = useState(false)
	const searchParams = useSearchParams()
	const { locale } = useParams()

	const { t } = getTranslation(locale)

	const [selectedLayer, setSelectedLayer] = useState('')

	const [selectedObjects, setSelectedObjects] = useState([])

	const [layersVisible, setLayersVisible] = useState(null)

	const { soils, soilsIsLoading } = useSoils()
	const { data: ecosystems, isLoading: ecosystemsIsLoading } = useEcosystems()
	const { data: publications, isLoading: publicationsIsLoading } = usePublications()

	const [popupVisible, setPopupVisible] = useState(false)

	const router = useRouter()
	const pathname = usePathname()

	const didLogRef = useRef(true)
	const mapElement = useRef()

	const mapRef = useRef(null)

	useLayoutEffect(() => {
		localStorage.getItem('layersVisible')
			? setLayersVisible(JSON.parse(localStorage.getItem('layersVisible')))
			: setLayersVisible({
				soil: true,
				ecosystem: false,
				publication: false
			})

		localStorage.getItem('layer')
			? setSelectedLayer(JSON.parse(localStorage.getItem('layer')))
			: setSelectedLayer('OSM')

		if (soilsIsLoading || ecosystemsIsLoading || publicationsIsLoading) return

		const initializeMap = () => {
			init()
			// loadLayers()
		}

		let timeoutId

		timeoutId = setTimeout(() => {
			const soilIds = searchParams.get('soilIds')?.split(',').map(Number)
			const ecosIds = searchParams.get('ecosIds')?.split(',').map(Number)
			const publIds = searchParams.get('publIds')?.split(',').map(Number)

			let _selectedSoils = []
			let _selectedEcoss = []
			let _selectedPubls = []

			if (soilIds) {
				_selectedSoils = soils.filter(({ id }) => soilIds?.includes(id))
			}
			if (ecosIds) {
				_selectedEcoss = ecosystems.filter(({ id }) => ecosIds?.includes(id))
			}
			if (publIds) {
				_selectedPubls = publications.filter(({ id }) => publIds?.includes(id))
			}
			setSelectedObjects([..._selectedSoils, ..._selectedEcoss, ..._selectedPubls])

			if (soilIds || ecosIds || publIds) {
				setPopupVisible(true)
			}
		}, 300)

		if (mapElement.current) {
			if (didLogRef.current) {
				initializeMap()
				didLogRef.current = false
			}
		} else {
			document.addEventListener('DOMContentLoaded', initializeMap)
		}
		return () => {
			document.removeEventListener('DOMContentLoaded', initializeMap)
			clearTimeout(timeoutId)
		}
	}, [soilsIsLoading, ecosystemsIsLoading, publicationsIsLoading])

	useEffect(() => {
		if (soilsIsLoading || ecosystemsIsLoading || publicationsIsLoading) return
		loadLayers()
	}, [soils, ecosystems, publications])

	useEffect(() => {
		const map = mapRef.current
		if (!map) return

		const view = map.getView()

		let debounceTimer

		const updateSearchParams = () => {
			// Очищаем предыдущий таймер
			clearTimeout(debounceTimer)
			// Устанавливаем новый таймер
			debounceTimer = setTimeout(() => {
				const center = view.getCenter()
				const zoom = view.getZoom()

				if (!center || zoom === undefined) return

				const [lon, lat] = toLonLat(center)
				const newParams = new URLSearchParams(searchParams.toString())

				newParams.set('zoom', zoom.toFixed(2))
				newParams.set('center', `${lon.toFixed(6)},${lat.toFixed(6)}`)

				router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
			}, 300)
		}

		// Подписка на изменение зума и центра
		const listenerKeys = [
			view.on('change:resolution', updateSearchParams),
			view.on('change:center', updateSearchParams)
		]

		return () => {
			// Очищаем таймер при размонтировании
			clearTimeout(debounceTimer)

			// Отписываемся от событий
			listenerKeys.forEach((key) => {
				view.un('change:resolution', key.listener)
				view.un('change:center', key.listener)
			})
		}
	}, [soilsIsLoading, ecosystemsIsLoading, publicationsIsLoading, router, pathname, searchParams])

	useEffect(() => {
		layersVisible &&
			localStorage.setItem('layersVisible', JSON.stringify(layersVisible))
	}, [layersVisible])

	useEffect(() => {
		selectedLayer &&
			localStorage.setItem('layer', JSON.stringify(selectedLayer))
	}, [selectedLayer])

	useEffect(() => {
		if (clusterLayer) {
			const layerSource = clusterLayer.getSource().getSource() // Получаем источник кластера
			features.forEach(feature => {
				if (layersVisible[feature.get('p_type')]) {
					!layerSource.hasFeature(feature) && layerSource.addFeature(feature) // Добавляем Feature обратно в источник, если checked
				} else {
					layerSource.removeFeature(feature) // Удаляем Feature из источника, если unchecked
				}
			})
		}
	}, [layersVisible, clusterLayer, soils, ecosystems, publications, features])

	useEffect(() => {
		if (!mapRef.current) return
		addListeners()
		return () => removeListeners()
	}, [soilsIsLoading, ecosystemsIsLoading, publicationsIsLoading, searchParams, pathname, router])

	useEffect(() => {
		if (window.innerWidth < 640) {
			document.addEventListener('click', handleClickOutside)
			return () => {
				document.removeEventListener('click', handleClickOutside)
			}
		}
	}, [])

	const handleClickOutside = useCallback(e => {
		if (!e.target.closest('.sideBar')) {
			setSideBarOpen(false)
		}
	}, [])

	const updateHistory = useCallback(selected => {
		const _soilIds = selected.filter(({ _type }) => _type === 'soil').map(({ id }) => id)
		const _ecosIds = selected.filter(({ _type }) => _type === 'ecosystem').map(({ id }) => id)
		const _publIds = selected.filter(({ _type }) => _type === 'publication').map(({ id }) => id)

		const newParams = new URLSearchParams(searchParams.toString())
		console.log(newParams)
		if (_soilIds.length > 0) {
			newParams.set('soilIds', _soilIds.join(','))
		} else {
			newParams.delete('soilIds')
		}

		if (_ecosIds.length > 0) {
			newParams.set('ecosIds', _ecosIds.join(','))
		} else {
			newParams.delete('ecosIds')
		}

		if (_publIds.length > 0) {
			newParams.set('publIds', _publIds.join(','))
		} else {
			newParams.delete('publIds')
		}
		router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
	}, [pathname, router, searchParams])

	// const filterById = useCallback(
	// 	filteredIds => {
	// 		console.log(filteredIds)
	// 		const layerSource = clusterLayer.getSource().getSource() // Получаем источник кластера
	// 		features.forEach(feature => {
	// 			if (feature.get('p_type')) {
	// 				const featureId = feature.get('p_Id')
	// 				const featureType = feature.get('p_type')
	// 				if (
	// 					filteredIds.find(
	// 						obj => obj.id === featureId && obj._type === featureType
	// 					)
	// 				) {
	// 					!layerSource.hasFeature(feature) && layerSource.addFeature(feature)
	// 				} else {
	// 					layerSource.removeFeature(feature)
	// 				}
	// 			}
	// 		})
	// 		const filterName = searchParams.get('search')
	// 		if (filterName?.length) {
	// 			const _selected = [...soils, ...ecosystems, ...publications].filter(item =>
	// 				filteredIds.find(
	// 					obj => obj.id === item.id && obj._type === item._type
	// 				)
	// 			)
	// 			setSelectedObjects(_selected)
	// 		} else {
	// 			setSelectedObjects([])
	// 		}
	// 	},
	// 	[clusterLayer, features, soils, ecosystems, publications, searchParams]
	// )

	// useEffect(() => {
	// 	if (soilsIsLoading || ecosystemsIsLoading || publicationsIsLoading || !layersVisible) return

	// 	const filteredAllIds = [...soils, ...ecosystems, ...publications]
	// 		.filter(obj => layersVisible[obj._type])
	// 		.map(({ id, _type }) => ({ id, _type }))
	// 	if (clusterLayer) {
	// 		// filterById(filteredAllIds)
	// 	}
	// }, [soils,
	// 	soilsIsLoading,
	// 	ecosystems,
	// 	ecosystemsIsLoading,
	// 	publications,
	// 	publicationsIsLoading,
	// 	clusterLayer,
	// 	layersVisible
	// ])

	const init = () => {
		console.log('init')
		let startcoords = fromLonLat([85.9075867, 53.1155423])
		let initialZoom = 3

		// Читаем зум из URL
		const zoomFromURL = searchParams.get('zoom')
		const centerFromURL = searchParams.get('center')

		if (centerFromURL) {
			const [lon, lat] = centerFromURL.split(',').map(Number)
			if (!isNaN(lon) && !isNaN(lat)) {
				startcoords = fromLonLat([lon, lat])
			}
		}

		if (zoomFromURL) {
			const zoom = parseFloat(zoomFromURL)
			if (!isNaN(zoom)) {
				initialZoom = zoom
			}
		}

		//Создаем вид
		let view = new View({
			center: startcoords,
			zoom: initialZoom,
			rotation: 0,
			constrainRotation: true,
			rotateExtent: [0, 0, 0, 0]
		})

		// Базовый слой карты
		const baseLayer = new TileLayer()

		baseLayer.setSource(getMapLayers(selectedLayer, locale))
		// setSelectedLayer('OSM')
		mapRef.current = new OLMap({
			layers: [baseLayer],
			target: mapElement.current,
			view: view,
			controls: []
			// transition: 0,
			// renderers: ['Canvas', 'VML']
		})
		setBaseLayer(baseLayer)
	}

	const handleZoomClick = useCallback(zoomType => {
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
	}, [])

	const handleBaseLayerChange = useCallback(
		layer => {
			baseLayer.setSource(getMapLayers(layer, locale))
			setSelectedLayer(layer)
		},
		[baseLayer, locale]
	)

	const getLayer = () => {
		let layerVectorSource = new VectorSource()

		const newFeatures = []
		const allItems = [...soils, ...ecosystems, ...publications]

		allItems.forEach(item => {
			const coordinates =
				item._type === 'publication' && item.coordinates
					? JSON.parse(item.coordinates)
					: [{ longtitude: item.longtitude, latitude: item.latitude }]
			// Создаем точки на основе координат
			coordinates.forEach(coord => {
				if (coord.longtitude && coord.latitude) {
					const newPointFeature = new Feature({
						geometry: new Point(
							fromLonLat([coord.longtitude, coord.latitude])
						)
					})
					newPointFeature.set('p_Id', item.id)
					newPointFeature.set('p_type', item._type)
					newPointFeature.setStyle(getIconStyleByLayerName(item._type))
					layersVisible?.[item._type] &&
						layerVectorSource.addFeature(newPointFeature)
					newFeatures.push(newPointFeature)
				}
			})
		})
		// setFeatures(prevFeatures => [...prevFeatures, ...newFeatures])
		setFeatures(newFeatures)

		const clusterSource = new Cluster({
			distance: 18, // Расстояние для кластеризации в пикселях
			minDistance: 18,
			source: layerVectorSource // Исходный источник
		})
		const _clusterLayer = new VectorLayer({
			source: clusterSource,
			style: clusterStyle
		})
		_clusterLayer.setZIndex(5)
		setClusterLayer(_clusterLayer)
		return _clusterLayer
	}

	const loadLayers = () => {
		if (clusterLayer) {
			mapRef.current.removeLayer(clusterLayer)
		}
		mapRef.current.addLayer(getLayer())
	}

	const clusterStyle = feature => {
		const size = feature.get('features').length
		if (size > 1) {
			// Стиль для кластеров
			return new Style({
				image: new RegularShape({
					stroke: new Stroke({ color: 'rgba(255, 69, 0, 1)', width: 2 }),
					fill: new Fill({ color: 'rgba(255, 69, 0, 0.6)' }),
					points: 4, // Количество углов (4 для квадрата)
					radius: 13, // Радиус квадрата
					angle: Math.PI / 4 // Угол поворота
				}),
				text: new Text({
					text: size.toString(),
					fill: new Fill({ color: '#ffffff' }),
					font: '500 14px sans-serif',
					offsetX: 0,
					offsetY: 1,
					textAlign: 'center',
					textBaseline: 'middle'
				}),
				zIndex: 2
			})
		} else {
			const singleFeature = feature.get('features')[0]
			return singleFeature.getStyle()
		}
	}

	//Создает стиль иконки по типу слоя
	const getIconStyleByLayerName = layerName => {
		return createIconStyle(layerName)
	}

	//Создает стиль иконки по Url
	const createIconStyle = layerName => {
		if (layerName === 'soil') {
			return new Style({
				image: new RegularShape({
					stroke: new Stroke({ color: 'rgba(153, 51, 0, 1)', width: 1.7 }),
					fill: new Fill({ color: 'rgba(153, 51, 0, 0.7)' }),
					points: 4, // Количество углов (4 для квадрата)
					radius: 10, // Радиус квадрата
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
					radius: 10, // Радиус квадрата
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
					radius: 10, // Радиус квадрата
					angle: Math.PI / 4 // Угол поворота
				}),
				zIndex: 1
			})
		}
	}

	const hangleMapClick = e => {
		const features = mapRef.current.getFeaturesAtPixel(e.pixel)
		const _objects = []
		if (features.length > 0) {
			const feature = features[0]
			const points = feature.get('features')

			setPopupVisible(true)
			setSideBarOpen(true)

			points.forEach(point => {
				const type = point.get('p_type')
				const _id = point.get('p_Id')

				const foundObject = [...soils, ...ecosystems, ...publications].find(({ id, _type }) => {
					if (_type === 'publication') {
						return (
							!_objects.some(obj => obj.id === _id) &&
							id == _id &&
							type == _type
						)
					}
					return id == _id && type == _type
				})
				if (foundObject) {
					_objects.push({
						...foundObject
					})
				}
			})
		}
		if (_objects.length) {
			setSelectedObjects(_objects)
			updateHistory(_objects)
		}
	}

	const handleMapHover = throttle(e => {
		const features = mapRef.current.getFeaturesAtPixel(e.pixel)

		if (features.length > 0) {
			const feature = features[0]
			const size = feature.get('features').length
			const points = feature.get('features')
			if (points.length == 1) {
				const point = points[0]
				const layerName = point.get('p_type')
				if (layerName === 'soil') {
					feature.setStyle(
						new Style({
							image: new RegularShape({
								stroke: new Stroke({
									color: 'rgba(153, 51, 0, 1)',
									width: 1.7
								}),
								fill: new Fill({ color: 'rgba(153, 51, 0, 0.8)' }),
								points: 4, // Количество углов (4 для квадрата)
								radius: 11, // Радиус квадрата
								angle: Math.PI / 4 // Угол поворота
							}),
							zIndex: 1
						})
					)
				} else if (layerName === 'ecosystem') {
					feature.setStyle(
						new Style({
							image: new RegularShape({
								stroke: new Stroke({
									color: 'rgba(115, 172, 19, 1)',
									width: 1.7
								}),
								fill: new Fill({ color: 'rgba(115, 172, 19, 0.8)' }),
								points: 4, // Количество углов (4 для квадрата)
								radius: 11, // Радиус квадрата
								angle: Math.PI / 4 // Угол поворота
							}),
							zIndex: 1
						})
					)
				} else if (layerName === 'publication') {
					feature.setStyle(
						new Style({
							image: new RegularShape({
								stroke: new Stroke({
									color: 'rgba(139, 0, 139, 1)',
									width: 1.7
								}),
								fill: new Fill({ color: 'rgba(139, 0, 139, 0.8)' }),
								points: 4, // Количество углов (4 для квадрата)
								radius: 11, // Радиус квадрата
								angle: Math.PI / 4 // Угол поворота
							}),
							zIndex: 1
						})
					)
				}
			} else {
				feature.setStyle(
					new Style({
						image: new RegularShape({
							stroke: new Stroke({ color: 'rgba(255, 69, 0, 1)', width: 2 }),
							fill: new Fill({ color: 'rgba(255, 69, 0, 0.75)' }),
							points: 4, // Количество углов (4 для квадрата)
							radius: 14, // Радиус квадрата
							angle: Math.PI / 4 // Угол поворота
						}),
						text: new Text({
							text: size.toString(),
							fill: new Fill({ color: '#ffffff' }),
							font: '500 14px sans-serif',
							offsetX: 0,
							offsetY: 1,
							textAlign: 'center',
							textBaseline: 'middle'
						}),
						zIndex: 2
					})
				)
			}

			mapRef.current.getTargetElement().style.cursor = 'pointer'
		} else {
			mapRef.current.getTargetElement().style.cursor = 'default'
			mapRef.current
				.getLayers()
				.getArray()[1]
				.getSource()
				.getFeatures()
				.forEach(feature => {
					feature.setStyle(null) // Сброс стиля
				})
		}
	}, 1)

	const addListeners = () => {
		mapRef.current.on('singleclick', hangleMapClick)
		mapRef.current.on('pointermove', handleMapHover)
	}

	const removeListeners = () => {
		mapRef.current.un('singleclick', hangleMapClick)
		mapRef.current.un('pointermove', handleMapHover)
	}

	const handleLayerChange = useCallback(({ name, checked }) => {
		setLayersVisible(prev => ({ ...prev, [name]: checked }))
	}, [])

	const selectLocationHandler = useCallback(item => {
		let up = fromLonLat([item.boundingbox[3], item.boundingbox[1]])
		let down = fromLonLat([item.boundingbox[2], item.boundingbox[0]])

		let combined = down.concat(up)
		mapRef.current.getView().fit(combined, {
			duration: 500,
			maxZoom: 15,
			padding: [20, 20, 20, 20]
		})
	}, [])

	const handlePopupClose = useCallback(() => {
		setPopupVisible(false)
		setSelectedObjects([])
		updateHistory([])
	}, [updateHistory])

	const getUserLocation = e => {
		e.preventDefault()
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const coords = fromLonLat([
						position.coords.longitude,
						position.coords.latitude
					])
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
			className='w-full h-full z-10'
		>
			<div
				className={`z-40 absolute top-0 right-0 m-2 flex flex-row duration-300 lg:w-[500px] w-full pl-2`}
			>
				<SearchRegion
					locale={locale}
					onLocationHandler={selectLocationHandler}
				/>
				<LayersPanel
					locale={locale}
					onLayerChange={handleBaseLayerChange}
					currentLayer={selectedLayer}
				/>
			</div>
			<div className='z-20 absolute top-[calc(50%-120px)] right-0 m-2'>
				<button
					className='mb-2 duration-300 bg-white rounded-md p-1 shadow-md text-zinc-600 hover:text-zinc-800 hover:shadow-lg'
					type='button'
					onClick={getUserLocation}
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

			<SideBar
				sidebarOpen={sidebarOpen}
				isLoading={soilsIsLoading || ecosystemsIsLoading || publicationsIsLoading}
				objects={selectedObjects}
				setSideBarOpen={setSideBarOpen}
				popupVisible={popupVisible}
				popupClose={handlePopupClose}
				layersVisible={layersVisible}
				onVisibleChange={handleLayerChange}
				onLocationHandler={selectLocationHandler}
			/>
		</div>
	)
}
