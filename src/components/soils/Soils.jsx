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
import SearchInput from '../map/SearchInput'

export default function Soils({ _soils, isAllSoils, isFilters = false, type }) {
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const pathname = usePathname()
	const router = useRouter()
	const searchParams = useSearchParams()

	const { selectedTerms, selectedCategories, selectedAuthors } =
		useSnapshot(filtersStore)

	const { classifications, classificationsIsLoading } = useClassifications()
	const [soils, setSoils] = useState([])

	const { authors, authorsIsLoading } = useAuthors({ needSort: false })

	const [filtersVisible, setFiltersVisible] = useState(true)

	const [currentItems, setCurrentItems] = useState([])

	const [itemsPerPage, setItemsPerPage] = useState()

	const [isLoading, setIsLoading] = useState({
		items: true,
		classifications: true
	})

	const [draftIsVisible, setDraftIsVisible] = useState(false)

	const { SOIL_ENUM2 } = useConstants()
	const SOIL_ENUM_REF = useRef(SOIL_ENUM2)
	const isChild = !isFilters

	const CATEGORY_ARRAY = useMemo(() => {
		return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
			id: Number(key),
			name: value[locale]
		}))
	}, [SOIL_ENUM_REF, locale])

	const isSoils =
		type === 'soils' ||
		type === 'profiles' ||
		type === 'morphological' ||
		type === 'dynamics'

	useEffect(() => {
		const value = recoveryItemsPerPage({ isChild, key: type, pathname })
		setItemsPerPage(value)
	}, [isFilters, type, pathname])

	useEffect(() => {
		setFiltersVisible(window.innerWidth > 640 || type === 'ecosystem')

		if (_soils) {
			setSoils(_soils)
			setIsLoading(prev => ({ ...prev, items: false }))
		}
	}, [_soils, type])

	useEffect(() => {
		let timeoutId
		timeoutId = setTimeout(() => {
			const authorsParam = searchParams.get('authors')
			const draftIsVisible = searchParams.get(isChild ? `${type}_draft` : 'draft')

			if (authorsParam) {
				filtersStore.selectedAuthors = authorsParam.split(',').map(Number)
			}
			if (draftIsVisible) {
				setDraftIsVisible(draftIsVisible === '1')
			}

			if (isSoils) {
				const categoriesParam = searchParams.get('category')
				const termsParam = searchParams.get('terms')
				if (categoriesParam) {
					filtersStore.selectedCategories = categoriesParam.split(',').map(Number)
				}
				if (termsParam) {
					filtersStore.selectedTerms = termsParam.split(',').map(Number)
				}
			}
		}, 300)
		return () => clearTimeout(timeoutId)
	}, [locale, isChild, isSoils, searchParams, type])

	const updateHistory = useCallback((key, updatedArray) => {
		const params = new URLSearchParams(searchParams.toString())
		if (updatedArray.length > 0) {
			params.set(key, updatedArray.join(','))
		} else {
			params.delete(key)
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, [pathname, router, searchParams])

	const updateDraftIsVisible = () => {
		const _visible = !draftIsVisible
		setDraftIsVisible(_visible)

		updateHistory(isChild ? `${type}_draft` : 'draft', _visible ? ['1'] : [])
	}

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

	const changeFilterName = (value) => {
		if (value === null) return
		updateHistory(isChild ? `${type}_search` : 'search', value.length ? [value] : [])
	}

	const updateCurrPage = (currPage) => {
		updateHistory(isChild ? `${type}_page` : 'page', currPage ? [currPage] : [])
	}

	return (
		<div className='flex flex-col'>
			<div className='relative flex flex-row space-x-2 mb-4'>
				<div className='relative w-full'>
					<SearchInput
						name={isChild ? `${type}_search` : 'search'}
						changeFilterName={changeFilterName}
						placeholder={`${isSoils || type === 'ecosystems'
							? t('search_code') : t('search_name')}`}
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
					isChild={isChild}
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
											itemId={`author`}
											name={t('authors')}
											items={authors}
											type='authors'
											selectedItems={authors.map(({ id }) => id)
												.filter(id => selectedAuthors?.includes(id))}
											addItem={handleAddAuthor}
											resetItems={handleResetAuthor}
											selectAll={handleAllAuthor}
										/>
									</li>
								</MotionWrapper>
								{isAllSoils && (
									<li key='category'>
										<MotionWrapper>
											<Filter
												locale={locale}
												name={t('category')}
												itemId='category'
												items={CATEGORY_ARRAY}
												selectedItems={CATEGORY_ARRAY.map(
													({ id }) => id
												).filter(id => selectedCategories?.includes(id))}
												type='category'
												addItem={handleAddCategory}
												resetItems={handleResetCategory}
												selectAll={handleAllCategory}
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
														itemId={item.id}
														type='classif'
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
				<DraftSwitcher draftIsVisible={draftIsVisible}
					setDraftIsVisible={updateDraftIsVisible}
					label={t('grafts_visible')}
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
						{soils.length ? (
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
													)?.name
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
			{!!soils.length && <Pagination
				itemsPerPage={Number(PAGINATION_OPTIONS[itemsPerPage] ?? 12)}
				items={soils}
				updateCurrentItems={setCurrentItems}
				currPage={Number(searchParams.get(isChild ? `${type}_page` : 'page'))}
				setCurrPage={updateCurrPage}
			/>}
		</div>
	)
}
