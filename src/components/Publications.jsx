'use client'

import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useConstants } from '@/hooks/useConstants'

import { PAGINATION_OPTIONS } from '@/utils/constants'

import Loader from './Loader'
import Pagination from './Pagination'
import MotionWrapper from './admin-panel/ui-kit/MotionWrapper'
import { getTranslation } from '@/i18n/client'
import DraftSwitcher from './map/DraftSwitcher'
import PerPageSelect from './PerPageSelect'
import { recoveryItemsPerPage } from '@/utils/common'
import SearchInput from './map/SearchInput'

export default function Publications({ _publications, isChild = false }) {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()

	const didLogRef = useRef(true)

	const [publications, setPublications] = useState([])
	const [currentItems, setCurrentItems] = useState([])
	const [itemsPerPage, setItemsPerPage] = useState()

	const [draftIsVisible, setDraftIsVisible] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const { locale } = useParams()

	const { t } = getTranslation(locale)
	const { PUBLICATION_ENUM } = useConstants()

	const _isEng = locale === 'en'

	useEffect(() => {
		const value = recoveryItemsPerPage({ isChild, key: 'publications', pathname })
		setItemsPerPage(value)
	}, [isChild, pathname])

	useEffect(() => {
		let timeoutId

		if (_publications) {
			setPublications(_publications)
			setIsLoading(false)
		}
		if (didLogRef.current) {
			timeoutId = setTimeout(() => {
				const draftIsVisible = searchParams.get(isChild ? `publications_draft` : 'draft')

				if (draftIsVisible) {
					setDraftIsVisible(draftIsVisible === '1')
				}
				didLogRef.current = false
			}, 300)
		}
		return () => clearTimeout(timeoutId)
	}, [_publications])

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
		updateHistory(isChild ? 'publications_draft' : 'draft', _visible ? ['1'] : [])
	}

	const changeFilterName = (value) => {
		if (value === null) return
		updateHistory(isChild ? 'publications_search' : 'search', value.length ? [value] : [])
	}

	const updateCurrPage = (currPage) => {
		updateHistory(isChild ? `publications_page` : 'page', currPage ? [currPage] : [])
	}

	return (
		<div className='flex flex-col'>
			<div className='relative flex flex-row space-x-2 mb-4'>
				<div className='relative w-full'>
					<SearchInput
						name={isChild ? `publications_search` : 'search'}
						changeFilterName={changeFilterName}
						placeholder={t('search_title')}
					/>
				</div>
			</div>
			<div className={`flex flex-row justify-end items-center`}>
				<PerPageSelect itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} isChild={isChild} type='publications' />
			</div>

			<MotionWrapper className='my-4 pl-0.5'>
				<DraftSwitcher draftIsVisible={draftIsVisible} setDraftIsVisible={updateDraftIsVisible} label={t('grafts_visible')}
					type='publications' />
			</MotionWrapper>

			<section className=''>
				<div className='mx-auto '>
					<ul className=''>
						{isLoading ? (
							Array(8)
								.fill('')
								.map((item, idx) => (
									<li
										key={idx}
										className={`mt-4 border-b flex flex-row`}
									>
										<Loader className='w-full h-[140px] mb-4 ' />
									</li>
								))
						) : publications.length ? (
							currentItems.map((item, idx) => (
								<li
									key={idx}
									className={`mt-4 ${idx + 1 === currentItems.length ? '' : 'border-b'} flex flex-row min-w-full`}
								>
									<MotionWrapper className='min-w-full'>
										<Link
											href={`/${locale}/publications/${item.id}`}
											prefetch={false}
											className='justify-between items-start flex flex-row flex-1 mb-4 sm:px-4 px-2 sm:py-5 py-3 cursor-pointer hover:bg-white
                                        rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300'
										>
											<div className='sm:space-y-3 space-y-1'>
												<div className='flex items-center gap-x-3'>
													<div>
														<span className='block text-indigo-600 font-medium'>
															{PUBLICATION_ENUM[item.type] || ''}
														</span>
														<h3 className='text-base text-gray-800 font-semibold mt-1'>
															{
																item.translations.find(
																	({ isEnglish }) => isEnglish === _isEng
																).name
															}
														</h3>
													</div>
												</div>
												<p className='text-gray-600'>
													{
														item.translations.find(
															({ isEnglish }) => isEnglish === _isEng
														).authors
													}
												</p>
												<p className='text-gray-600 flex items-center font-medium'>
													{
														item.translations.find(
															({ isEnglish }) => isEnglish === _isEng
														).edition
													}
												</p>
											</div>
										</Link>
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
				</div>
			</section>
			{!!publications.length && <Pagination
				itemsPerPage={Number(PAGINATION_OPTIONS[itemsPerPage] ?? 12)}
				items={publications}
				updateCurrentItems={setCurrentItems}
				currPage={Number(searchParams.get(isChild ? `publications_page` : 'page'))}
				setCurrPage={updateCurrPage}
			/>}
		</div>
	)
}
