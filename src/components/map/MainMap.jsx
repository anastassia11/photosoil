'use client'

import { useParams, useSearchParams } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react'
import { useDispatch } from 'react-redux'
import { useSnapshot } from 'valtio'

import { openAlert } from '@/store/slices/alertSlice'
import { filtersStore } from '@/store/valtioStore/filtersStore'

import { getMapLayers } from '@/hooks/getMapLayers'

import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import { getPublications } from '@/api/publication/get_publications'
import { getSoils } from '@/api/soil/get_soils'

import Feature from 'ol/Feature'
import OLMap from 'ol/Map'
import View from 'ol/View'
import { Point } from 'ol/geom'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import 'ol/ol.css'
import { fromLonLat } from 'ol/proj'
import { Cluster, Vector as VectorSource } from 'ol/source'
import { Fill, RegularShape, Stroke, Style } from 'ol/style'
import { Text } from 'ol/style.js'

import LayersPanel from './LayersPanel'
import SearchRegion from './SearchRegion'
import SideBar from './SideBar'
import Zoom from './Zoom'
import { getTranslation } from '@/i18n/client'

export default function MainMap() {
	const dispatch = useDispatch()
	const [baseLayer, setBaseLayer] = useState(null)

	const [clusterLayer, setClusterLayer] = useState(null)
	const [features, setFeatures] = useState([])

	const [sidebarOpen, setSideBarOpen] = useState(false)
	const searchParams = useSearchParams()
	const { locale } = useParams()

	const { t } = getTranslation(locale)

	const { selectedTerms, selectedCategories, selectedAuthors } =
		useSnapshot(filtersStore)

	const [selectedLayer, setSelectedLayer] = useState('')

	const [selectedObjects, setSelectedObjects] = useState([])
	const [layersVisible, setLayersVisible] = useState(null)
	const [objects, setObjects] = useState([])
	const [soils, setSoils] = useState([])
	const [ecosystems, setEcosystems] = useState([])
	const [publications, setPublications] = useState([])
	const [popupVisible, setPopupVisible] = useState(false)
	const [draftIsVisible, setDraftIsVisible] = useState(false)

	const [filterName, setFilterName] = useState('')

	const didLogRef = useRef(true)
	const mapElement = useRef()

	const mapRef = useRef(null)
	const _isEng = locale === 'en'

	useLayoutEffect(() => {
		let timeoutId
		const initializeMap = () => {
			init()
			loadLayers()
		}

		localStorage.getItem('layersVisible')
			? setLayersVisible(JSON.parse(localStorage.getItem('layersVisible')))
			: setLayersVisible({
				soil: true,
				ecosystem: false,
				publication: false
			})

		if (mapElement.current) {
			if (didLogRef.current) {
				didLogRef.current = false
				initializeMap()
			}
		} else {
			document.addEventListener('DOMContentLoaded', initializeMap)
		}
		return () => {
			clearTimeout(timeoutId)
			document.removeEventListener('DOMContentLoaded', initializeMap)
		}
	}, [])

	useEffect(() => {
		layersVisible &&
			localStorage.setItem('layersVisible', JSON.stringify(layersVisible))
	}, [layersVisible])

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
		addListeners()
		return () => removeListeners()
	}, [soils, ecosystems, publications])

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

	const filterById = useCallback(
		filteredIds => {
			const layerSource = clusterLayer.getSource().getSource() // Получаем источник кластера
			features.forEach(feature => {
				if (feature.get('p_type')) {
					const featureId = feature.get('p_Id')
					const featureType = feature.get('p_type')
					if (
						filteredIds.find(
							obj => obj.id === featureId && obj._type === featureType
						) &&
						layersVisible[featureType]
					) {
						!layerSource.hasFeature(feature) && layerSource.addFeature(feature)
					} else {
						layerSource.removeFeature(feature)
					}
				}
			})
			if (filterName.length) {
				setSelectedObjects(
					objects.filter(item =>
						filteredIds.find(
							obj => obj.id === item.id && obj._type === item._type
						)
					)
				)
			} else {
				setSelectedObjects([])
			}
		},
		[clusterLayer, features, layersVisible, objects, filterName]
	)

	useEffect(() => {
		const _filterName = filterName.toLowerCase().trim()
		const filteredAllIds = objects
			.filter(
				obj =>
					layersVisible[obj._type] &&
					(draftIsVisible
						? true
						: obj.translations?.find(transl => transl.isEnglish === _isEng)
							?.isVisible) &&
					(filterName.length
						? obj.translations
							?.find(transl => transl.isEnglish === _isEng)
							?.name?.toLowerCase()
							.includes(_filterName) ||
						obj.translations
							?.find(transl => transl.isEnglish === _isEng)
							?.code?.toLowerCase()
							.includes(_filterName)
						: true) &&
					(obj.objectType
						? selectedCategories.length === 0 ||
						selectedCategories.includes(obj.objectType)
						: true) &&
					(obj.authors
						? selectedAuthors.length === 0 ||
						selectedAuthors.some(selectedAuthor =>
							obj.authors?.some(author => author === selectedAuthor)
						)
						: true) &&
					(obj.terms
						? selectedTerms.length === 0 ||
						selectedTerms.some(selectedTerm =>
							obj.terms?.some(term => term === selectedTerm)
						)
						: true)
			)
			.map(({ id, _type }) => ({ id, _type }))
		if (clusterLayer) {
			filterById(filteredAllIds)
		}
	}, [
		selectedTerms,
		selectedCategories,
		selectedAuthors,
		objects,
		draftIsVisible,
		clusterLayer,
		filterName,
		layersVisible,
		filterById,
		_isEng
	])

	const init = () => {
		let startcoords = fromLonLat([85.9075867, 53.1155423])

		//Создаем вид
		let view = new View({
			center: startcoords,
			zoom: 3,
			rotation: 0,
			constrainRotation: true,
			rotateExtent: [0, 0, 0, 0]
		})

		// Базовый слой карты
		const baseLayer = new TileLayer()

		baseLayer.setSource(getMapLayers('OSM', locale))
		setSelectedLayer('OSM')
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

	const typeConfig = [
		{
			type: 'soil',
			fetch: getSoils,
			setState: setSoils
		},
		{
			type: 'ecosystem',
			fetch: getEcosystems,
			setState: setEcosystems
		},
		{
			type: 'publication',
			fetch: getPublications,
			setState: setPublications
		}
	]

	const fetchData = async () => {
		const fetchPromises = typeConfig.map(async ({ type, fetch, setState }) => {
			const result = await fetch()
			if (result.success && setState) {
				setState(result.data)
				const dataWithType = result.data.map(item => ({
					...item,
					_type: type
				}))
				return dataWithType
			}
		})

		const results = await Promise.all(fetchPromises)
		const combinedResults = results.flat() // Объединяем все массивы в один
		setObjects(combinedResults)
		return combinedResults
	}

	const getLayer = () => {
		let layerVectorSource = new VectorSource()

		fetchData().then(data => {
			const newFeatures = []
			data?.forEach(item => {
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
			setFeatures(prevFeatures => [...prevFeatures, ...newFeatures])
		})
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

				const foundObject = objects.find(({ id, _type }) => {
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
		}
	}

	const handleMapHover = e => {
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
			handleMapOut()
			mapRef.current
				.getLayers()
				.getArray()[1]
				.getSource()
				.getFeatures()
				.forEach(feature => {
					feature.setStyle(null) // Сброс стиля
				})
		}
	}

	const handleMapOut = () => {
		mapRef.current.getTargetElement().style.cursor = 'default'
	}

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
		setFilterName('')
		setSelectedObjects([])
	}, [])

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
				// locale={locale}
				sidebarOpen={sidebarOpen}
				filterName={filterName}
				objects={selectedObjects}
				setFilterName={setFilterName}
				setSideBarOpen={setSideBarOpen}
				popupVisible={popupVisible}
				popupClose={handlePopupClose}
				layersVisible={layersVisible}
				onVisibleChange={handleLayerChange}
				onLocationHandler={selectLocationHandler}
				draftIsVisible={draftIsVisible}
				setDraftIsVisible={setDraftIsVisible}
			/>
		</div>
	)
}
