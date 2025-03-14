'use client'

import moment from 'moment'
import Link from 'next/link'
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams
} from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useSnapshot } from 'valtio'

import Loader from '@/components/Loader'
import Pagination from '@/components/Pagination'
import Dropdown from '@/components/admin-panel/ui-kit/Dropdown'
import MotionWrapper from '@/components/admin-panel/ui-kit/MotionWrapper'
import Filter from '@/components/soils/Filter'

import { filtersStore } from '@/store/valtioStore/filtersStore'

import { PAGINATION_OPTIONS } from '@/utils/constants'

import { getAllNews } from '@/api/news/get_allNews'
import { getTags } from '@/api/tags/get_tags'

import { getTranslation } from '@/i18n/client'

export default function NewsPageComponent() {
	const pathname = usePathname()
	const [news, setNews] = useState([])
	const [filterName, setFilterName] = useState('')
	const [filteredNews, setFilteredNews] = useState([])
	const [currentItems, setCurrentItems] = useState([])
	const [tags, setTags] = useState([])
	const [token, setToken] = useState(false)
	const [draftIsVisible, setDraftIsVisible] = useState(false)
	const [itemsPerPage, setItemsPerPage] = useState(0)
	const [isLoading, setIsLoading] = useState({
		items: true,
		tags: true
	})
	const dropdown = useSelector(state => state.general.dropdown)

	const didLogRef = useRef(true)
	const searchParams = useSearchParams()
	const router = useRouter()
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { selectedTags } = useSnapshot(filtersStore)

	const _isEng = locale === 'en'

	const _filteredNews = useMemo(() => {
		const _filterName = filterName.toLowerCase().trim()
		return news
			.filter(
				item =>
					(draftIsVisible
						? true
						: item.translations?.find(transl => transl.isEnglish === _isEng)
								?.isVisible) &&
					item.translations
						?.find(transl => transl.isEnglish === _isEng)
						?.title.toLowerCase()
						.includes(_filterName) &&
					(selectedTags.length === 0 ||
						selectedTags.some(selectedTag =>
							item.tags.some(({ id }) => id === selectedTag)
						))
			)
			.sort((a, b) => {
				// const dateA = new Date(a.createdDate);
				// const dateB = new Date(b.createdDate);
				return b.createdDate - a.createdDate
			})
	}, [filterName, news, draftIsVisible, selectedTags])

	useEffect(() => {
		let timeoutId

		localStorage.getItem('tokenData') &&
			setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		fetchTags()
		fetchNews()
		if (didLogRef.current) {
			timeoutId = setTimeout(() => {
				didLogRef.current = false
				const tagsParam = searchParams.get('tags')
				tagsParam &&
					tagsParam.split(',').forEach(param => handleAddTag(Number(param)))
			}, 300)
		}
		return () => {
			clearTimeout(timeoutId)
		}
	}, [])

	useEffect(() => {
		setFilteredNews(_filteredNews)
	}, [_filteredNews])

	// useEffect(() => {
	//     updateFiltersInHistory();
	// }, [selectedTags])

	const updateFiltersInHistory = () => {
		const params = new URLSearchParams(searchParams.toString())

		if (selectedTags.length > 0) {
			params.set('tags', selectedTags.join(','))
		} else {
			params.delete('tags')
		}
		router.replace(pathname + '?' + params.toString())
	}

	const handleAddTag = useCallback(
		newItem => {
			filtersStore.selectedTags = selectedTags.includes(newItem)
				? selectedTags.filter(item => item !== newItem)
				: [...selectedTags, newItem]
		},
		[selectedTags]
	)

	const fetchNews = async () => {
		const result = await getAllNews()
		if (result.success) {
			setNews(result.data)
		}
		setIsLoading(prev => ({ ...prev, items: false }))
	}

	const fetchTags = async () => {
		const result = await getTags()
		if (result.success) {
			setTags(result.data)
		}
		setIsLoading(prev => ({ ...prev, tags: false }))
	}

	const NewsCard = ({ id, tags, translations }) => {
		const currentTransl =
			translations?.find(({ isEnglish }) => isEnglish === _isEng) || {}
		const date = new Date(currentTransl?.lastUpdated * 1000).toLocaleString()
		return (
			<Link
				href={`/${locale}/news/${id}`}
				prefetch={false}
				className='sm:px-8 px-4 py-4 bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-between'
			>
				<div className='flex flex-col'>
					<span className='text-sm font-light text-gray-600'>{date || ''}</span>

					<div className='mt-2'>
						<h3 className='sm:text-xl text-base font-medium text-gray-700 hover:text-gray-600'>
							{currentTransl?.title || ''}
						</h3>
						<p className='mt-2 text-gray-600'>
							{currentTransl?.annotation || ''}
						</p>
					</div>
				</div>
				<ul className='flex flex-row flex-wrap mt-4 align-bottom'>
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

	return (
		<div className='flex flex-col'>
			<h1 className='sm:text-2xl text-xl font-semibold mb-4'>{t('news')}</h1>

			<div className='relative w-full mb-4'>
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
					placeholder={t('search_heading')}
					className='w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600'
				/>
			</div>
			<div className={`flex flex-row justify-end items-center`}>
				<div className='self-end flex-row items-center justify-center w-[190px]'>
					<Dropdown
						name={t('in_page')}
						value={itemsPerPage}
						items={PAGINATION_OPTIONS}
						onCategotyChange={setItemsPerPage}
						flexRow={true}
						dropdownKey='in_page'
						noBold={true}
					/>
				</div>
			</div>
			<MotionWrapper>
				<label
					htmlFor='draftIsVisible'
					className={`flex-row cursor-pointer my-4
                    flex ${!token ? 'hidden' : 'flex'}`}
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
			</MotionWrapper>
			<div className='mt-4 mb-6 filters-grid'>
				{isLoading.tags ? (
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
							resetItems={items => {
								filtersStore.selectedTags = selectedTags.filter(
									term => !items.includes(term)
								)
							}}
						/>
					</MotionWrapper>
				)}
			</div>

			<ul className='news-grid mb-4'>
				{isLoading.items ? (
					Array(8)
						.fill('')
						.map((item, idx) => (
							<li key={idx}>
								<Loader className='w-full h-full aspect-[2/1]' />
							</li>
						))
				) : news.length && filteredNews.length ? (
					currentItems.map((item, idx) => (
						<li
							key={`news_${idx}`}
							className='w-full h-full'
						>
							<MotionWrapper className='w-full h-full'>
								<NewsCard {...item} />
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

			<Pagination
				itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]}
				items={filteredNews}
				updateCurrentItems={setCurrentItems}
			/>
		</div>
	)
}
