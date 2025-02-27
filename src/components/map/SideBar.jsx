'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams
} from 'next/navigation'
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
	addAuthor,
	addCategory,
	addTerm,
	deleteAuthor,
	deleteCategory,
	deleteTerm
} from '@/store/slices/dataSlice'

import { useConstants } from '@/hooks/useConstants'

import { BASE_SERVER_URL } from '@/utils/constants'

import { getAuthors } from '@/api/author/get_authors'
import { getClassifications } from '@/api/classification/get_classifications'

import LayerSwitch from '../admin-panel/ui-kit/LayerSwitch'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'
import Filter from '../soils/Filter'

import { getTranslation } from '@/i18n/client'
import ObjectCard from './ObjectCard'
import SearchInput from './SearchInput'

const SideBar = memo(function SideBar({
	sidebarOpen,
	setSideBarOpen,
	filterName,
	objects,
	setFilterName,
	layersVisible,
	popupVisible,
	popupClose,
	onVisibleChange,
	draftIsVisible,
	setDraftIsVisible
}) {
	const dispatch = useDispatch()
	const searchParams = useSearchParams()
	const router = useRouter()
	const pathname = usePathname()
	// const didLogRef = useRef(true)
	const dropdown = useSelector(state => state.general.dropdown)

	const [classifications, setClassifications] = useState([])
	const [authors, setAuthors] = useState([])

	const [token, setToken] = useState(null)

	const { selectedTerms, selectedCategories, selectedAuthors } = useSelector(
		state => state.data
	)
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const { SOIL_ENUM, } = useConstants()
	const SOIL_ENUM_REF = useRef(SOIL_ENUM)

	const CATEGORY_ARRAY = useMemo(() => {
		return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
			id: Number(key),
			name: value
		}))
	}, [SOIL_ENUM_REF])

	const order = ['soil', 'ecosystem', 'publication']

	useEffect(() => {
		setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		setSideBarOpen(window.innerWidth > 640)
		fetchClassifications()
		fetchAuthors()
		// if (didLogRef.current) {
		//   didLogRef.current = false
		//   const categoriesParam = searchParams.get('categories');
		//   const termsParam = searchParams.get('terms');
		//   const authorsParam = searchParams.get('authors');

		//   categoriesParam && categoriesParam.split(',').forEach((param) => dispatch(addCategory(Number(param))));
		//   termsParam && termsParam.split(',').forEach((param) => dispatch(addTerm(Number(param))));
		//   authorsParam && authorsParam.split(',').forEach((param) => dispatch(addAuthor(Number(param))));
		// }
	}, [])

	// useEffect(() => {
	//   updateFiltersInHistory();
	// }, [selectedCategories, selectedTerms, selectedAuthors])

	// useEffect(() => {
	//   window.innerWidth > 640 && setSideBarOpen(!popupVisible)
	// }, [popupVisible])

	const fetchClassifications = async () => {
		const result = await getClassifications()
		if (result.success) {
			setClassifications(result.data.sort((a, b) => a.order - b.order))
		}
	}

	const fetchAuthors = async () => {
		const result = await getAuthors()
		if (result.success) {
			setAuthors(result.data)
		}
	}

	const updateFiltersInHistory = () => {
		const params = new URLSearchParams(searchParams.toString())

		if (selectedCategories.length > 0) {
			params.set('categories', selectedCategories.join(','))
		} else {
			params.delete('categories')
		}

		if (selectedTerms.length > 0) {
			params.set('terms', selectedTerms.join(','))
		} else {
			params.delete('terms')
		}

		if (selectedAuthors.length > 0) {
			params.set('authors', selectedAuthors.join(','))
		} else {
			params.delete('authors')
		}
		router.replace(pathname + '?' + params.toString())
	}

	const handleViewSidebar = () => {
		setSideBarOpen(!sidebarOpen)
	}

	const handleVisibleChange = useCallback(
		e => {
			const { name, checked } = e.target
			onVisibleChange({ name, checked })
		},
		[onVisibleChange]
	)

	const handleAddCategory = useCallback(
		newItem => {
			dispatch(addCategory(newItem))
		},
		[dispatch]
	)

	const handleDeleteCategorie = useCallback(
		newItem => {
			dispatch(deleteCategory(newItem))
		},
		[dispatch]
	)

	const handleResetCategories = useCallback(
		deletedItems => {
			for (let item of deletedItems) {
				dispatch(deleteCategory(item))
			}
		},
		[dispatch]
	)

	const handleAddTerm = useCallback(
		newItem => {
			dispatch(addTerm(newItem))
		},
		[dispatch]
	)

	const handleDeleteTerm = useCallback(
		deletedItem => {
			dispatch(deleteTerm(deletedItem))
		},
		[dispatch]
	)

	const handleResetTerms = useCallback(
		deletedItems => {
			for (let item of deletedItems) {
				dispatch(deleteTerm(item))
			}
		},
		[dispatch]
	)

	const handleAddAuthor = useCallback(
		newItem => {
			dispatch(addAuthor(newItem))
		},
		[dispatch]
	)

	const handleDeleteAuthor = useCallback(
		deletedItem => {
			dispatch(deleteAuthor(deletedItem))
		},
		[dispatch]
	)

	const handleResetAuthors = useCallback(
		deletedItems => {
			for (let item of deletedItems) {
				dispatch(deleteAuthor(item))
			}
		},
		[dispatch]
	)

	return (
		<div
			id='map-sidebar'
			className={`sideBar ${sidebarOpen
				? 'left-0 z-30'
				: 'sm:-left-[408px] sm:z-20 z-30 -left-[calc(100%-90px)]'
				} absolute lg:top-0 top-[45px] sm:w-[400px] w-[calc(100%-98px)] sm:max-w-[400px] max-h-[calc(100%-150px)] sm:max-h-[calc(100%-16px)]
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row pb-4`}
		>
			<div className='relative flex-1 flex flex-col max-w-full'>
				<button
					onClick={handleViewSidebar}
					className='sideBar absolute -right-[32px] top-0 bg-white w-[25px] h-10 rounded-md shadow-md flex items-center justify-center'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth='1.5'
						stroke='currentColor'
						className={`h-4 w-4 ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`}
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M19.5 8.25l-7.5 7.5-7.5-7.5'
						/>
					</svg>
				</button>

				{!popupVisible ? (
					<div className='sm:px-4 pt-2 px-2'>
						<div className='relative sm:mb-4 mb-3'>
							<SearchInput filterName={filterName} setFilterName={setFilterName} placeholder={t('search_code')} />
						</div>
					</div>
				) : (
					<button
						className='sideBar pt-4 pb-1 sm:px-5 px-3 self-end text-zinc-400 hover:text-zinc-600 duration-300'
						onClick={popupClose}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							className='w-6 h-6'
							strokeWidth={1.5}
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M6 18 18 6M6 6l12 12'
							/>
						</svg>
					</button>
				)}

				{objects.length ? (
					<ul className='flex flex-col sm:pb-4 pb-2 max-h-full overflow-y-auto scroll pt-0'>
						{objects
							.sort((a, b) => {
								return order.indexOf(a._type) - order.indexOf(b._type)
							})
							.map(obj => (
								<li key={obj.id}>
									<ObjectCard object={obj} />
								</li>
							))}
					</ul>
				) : (
					<>
						{filterName.length ? (
							<p className='sm:mt-4 mt-3 sm:px-5 px-3 pb-3'>
								{t('no_objects')}
							</p>
						) : (
							<div className='flex-1 h-full overflow-y-auto scroll sm:px-5 px-3 flex flex-col sm:space-y-3 space-y-1 w-full pb-3'>
								{/* <MotionWrapper className='ml-1'> */}
								<label
									htmlFor='draftIsVisible'
									className={`flex-row cursor-pointer max-w-fit
            ${!token ? 'hidden h-0 my-0' : 'flex'}`}
								>
									<input
										type='checkbox'
										id='draftIsVisible'
										checked={draftIsVisible}
										onChange={() => setDraftIsVisible(!draftIsVisible)}
										className='min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 '
									/>
									<span className='select-none'>{t('grafts_visible')}</span>
								</label>
								{/* </MotionWrapper> */}
								<div className='pb-1.5'>
									<p className='font-medium sm:text-xl text-lg sm:mb-1.5'>
										{t('map_layers')}
									</p>
									<div
										x-show='show'
										x-transition
										className='sm:space-y-2.5 space-y-1 px-1'
									>
										<LayerSwitch
											title={t('soils')}
											type='soil'
											visible={layersVisible?.soil}
											onVisibleChange={handleVisibleChange}
										/>
										<LayerSwitch
											title={t('ecosystems')}
											type='ecosystem'
											visible={layersVisible?.ecosystem}
											onVisibleChange={handleVisibleChange}
										/>
										<LayerSwitch
											title={t('publications')}
											type='publication'
											visible={layersVisible?.publication}
											onVisibleChange={handleVisibleChange}
										/>
									</div>
								</div>

								<div>
									<p className='font-medium sm:text-xl text-lg sm:mb-1.5 '>
										{t('filters')}
									</p>

									{
										<ul className='flex flex-col z-10 max-h-full sm:space-y-2.5 space-y-1 px-1'>
											<li key={'authors'}>
												<Filter
													dropdown={dropdown}
													itemId={`author`}
													name={t('authors')}
													items={authors}
													type='authors'
													isMapFilter={true}
													allSelectedItems={selectedAuthors}
													addItem={handleAddAuthor}
													deleteItem={handleDeleteAuthor}
													resetItems={handleResetAuthors}
												/>
											</li>
											<li key={'category'}>
												<Filter
													dropdown={dropdown}
													name={t('category')}
													itemId='category'
													items={CATEGORY_ARRAY}
													allSelectedItems={selectedCategories}
													type='category'
													isMapFilter={true}
													addItem={handleAddCategory}
													deleteItem={handleDeleteCategorie}
													resetItems={handleResetCategories}
												/>
											</li>
											{classifications?.map(item => {
												const isEnglish = locale === 'en'
												const isTranslationModeValid =
													item.translationMode === 0 ||
													(isEnglish
														? item.translationMode === 1
														: item.translationMode === 2)
												if (isTranslationModeValid) {
													return (
														<li key={item.id}>
															<Filter
																dropdown={dropdown}
																isEng={locale === 'en'}
																itemId={item.id}
																type='classif'
																isMapFilter={true}
																name={isEnglish ? item.nameEng : item.nameRu}
																sortByOrder={!item.isAlphabeticallOrder}
																items={item.terms}
																allSelectedItems={selectedTerms}
																addItem={handleAddTerm}
																deleteItem={handleDeleteTerm}
																resetItems={handleResetTerms}
															/>
														</li>
													)
												}
											})}
										</ul>
									}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div >
	)
}, (prevProps, nextProps) => {
	console.log('sidebarOpen', prevProps.sidebarOpen === nextProps.sidebarOpen)
	console.log('filterName', prevProps.filterName === nextProps.filterName)
	console.log('objects', prevProps.objects === nextProps.objects)
	//
	console.log('layersVisible', prevProps.layersVisible === nextProps.layersVisible)
	console.log('popupVisible', prevProps.popupVisible === nextProps.popupVisible)
	console.log('draftIsVisible', prevProps.draftIsVisible === nextProps.draftIsVisible)

	return prevProps.sidebarOpen === nextProps.sidebarOpen &&
		prevProps.filterName === nextProps.filterName
		&& prevProps.objects === nextProps.objects
		//
		&& prevProps.layersVisible === nextProps.layersVisible
		&& prevProps.popupVisible === nextProps.popupVisible
		&& prevProps.draftIsVisible === nextProps.draftIsVisible
})
export default SideBar
