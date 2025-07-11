'use client'

import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams
} from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSnapshot } from 'valtio'

import { filtersStore } from '@/store/valtioStore/filtersStore'

import { useConstants } from '@/hooks/useConstants'

import { PAGINATION_OPTIONS } from '@/utils/constants'

import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import { getSoils } from '@/api/soil/get_soils'

import Loader from '../Loader'
import Pagination from '../Pagination'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'

import Filter from './Filter'
import SoilCard from './SoilCard'
import { getTranslation } from '@/i18n/client'
import DraftSwitcher from '../map/DraftSwitcher'
import useAuthors from '@/hooks/data/useAuthors'
import useClassifications from '@/hooks/data/useClassifications'
import PerPageSelect from '../PerPageSelect'
import { recoveryItemsPerPage } from '@/utils/common'

export default function Soils({ _soils, isAllSoils, isFilters, type }) {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const didLogRef = useRef(true)
	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()

	const { selectedTerms, selectedCategories, selectedAuthors } =
		useSnapshot(filtersStore)

	const { classifications, classificationsIsLoading } = useClassifications()
	const [soils, setSoils] = useState([])

	const { authors, authorsIsLoading } = useAuthors()

	const [filterName, setFilterName] = useState('')
	const [filtersVisible, setFiltersVisible] = useState(true)
	const [filteredSoils, setFilteredSoils] = useState([])

	const [currentItems, setCurrentItems] = useState([])

	const [itemsPerPage, setItemsPerPage] = useState()

	const [isLoading, setIsLoading] = useState({
		items: true,
		classifications: true
	})

	const [draftIsVisible, setDraftIsVisible] = useState(false)
	const [token, setToken] = useState(null)

	const { SOIL_ENUM2 } = useConstants()
	const SOIL_ENUM_REF = useRef(SOIL_ENUM2)

	const CATEGORY_ARRAY = useMemo(() => {
		return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
			id: Number(key),
			name: value[locale]
		}))
	}, [SOIL_ENUM_REF, locale])

	const _isEng = locale === 'en'

	const isSoils =
		type === 'soils' ||
		type === 'profiles' ||
		type === 'morphological' ||
		type === 'dynamics'

	useEffect(() => {
		const value = recoveryItemsPerPage({ isChild: !isFilters, key: type, pathname })
		setItemsPerPage(value)
	}, [isFilters, type, pathname])

	useEffect(() => {
		let timeoutId
		setFiltersVisible(window.innerWidth > 640 || type === 'ecosystem')
		setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		if (_soils) {
			setSoils(_soils)
			setIsLoading(prev => ({ ...prev, items: false }))
		} else fetchItems()

		if (didLogRef.current && isFilters) {
			timeoutId = setTimeout(() => {
				didLogRef.current = false
				const categoriesParam = searchParams.get('categories')
				const termsParam = searchParams.get('terms')
				const authorsParam = searchParams.get('authors')

				categoriesParam &&
					categoriesParam
						.split(',')
						.forEach(param => handleAddCategory(Number(param)))
				termsParam &&
					termsParam.split(',').forEach(param => handleAddTerm(Number(param)))
				authorsParam &&
					authorsParam
						.split(',')
						.forEach(param => handleAddAuthor(Number(param)))
			}, 300)
		}
		return () => clearTimeout(timeoutId)
	}, [])

	useEffect(() => {
		const _filterName = filterName.toLowerCase().trim()
		soils?.length &&
			setFilteredSoils(
				soils
					.filter(
						soil =>
							(draftIsVisible
								? true
								: soil.translations?.find(transl => transl.isEnglish === _isEng)
									?.isVisible) &&
							(soil.translations
								?.find(transl => transl.isEnglish === _isEng)
								?.name.toLowerCase()
								.includes(_filterName) ||
								soil.translations
									?.find(transl => transl.isEnglish === _isEng)
									?.code?.toLowerCase()
									.includes(_filterName)) &&
							(selectedCategories.length === 0 ||
								selectedCategories.includes(soil.objectType)) &&
							(selectedAuthors.length === 0 ||
								selectedAuthors.some(selectedAuthor =>
									soil.authors?.some(author => author === selectedAuthor)
								)) &&
							(selectedTerms.length === 0 ||
								selectedTerms.some(selectedTerm =>
									soil.terms.some(term => term === selectedTerm)
								))
					)
					.sort((a, b) => {
						return b.createdDate - a.createdDate
					})
			)
	}, [
		filterName,
		selectedCategories,
		selectedTerms,
		selectedAuthors,
		soils,
		draftIsVisible
	])

	useEffect(() => {
		isFilters && !didLogRef.current && updateFiltersInHistory()
	}, [selectedCategories, selectedTerms, selectedAuthors])


	const fetchItems = async () => {
		const result =
			type === 'ecosystems' ? await getEcosystems() : await getSoils()
		if (result.success) {
			const data = result.data
			const items =
				type === 'profiles'
					? data.filter(soil => soil.objectType === 1)
					: type === 'dynamics'
						? data.filter(soil => soil.objectType === 0)
						: type === 'morphological'
							? data.filter(soil => soil.objectType === 2)
							: data
			setSoils(items)
		}
		setIsLoading(prev => ({ ...prev, items: false }))
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

	const handleAddCategory = useCallback(
		newItem => {
			filtersStore.selectedCategories = filtersStore.selectedCategories.includes(newItem)
				? filtersStore.selectedCategories.filter(item => item !== newItem)
				: [...filtersStore.selectedCategories, newItem]
		},
		[]
	)

	const handleAddTerm = useCallback(
		newItem => {
			filtersStore.selectedTerms = filtersStore.selectedTerms.includes(newItem)
				? filtersStore.selectedTerms.filter(item => item !== newItem)
				: [...filtersStore.selectedTerms, newItem]
		},
		[]
	)

	const handleAddAuthor = useCallback(
		newItem => {
			filtersStore.selectedAuthors = filtersStore.selectedAuthors.includes(newItem)
				? filtersStore.selectedAuthors.filter(item => item !== newItem)
				: [...filtersStore.selectedAuthors, newItem]
		},
		[]
	)

	return (
		<div className='flex flex-col'>
			<div className='relative flex flex-row space-x-2 mb-4'>
				<div className='relative w-full'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
						/>
					</svg>
					<input
						value={filterName}
						onChange={e => setFilterName(e.target.value)}
						type='text'
						placeholder={`${isSoils || type === 'ecosystems'
							? t('search_code')
							: t('search_name')
							}`}
						className='w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600'
					/>
				</div>
			</div>
			<div
				className={`flex flex-row w-full items-center ${isSoils && isFilters ? 'justify-between' : 'justify-end'}`}
			>
				{isSoils && isFilters ? (
					<button
						className='text-blue-600 w-fit'
						onClick={() => setFiltersVisible(!filtersVisible)}
					>
						{filtersVisible ? t('hide_filters') : t('show_filters')}
					</button>
				) : (
					''
				)}
				<PerPageSelect itemsPerPage={itemsPerPage}
					setItemsPerPage={setItemsPerPage}
					isChild={!isFilters}
					type={type}
				/>
			</div>
			{filtersVisible && isFilters ? (
				<ul className='filters-grid z-10 w-full mt-4'>
					<>
						{(type === 'ecosystems' && authorsIsLoading) || (classificationsIsLoading || authorsIsLoading) ? (
							Array(type === 'ecosystems' ? 1 : 8)
								.fill('')
								.map((item, idx) => (
									<li key={idx}>
										<Loader className='w-full h-[40px]' />
									</li>
								))
						) : (
							<>
								<MotionWrapper>
									<li key={'authors'}>
										<Filter
											locale={locale}
											// dropdown={dropdown}
											itemId={`author`}
											name={t('authors')}
											items={authors}
											type='authors'
											selectedItems={authors.map(({ id }) => id)
												.filter(id => selectedAuthors?.includes(id))}
											addItem={handleAddAuthor}
											resetItems={items => {
												filtersStore.selectedAuthors = selectedAuthors.filter(
													term => !items.includes(term)
												)
											}}
											selectAll={() =>
												(filtersStore.selectedAuthors = [...selectedAuthors, ...authors.map(({ id }) => id).filter(id => !selectedAuthors?.includes(id))])
											}
										/>
									</li>
								</MotionWrapper>
								{isAllSoils && (
									<li key='category'>
										<MotionWrapper>
											<Filter
												locale={locale}
												// dropdown={dropdown}
												name={t('category')}
												itemId='category'
												items={CATEGORY_ARRAY}
												selectedItems={CATEGORY_ARRAY.map(
													({ id }) => id
												).filter(id => selectedCategories?.includes(id))}
												type='category'
												addItem={handleAddCategory}
												resetItems={items => {
													filtersStore.selectedCategories =
														selectedCategories.filter(
															term => !items.includes(term)
														)
												}}
												selectAll={() =>
													(filtersStore.selectedCategories = [...selectedCategories, ...CATEGORY_ARRAY.map(({ id }) => id).filter(id => !selectedCategories?.includes(id))])
												}
											/>
										</MotionWrapper>
									</li>
								)}
								{type !== 'ecosystems' && classifications?.map(item => {
									const isEnglish = locale === 'en'
									const isTranslationModeValid =
										item.translationMode === 0 ||
										(isEnglish
											? item.translationMode === 1
											: item.translationMode === 2)
									if (isTranslationModeValid) {
										return (
											<li key={item.id}>
												<MotionWrapper>
													<Filter
														locale={locale}
														// dropdown={dropdown}
														itemId={item.id}
														type='classif'
														name={isEnglish ? item.nameEng : item.nameRu}
														sortByOrder={!item.isAlphabeticallOrder}
														items={item.terms}
														selectedItems={item.terms
															.map(({ id }) => id)
															.filter(id => selectedTerms?.includes(id))}
														addItem={handleAddTerm}
														resetItems={items => {
															filtersStore.selectedTerms = selectedTerms.filter(
																term => !items.includes(term)
															)
														}}
														selectAll={() =>
															(filtersStore.selectedTerms = [...selectedTerms, ...item.terms.map(({ id }) => id).filter(id => !selectedTerms?.includes(id))])
														}
													/>
												</MotionWrapper>
											</li>
										)
									}
								})}
							</>
						)}
					</>
				</ul>
			) : (
				''
			)}

			<MotionWrapper className='my-4 pl-0.5'>
				<DraftSwitcher draftIsVisible={draftIsVisible} setDraftIsVisible={setDraftIsVisible} label={t('grafts_visible')}
					type={type} />
			</MotionWrapper>

			<ul className='soils-grid my-4'>
				{isLoading?.items ? (
					Array(8)
						.fill('')
						.map((item, idx) => (
							<li key={idx}>
								<Loader className='aspect-[2/3]' />
							</li>
						))
				) : (
					<>
						{soils.length && filteredSoils.length ? (
							currentItems.map(
								({ id, photo, translations, dataRu, dataEng }) => (
									<li key={id}>
										<MotionWrapper>
											<SoilCard
												locale={locale}
												type={type}
												id={id}
												photo={photo}
												name={
													translations?.find(
														({ isEnglish }) => isEnglish === (locale === 'en')
													)?.name ||
													(locale === 'en'
														? dataEng.name
														: locale === 'ru'
															? dataRu.name
															: '')
												}
											/>
										</MotionWrapper>
									</li>
								)
							)
						) : (
							<MotionWrapper className='col-span-full'>
								<p className='text-gray-500 mt-6 col-span-full'>
									{t('no_objects')}
								</p>
							</MotionWrapper>
						)}
					</>
				)}
			</ul>
			<Pagination
				itemsPerPage={PAGINATION_OPTIONS[itemsPerPage] ?? 12}
				items={filteredSoils}
				updateCurrentItems={setCurrentItems}
			/>
		</div>
	)
}
