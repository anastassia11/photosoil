'use client'

import Link from 'next/link'
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams
} from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSnapshot } from 'valtio'

import Loader from '@/components/Loader'
import Pagination from '@/components/Pagination'
import MotionWrapper from '@/components/admin-panel/ui-kit/MotionWrapper'
import Filter from '@/components/soils/Filter2'

import { filtersStore } from '@/store/valtioStore/filtersStore'

import { BASE_SERVER_URL, PAGINATION_OPTIONS } from '@/utils/constants'

import { getTranslation } from '@/i18n/client'
import Image from 'next/image'
import DraftSwitcher from '../map/DraftSwitcher'
import useNews from '@/hooks/data/useNews'
import { recoveryItemsPerPage } from '@/utils/common'
import PerPageSelect from '../PerPageSelect'
import SearchInput from '../map/SearchInput'

export default function NewsPageComponent() {
	const pathname = usePathname()
	const { news, newsIsLoading,
		tags, tagsIsLoading } = useNews()

	const [currentItems, setCurrentItems] = useState([])

	const [draftIsVisible, setDraftIsVisible] = useState(false)
	const [itemsPerPage, setItemsPerPage] = useState()

	const dropdown = useSelector(state => state.general.dropdown)

	const searchParams = useSearchParams()
	const router = useRouter()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { selectedTags } = useSnapshot(filtersStore)

	const _isEng = locale === 'en'

	useEffect(() => {
		const value = recoveryItemsPerPage({ key: 'news', pathname })
		setItemsPerPage(value)
	}, [pathname])

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const tagsParam = searchParams.get('tags')

			if (tagsParam) {
				filtersStore.selectedTags = tagsParam.split(',').map(Number)
			}
		}, 100)

		return () => clearTimeout(timeoutId)
	}, [locale, pathname, router])

	const updateHistory = useCallback((key, updatedArray) => {
		const params = new URLSearchParams(searchParams.toString())

		if (updatedArray.length > 0) {
			params.set(key, updatedArray.join(','))
		} else {
			params.delete(key)
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, [pathname, router, searchParams])

	const handleAddTag = useCallback(
		newItem => {
			const updatedArray = filtersStore.selectedTags.includes(newItem)
				? filtersStore.selectedTags.filter(item => item !== newItem)
				: [...filtersStore.selectedTags, newItem]
			filtersStore.selectedTags = updatedArray
			updateHistory('tags', updatedArray)
		},
		[updateHistory]
	)

	const handleResetTag = useCallback(
		items => {
			const updatedArray = filtersStore.selectedTags.filter(
				term => !items.includes(term)
			)
			filtersStore.selectedTags = updatedArray
			updateHistory('tags', updatedArray)
		},
		[updateHistory]
	)

	const handleAllTag = useCallback(
		idsToSelect => {
			const updatedArray = idsToSelect || tags.map(({ id }) => id)
			filtersStore.selectedTags = updatedArray
			updateHistory('tags', updatedArray)
		},
		[tags, updateHistory]
	)

	const updateCurrPage = (currPage) => {
		updateHistory('page', currPage ? [currPage] : [])
	}

	const NewsCard = ({ id, tags, translations, photo }) => {
		const currentTransl =
			translations?.find(({ isEnglish }) => isEnglish === _isEng) || {}
		const date = new Date(currentTransl?.lastUpdated * 1000).toLocaleString()
		return (
			<Link
				href={`/${locale}/news/${id}`}
				prefetch={false}
				className='bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-between overflow-hidden'
			>
				{!!photo && <Image
					src={`${BASE_SERVER_URL}${photo.pathResize.length ? photo.pathResize : photo.path}`}
					width={500}
					height={500}
					alt='soil'
					className='m-auto w-full duration-300 h-full object-cover self-start 
						aspect-[4/2] overflow-hidden' />}
				<div className='flex flex-col px-4 sm:px-8 pt-4'>
					<span className='text-sm font-light text-gray-600'>{date || ''}</span>

					<div className='mt-2'>
						<h3 className='sm:text-xl text-base font-medium text-gray-700 hover:text-gray-600 line-clamp-3'>
							{currentTransl?.title || ''}
						</h3>
						<p className={`mt-2 text-gray-600 ${photo ? 'line-clamp-4' : ''}`}>
							{currentTransl?.annotation || ''}
						</p>
					</div>
				</div>
				<ul className='px-4 sm:px-8 pb-4 flex flex-row flex-wrap mt-4 align-bottom'>
					{tags.map(({ id, nameRu, nameEng }) => (
						<li
							key={`tag-${id}`}
							className='text-blue-600 min-w-fit mr-4'
						>
							{_isEng ? nameEng || '' : nameRu || ''}
						</li>
					))}
				</ul>
			</Link>
		)
	}

	const updateDraftIsVisible = () => {
		const _visible = !draftIsVisible
		setDraftIsVisible(_visible)

		updateHistory('draft', _visible ? ['1'] : [])
	}

	const changeFilterName = (value) => {
		if (value === null) return
		updateHistory('search', value.length ? [value] : [])
	}

	return (
		<div className='flex flex-col'>
			<h1 className='sm:text-2xl text-xl font-semibold mb-4'>{t('news')}</h1>

			<div className='relative w-full mb-4'>
				<SearchInput
					changeFilterName={changeFilterName}
					placeholder={t('search_heading')}
				/>
			</div>
			<div className={`flex flex-row justify-end items-center`}>
				<PerPageSelect itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} type='news' />
			</div>
			<MotionWrapper className='my-4 pl-0.5'>
				<DraftSwitcher draftIsVisible={draftIsVisible} setDraftIsVisible={updateDraftIsVisible} label={t('grafts_visible')}
					type='news' />
			</MotionWrapper>

			<div className='mt-4 mb-6 filters-grid'>
				{tagsIsLoading ? (
					<Loader className='w-full h-[40px]' />
				) : (
					<MotionWrapper>
						<Filter
							locale={locale}
							dropdown={dropdown}
							itemId='tags'
							type='news-tags'
							name={t('tags')}
							items={tags}
							selectedItems={tags
								.map(({ id }) => id)
								.filter(id => selectedTags?.includes(id))}
							addItem={handleAddTag}
							resetItems={handleResetTag}
							selectAll={handleAllTag}
						/>
					</MotionWrapper>
				)}
			</div>

			<ul className='news-grid mb-4'>
				{newsIsLoading ? (
					Array(8)
						.fill('')
						.map((item, idx) => (
							<li key={idx}>
								<Loader className='w-full h-full aspect-[2/1]' />
							</li>
						))
				) : news.length ? (
					currentItems.map(({ id, tags, translations, objectPhoto }, idx) => (
						<li
							key={`news_${idx}`}
							className='w-full h-full'
						>
							<MotionWrapper className='w-full h-full'>
								<NewsCard id={id} tags={tags} translations={translations}
									photo={objectPhoto[0]} />
							</MotionWrapper>
						</li>
					))
				) : (
					<MotionWrapper className='col-span-full'>
						<p className='text-gray-500 mt-6 col-span-full'>
							{t('no_objects')}
						</p>
					</MotionWrapper>
				)}
			</ul>

			{!!news.length && <Pagination
				itemsPerPage={Number(PAGINATION_OPTIONS[itemsPerPage] ?? 12)}
				items={news}
				updateCurrentItems={setCurrentItems}
				currPage={Number(searchParams.get('page'))}
				setCurrPage={updateCurrPage}
			/>}
		</div>
	)
}
