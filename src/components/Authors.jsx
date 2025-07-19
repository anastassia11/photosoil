'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { BASE_SERVER_URL, PAGINATION_OPTIONS } from '@/utils/constants'

import Loader from './Loader'
import Pagination from './Pagination'
import MotionWrapper from './admin-panel/ui-kit/MotionWrapper'
import { getTranslation } from '@/i18n/client'
import useAuthors from '@/hooks/data/useAuthors'
import PerPageSelect from './PerPageSelect'
import { recoveryItemsPerPage } from '@/utils/common'

export default function Authors() {
	const { locale } = useParams()
	const pathname = usePathname()
	const router = useRouter()

	const didLogRef = useRef(true)

	const searchParams = useSearchParams()

	const { t } = getTranslation(locale)
	const { authors, authorsIsLoading } = useAuthors()

	const [filterName, setFilterName] = useState('')

	const [currentItems, setCurrentItems] = useState([])
	const [itemsPerPage, setItemsPerPage] = useState()

	const _isEng = locale === 'en'

	useEffect(() => {
		const value = recoveryItemsPerPage({ key: 'authors', pathname })
		setItemsPerPage(value)
	}, [pathname])

	useEffect(() => {
		let timeoutId

		if (didLogRef.current) {
			timeoutId = setTimeout(() => {
				const filterName = searchParams.get('search')

				if (filterName) {
					setFilterName(filterName)
				}
				didLogRef.current = false
			}, 300)
		}
		return () => clearTimeout(timeoutId)
	}, [])

	const updateHistory = useCallback((key, updatedArray) => {
		const params = new URLSearchParams(searchParams.toString())

		if (updatedArray.length > 0) {
			params.set(key, updatedArray.join(','))
		} else {
			params.delete(key)
		}
		router.replace(`${pathname}?${params.toString()}`, { scroll: false })
	}, [pathname, router, searchParams])

	const updateCurrPage = (currPage) => {
		updateHistory('page', currPage ? [currPage] : [])
	}

	const AuthorCard = ({ photo, dataEng, dataRu, authorType, id }) => {
		return (
			<Link
				href={`/${locale}/authors/${id}`}
				prefetch={false}
				className='relative aspect-[2/3] overflow-hidden
    rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300 flex flex-col  cursor-pointer'
			>
				<div className='w-full h-full relative'>
					{photo && (
						<Image
							src={`${BASE_SERVER_URL}${
								// photo.pathResize.length
								false ? photo.pathResize : photo.path
								}`}
							width={500}
							height={500}
							alt='soil'
							className='m-auto w-full h-full object-cover self-start'
						/>
					)}
				</div>
				<div className='absolute right-4 top-4'>
					{authorType !== undefined && (
						<div className='flex items-center gap-x-2'>
							{authorType == '0' ? (
								<p className='px-5 py-1 text-sm text-red-600 rounded-full bg-red-100/70'>
									{t('main_editor')}
								</p>
							) : authorType == '1' ? (
								<p className='px-5 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70'>
									{t('executive_editor')}
								</p>
							) : authorType == '2' ? (
								<p className='px-5 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70'>
									{t('editor')}
								</p>
							) : (
								''
							)}
						</div>
					)}
				</div>
				<div className='flex flex-col space-y-2 p-4 z-10 absolute bottom-0 h-[25%] backdrop-blur-sm bg-white/50 w-full rounded-b-md'>
					<p className='text-base font-medium text-black'>
						{_isEng ? dataEng.name || '' : dataRu.name || ''}
					</p>
					<p className='text-blue-700 '>
						{_isEng ? dataEng.organization || '' : dataRu.organization || ''}
					</p>
				</div>
			</Link>
		)
	}

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
						onChange={e => {
							setFilterName(e.target.value)
							updateHistory('search', e.target.value.length ? [e.target.value] : [])
						}}
						type='text'
						placeholder={t('search_name')}
						className='w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600'
					/>
				</div>
			</div>
			<div className={`flex flex-row justify-end  items-center mb-4`}>
				<PerPageSelect itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} type='authors' />
			</div>

			<ul className='soils-grid mb-4'>
				{authorsIsLoading ? (
					Array(8)
						.fill('')
						.map((item, idx) => (
							<li key={idx}>
								<Loader className='w-full h-full aspect-[2/3]' />
							</li>
						))
				) : authors.length ? (
					currentItems.map(author => (
						<li key={author.id}>
							<MotionWrapper>{AuthorCard({ ...author })}</MotionWrapper>
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
			{!!authors.length && <Pagination
				itemsPerPage={Number(PAGINATION_OPTIONS[itemsPerPage] ?? 12)}
				items={authors}
				updateCurrentItems={setCurrentItems}
				currPage={Number(searchParams.get('page'))}
				setCurrPage={updateCurrPage}
			/>}
		</div>
	)
}
