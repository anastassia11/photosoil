'use client'

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
import { useSnapshot } from 'valtio'

import { filtersStore } from '@/store/valtioStore/filtersStore'

import { useConstants } from '@/hooks/useConstants'

import LayerSwitch from '../admin-panel/ui-kit/LayerSwitch'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'
import Filter from '../soils/Filter'

import DraftSwitcher from './DraftSwitcher'
import ObjectCard from './ObjectCard'
import SearchInput from './SearchInput'
import { getTranslation } from '@/i18n/client'
import useClassifications from '@/hooks/data/useClassifications'
import useAuthors from '@/hooks/data/useAuthors'

const SideBar = memo(
	function SideBar({
		sidebarOpen,
		isLoading,
		setSideBarOpen,
		objects,
		layersVisible,
		popupVisible,
		popupClose,
		onVisibleChange
	}) {
		const { classifications } = useClassifications()
		const { authors } = useAuthors({ needSort: false })
		const [draftIsVisible, setDraftIsVisible] = useState(false)

		const { selectedTerms, selectedCategories, selectedAuthors } =
			useSnapshot(filtersStore)

		const pathname = usePathname()
		const router = useRouter()
		const searchParams = useSearchParams()

		const [token, setToken] = useState(null)

		const { locale } = useParams()
		const { t } = getTranslation(locale)

		const { SOIL_ENUM, SOIL_ENUM2 } = useConstants()
		const SOIL_ENUM_REF = useRef(SOIL_ENUM2)

		const CATEGORY_ARRAY = useMemo(() => {
			return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
				id: Number(key),
				name: value[locale]
			}))
		}, [SOIL_ENUM_REF, locale])

		const order = ['soil', 'ecosystem', 'publication']

		useEffect(() => {
			setSideBarOpen(window.innerWidth > 640)
		}, [])

		useEffect(() => {
			setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		}, [])

		useEffect(() => {
			let timeoutId
			timeoutId = setTimeout(() => {
				const categoriesParam = searchParams.get('category')
				const termsParam = searchParams.get('terms')
				const authorsParam = searchParams.get('authors')
				const draftIsVisible = searchParams.get('draft')

				if (authorsParam) {
					filtersStore.selectedAuthors = authorsParam.split(',').map(Number)
				}
				if (draftIsVisible) {
					setDraftIsVisible(draftIsVisible === '1')
				}
				if (categoriesParam) {
					filtersStore.selectedCategories = categoriesParam.split(',').map(Number)
				}
				if (termsParam) {
					filtersStore.selectedTerms = termsParam.split(',').map(Number)
				}
			}, 300)
			return () => clearTimeout(timeoutId)
		}, [locale])

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

		const updateHistory = useCallback((key, updatedArray) => {
			const params = new URLSearchParams(searchParams.toString())
			if (updatedArray.length > 0) {
				params.set(key, updatedArray.join(','))
			} else {
				params.delete(key)
			}
			router.replace(`${pathname}?${params.toString()}`, { scroll: false })
		}, [pathname, router, searchParams])

		const handleAddCategory = useCallback(
			newItem => {
				const updatedArray = filtersStore.selectedCategories.includes(newItem)
					? filtersStore.selectedCategories.filter(item => item !== newItem)
					: [...filtersStore.selectedCategories, newItem]
				filtersStore.selectedCategories = updatedArray
				updateHistory('category', updatedArray)
			},
			[updateHistory]
		)

		const handleResetCategory = useCallback(
			items => {
				const updatedArray = filtersStore.selectedCategories.filter(
					term => !items.includes(term)
				)
				filtersStore.selectedCategories = updatedArray
				updateHistory('category', updatedArray)
			},
			[updateHistory]
		)

		const handleAllCategory = useCallback(
			() => {
				const updatedArray = CATEGORY_ARRAY.map(({ id }) => id)
				filtersStore.selectedCategories = updatedArray
				updateHistory('category', updatedArray)
			},
			[updateHistory, CATEGORY_ARRAY]
		)

		const handleAddTerm = useCallback(
			newItem => {
				const updatedArray = filtersStore.selectedTerms.includes(newItem)
					? filtersStore.selectedTerms.filter(item => item !== newItem)
					: [...filtersStore.selectedTerms, newItem]
				filtersStore.selectedTerms = updatedArray
				updateHistory('terms', updatedArray)
			},
			[updateHistory]
		)

		const handleResetTerm = useCallback(
			items => {
				const updatedArray = filtersStore.selectedTerms.filter(
					term => !items.includes(term)
				)
				filtersStore.selectedTerms = updatedArray
				updateHistory('terms', updatedArray)
			},
			[updateHistory]
		)

		const handleAllTerm = useCallback(
			terms => {
				const updatedArray = [...filtersStore.selectedTerms, ...terms.map(({ id }) => id).filter(id => !filtersStore.selectedTerms?.includes(id))]
				filtersStore.selectedTerms = updatedArray
				updateHistory('terms', updatedArray)
			},
			[updateHistory]
		)

		const handleAddAuthor = useCallback(
			newItem => {
				const updatedArray = filtersStore.selectedAuthors.includes(newItem)
					? filtersStore.selectedAuthors.filter(item => item !== newItem)
					: [...filtersStore.selectedAuthors, newItem]
				filtersStore.selectedAuthors = updatedArray
				updateHistory('authors', updatedArray)
			},
			[updateHistory]
		)

		const handleResetAuthor = useCallback(
			items => {
				const updatedArray = filtersStore.selectedAuthors.filter(
					term => !items.includes(term)
				)

				filtersStore.selectedAuthors = updatedArray
				updateHistory('authors', updatedArray)
			},
			[updateHistory]
		)

		const handleAllAuthor = useCallback(
			() => {
				const updatedArray = authors.map(({ id }) => id)
				filtersStore.selectedAuthors = updatedArray
				updateHistory('authors', updatedArray)
			},
			[authors, updateHistory]
		)

		const updateDraftIsVisible = () => {
			const _visible = !draftIsVisible
			setDraftIsVisible(_visible)

			updateHistory('draft', _visible ? ['1'] : [])
		}

		const changeFilterName = (value) => {
			if (value === null) return
			updateHistory('search', value?.length ? [value] : [])
		}

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
							<div className='relative'>
								<SearchInput
									changeFilterName={changeFilterName}
									placeholder={t('search_code')}
									variant='line'
								/>
							</div>
						</div>
					) : (
						<button
							className='sideBar pt-4 pb-1 sm:px-5 px-3 self-end text-zinc-400 hover:text-zinc-600 duration-300'
							onClick={() => {
								changeFilterName('')
								popupClose()
							}}
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
					{objects.length ? <ul className='flex flex-col sm:pb-4 pb-2 max-h-full overflow-y-auto scroll pt-0'>
						{objects
							.sort((a, b) => {
								return order.indexOf(a._type) - order.indexOf(b._type)
							})
							.map(obj => (
								<li key={obj.id}>
									<ObjectCard object={obj} />
								</li>
							))}
					</ul> : (searchParams?.get('search') && !isLoading ? <p className='sm:mt-4 mt-3 sm:px-5 px-3 pb-3'>{t('no_objects')}</p>
						: <div className='flex-1 h-full overflow-y-auto scroll sm:px-5 px-3 flex flex-col sm:space-y-3 space-y-1 w-full pb-3'>
							<MotionWrapper>
								{!!token && <div className='pl-0.5 sm:mt-4 mt-3'>
									<DraftSwitcher
										draftIsVisible={draftIsVisible}
										setDraftIsVisible={updateDraftIsVisible}
										label={t('grafts_visible')}
										type='all'
									/>
								</div>}

							</MotionWrapper>
							<div className='pb-1.5'>
								<p className='font-medium sm:text-xl text-lg sm:mb-1.5'>
									{t('map_layers')}
								</p>
								<div
									x-show='show'
									x-transition={true}
									className='sm:space-y-2.5 space-y-1'
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
									<ul className='flex flex-col z-10 max-h-full sm:space-y-2.5 space-y-1'>
										<li key={'authors'}>
											<Filter
												locale={locale}
												itemId={`author`}
												name={t('authors')}
												items={authors}
												type='authors'
												isMapFilter={true}
												selectedItems={authors
													.map(({ id }) => id)
													.filter(id => selectedAuthors?.includes(id))}
												addItem={handleAddAuthor}
												resetItems={handleResetAuthor}
												selectAll={handleAllAuthor}
											/>
										</li>
										<li key={'category'}>
											<Filter
												locale={locale}
												name={t('category')}
												itemId='category'
												items={CATEGORY_ARRAY}
												selectedItems={CATEGORY_ARRAY.map(
													({ id }) => id
												).filter(id => selectedCategories?.includes(id))}
												type='category'
												isMapFilter={true}
												addItem={handleAddCategory}
												resetItems={handleResetCategory}
												selectAll={handleAllCategory}
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
															locale={locale}
															itemId={item.id}
															type='classif'
															isMapFilter={true}
															name={isEnglish ? item.nameEng : item.nameRu}
															sortByOrder={!item.isAlphabeticallOrder}
															items={item.terms}
															selectedItems={item.terms
																.map(({ id }) => id)
																.filter(id => selectedTerms?.includes(id))}
															addItem={handleAddTerm}
															resetItems={handleResetTerm}
															selectAll={() => handleAllTerm(item.terms)}
														/>
													</li>
												)
											}
										})}
									</ul>
								}
							</div>
						</div>)}
				</div>
			</div>
		)
	},
	// (prevProps, nextProps) => {
	// 	return (
	// 		prevProps.sidebarOpen === nextProps.sidebarOpen &&
	// 		prevProps.objects.map(({ id }) => id).toString() === nextProps.objects.map(({ id }) => id).toString() &&
	// 		prevProps.layersVisible === nextProps.layersVisible &&
	// 		prevProps.popupVisible === nextProps.popupVisible
	// 	)
	// }
)
export default SideBar
