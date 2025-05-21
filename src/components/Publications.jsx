'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useConstants } from '@/hooks/useConstants'

import { PAGINATION_OPTIONS } from '@/utils/constants'

import { getPublications } from '@/api/publication/get_publications'

import Loader from './Loader'
import Pagination from './Pagination'
import MotionWrapper from './admin-panel/ui-kit/MotionWrapper'
import { getTranslation } from '@/i18n/client'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import DraftSwitcher from './map/DraftSwitcher'

export default function Publications({ _publications }) {
	const [filterName, setFilterName] = useState('')
	const [publications, setPublications] = useState([])
	const [filteredPublications, setFilteredPublications] = useState([])
	const [currentItems, setCurrentItems] = useState([])
	const [itemsPerPage, setItemsPerPage] = useState(0)
	const [draftIsVisible, setDraftIsVisible] = useState(false)
	const [token, setToken] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { PUBLICATION_ENUM } = useConstants()

	const _isEng = locale === 'en'

	useEffect(() => {
		localStorage.getItem('tokenData') &&
			setToken(JSON.parse(localStorage.getItem('tokenData'))?.token)
		if (_publications) {
			setPublications(_publications)
			setIsLoading(false)
		} else fetchPublications()
	}, [])

	useEffect(() => {
		const _filterName = filterName.toLowerCase().trim()
		setFilteredPublications(prev =>
			publications
				.filter(
					publication =>
						(draftIsVisible
							? true
							: publication.translations?.find(
								transl => transl.isEnglish === _isEng
							)?.isVisible) &&
						publication.translations
							?.find(transl => transl.isEnglish === _isEng)
							?.name.toLowerCase()
							.includes(_filterName)
				)
				.sort((a, b) => {
					return b.createdDate - a.createdDate
				})
		)
	}, [filterName, publications, draftIsVisible])

	const fetchPublications = async () => {
		const result = await getPublications()
		if (result.success) {
			setPublications(result.data)
		}
		setIsLoading(false)
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
						onChange={e => setFilterName(e.target.value)}
						type='text'
						placeholder={t('search_title')}
						className='w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600'
					/>
				</div>
			</div>
			<div className={`flex flex-row justify-end items-center`}>
				<div className='self-end flex flex-row items-center justify-end w-[190px] space-x-2'>
					<Label htmlFor="in_page"
						className='text-base min-w-fit'>{t('in_page')}</Label>
					<Select
						id="in_page"
						value={itemsPerPage.toString()}
						onValueChange={setItemsPerPage}>
						<SelectTrigger className="text-base w-[70px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent className='min-w-0'>
							{Object.entries(PAGINATION_OPTIONS).map(([value, title]) =>
								<SelectItem key={value} value={value.toString()}
									className='text-base'>{title}</SelectItem>)}
						</SelectContent>
					</Select>
				</div>
			</div>

			<MotionWrapper className='my-4 pl-0.5'>
				<DraftSwitcher draftIsVisible={draftIsVisible} setDraftIsVisible={setDraftIsVisible} label={t('grafts_visible')} />
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
						) : publications.length && filteredPublications.length ? (
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
			<Pagination
				itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]}
				items={filteredPublications}
				updateCurrentItems={setCurrentItems}
			/>
		</div>
	)
}
