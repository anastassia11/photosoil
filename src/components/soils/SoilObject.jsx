'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import Loader from '../Loader'
import Publications from '../Publications'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'
import MapSelect from '../map/MapSelect'

import NewGallery from './NewGallery'
import Soils from './Soils'
import { getTranslation } from '@/i18n/client'
import '@/styles/editor.css'

export default function SoilObject({ object, children, type, isLoading = false }) {
	const searchParams = useSearchParams()

	const [mapVisible, setMapVisible] = useState(true)
	const [tokenData, setTokenData] = useState({})
	const [parser, setParser] = useState()

	const { locale } = useParams()
	const { t } = getTranslation(locale)

	let _isEng = locale === 'en'

	const handleScrollToSection = sectionId => {
		const section = document.getElementById(sectionId)
		section.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		if (typeof document !== 'undefined') {
			setParser(new DOMParser())
		}
		localStorage.getItem('tokenData') &&
			setTokenData(JSON.parse(localStorage.getItem('tokenData')))
	}, [])

	const Info = () => (
		<div className='mt-2 mb-4 md:ml-2 flex justify-between py-2 px-4 rounded-md border border-blue-300'>
			<div className='flex gap-3'>
				<div className='md:block hidden'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6 text-blue-400'
						viewBox='0 0 20 20'
						fill='currentColor'
					>
						<path
							fillRule='evenodd'
							d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
							clipRule='evenodd'
						/>
					</svg>
				</div>

				<div className='self-center'>
					<span className='text-zinc-500 font-medium'>{t('isExternal')}</span>
					<div className='text-zinc-600'>
						<div
							className='tiptap mt-1 sm:text-sm'
							dangerouslySetInnerHTML={{
								__html: parser?.parseFromString(
									object.translations?.find(
										({ isEnglish }) => isEnglish === _isEng
									)?.externalSource || '',
									'text/html'
								).body.innerHTML
							}}
						></div>
					</div>
				</div>
			</div>
		</div>
	)

	const filteredSoils = useMemo(() => {
		if (!object.soilObjects?.length) return null

		const filterName = searchParams.get('soils_search')
		const draftIsVisible = searchParams.get('soils_draft')

		const data = object.soilObjects.filter(soil => {
			const translation = soil.translations?.find(
				transl => transl.isEnglish === (locale === 'en')
			)
			const matchesSearch = !filterName || (
				translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
				translation?.code?.toLowerCase().includes(filterName.toLowerCase())
			)
			const matchesDraft = (draftIsVisible && draftIsVisible == 1) || translation?.isVisible
			return translation
				&& matchesSearch
				&& matchesDraft
		}).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
		return data
	}, [object, searchParams, locale])

	const filteredEcosystems = useMemo(() => {
		if (!object.ecoSystems?.length) return null

		const filterName = searchParams.get('ecosystems_search')
		const draftIsVisible = searchParams.get('ecosystems_draft')

		const data = object.ecoSystems.filter(ecosystem => {
			const translation = ecosystem.translations?.find(
				transl => transl.isEnglish === (locale === 'en')
			)
			const matchesSearch = !filterName || (
				translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
				translation?.code?.toLowerCase().includes(filterName.toLowerCase())
			)
			const matchesDraft = (draftIsVisible && draftIsVisible == 1) || translation?.isVisible
			return translation
				&& matchesSearch
				&& matchesDraft
		}).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
		return data
	}, [object, searchParams, locale])

	const filteredPublications = useMemo(() => {
		if (!object.publications?.length) return null

		const filterName = searchParams.get('publications_search')
		const draftIsVisible = searchParams.get('publications_draft')

		const data = object.publications.filter(publication => {
			const translation = publication.translations?.find(
				transl => transl.isEnglish === (locale === 'en')
			)
			const matchesSearch = !filterName || (
				translation?.name.toLowerCase().includes(filterName.toLowerCase())
			)
			const matchesDraft = (draftIsVisible && draftIsVisible == 1) || translation?.isVisible
			return translation
				&& matchesSearch
				&& matchesDraft
		}).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
		return data
	}, [object, searchParams, locale])

	if (!isLoading && Object.keys(object).length && !object.translations?.find(
		({ isEnglish }) => isEnglish === _isEng
	)) return <div className='items-center justify-center flex flex-col p-6 gap-6'>
		<p className='text-2xl font-medium'>{t('not_found')}</p>
		<p className='text-zinc-500'>{t('no_object')}</p>
	</div>

	return (
		<div className='flex flex-col'>
			<div className='flex flex-col sm:flex-row mb-2 justify-between sm:items-start'>
				<div className='w-full'>
					{object.translations ? (
						<MotionWrapper>
							<h1 className='sm:text-2xl text-xl font-semibold w-full'>
								{
									object.translations?.find(
										({ isEnglish }) => isEnglish === _isEng
									)?.name
								}
							</h1>
						</MotionWrapper>
					) : (
						<Loader className='w-[80%] h-[30px]' />
					)}
				</div>
				{(tokenData.role === 'Admin' ||
					tokenData.email === object.userEmail) && (
						<Link
							target='_blank'
							prefetch={false}
							className='pt-[3px] text-blue-700 cursor-pointer flex flex-row items-center hover:underline duration-300'
							href={{
								pathname: `/${locale}/admin/${type === 'soil' ? 'objects' : 'ecosystems'}/edit/${object.id}`,
								query: { lang: _isEng ? 'eng' : 'ru' }
							}}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth='1.5'
								stroke='currentColor'
								className='size-5 mr-1'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
								/>
							</svg>
							<p className='pt-[3px]'>{t('edit_go')}</p>
						</Link>
					)}
			</div>

			<div className='flex md:flex-row w-full md:border-b-2 md:border-l-0 flex-col'>
				<button
					className={`w-fit font-semibold pl-2 md:pl-0 md:border-l-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 md:mr-10 mr-4 md:py-2 py-1.5 text-sm sm:text-base 
                ${!object.stats?.soilObjects?.[locale] && 'hidden'}`}
					onClick={() => handleScrollToSection('soilObjects-section')}
				>
					{t('connect_soils')} ({object.stats?.soilObjects?.[locale]})
				</button>
				<button
					className={`w-fit font-semibold md:border-l-0 pl-2 md:pl-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 md:mr-10 mr-4 md:py-2 py-1.5 text-sm sm:text-base
                ${!object.stats?.ecoSystems?.[locale] && 'hidden'}`}
					onClick={() => handleScrollToSection('ecosystems-section')}
				>
					{t('connect_ecosystems')} ({object.stats?.ecoSystems?.[locale]})
				</button>
				<button
					className={`w-fit font-semibold md:border-l-0 pl-2 md:pl-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 md:mr-10 mr-4 md:py-2 py-1.5 text-sm sm:text-base
                ${!object.stats?.publications?.[locale] && 'hidden'}`}
					onClick={() => handleScrollToSection('publications-section')}
				>
					{t('connect_publ')} ({object.stats?.publications?.[locale]})
				</button>
				<button
					className={`text-blue-600 w-fit font-semibold text-sm sm:text-base md:border-l-0 pl-2 md:pl-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 md:py-2 py-1.5
                ${!object.latitude && 'hidden'}`}
					onClick={() => handleScrollToSection('map-section')}
				>
					{t('show_inMap')}
				</button>
			</div>
			<div className='flex md:flex-row flex-col mt-6 relaltive'>
				<div className='duration-300 md:sticky relative md:top-24 w-full md:min-w-[50%] md:max-w-[50%] lg:max-w-[550px] lg:min-w-[550px] h-fit'>
					{object.photo ? (
						<MotionWrapper>
							<div
								className='lg:aspect-[55/48] aspect-[9/16] overflow-hidden'
							>
								<NewGallery
									mainPhoto={object.photo}
									objectPhoto={object.objectPhoto}
								/>
							</div>
							{object.isExternal ? <Info /> : ''}
						</MotionWrapper>
					) : (
						<div className='opacity-90 absolute top-0 h-full w-full grid gap-2 lg:grid-cols-[106px_minmax(0px,_1fr)]'>
							<div className='max-h-full overflow-hidden flex lg:flex-col lg:space-y-2 lg:space-x-0 space-x-2 lg:px-2 lg:order-1 order-2 py-2 lg:py-0'>
								{Array(5)
									.fill('')
									.map((item, idx) => (
										<Loader
											key={idx}
											className='lg:w-full min-w-[90px] min-h-[135px]'
										/>
									))}
							</div>
							<Loader className='w-full h-[480px] lg:order-2 order-1' />
						</div>
					)}
				</div>
				{!!Object.keys(object).length && (
					<div className='md:ml-8 mt-6 md:mt-0 w-full'>
						{children}
					</div>
				)}
			</div>
			{!!object.latitude && (
				<div id='map-section'>
					<button
						className='text-blue-600 w-fit mt-6'
						onClick={() => setMapVisible(!mapVisible)}
					>
						{mapVisible ? t('hide_map') : t('show_map')}
					</button>
					{mapVisible && (
						<div className='mt-4 border rounded-lg overflow-hidden'>
							<div className='relative w-full sm:aspect-[2/1] aspect-square'>
								<MapSelect
									type={type}
									latitude={object?.latitude}
									longtitude={object?.longtitude}
								/>
							</div>
						</div>
					)}
				</div>
			)}

			{!!object.stats?.soilObjects?.[locale] && (
				<div id='soilObjects-section'>
					<h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
						{t('connect_soils')}
					</h3>
					<Soils
						_soils={filteredSoils}
						type='soils'
					/>
				</div>
			)}
			{!!object.stats?.ecoSystems?.[locale] && (
				<div id='ecosystems-section'>
					<h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
						{t('connect_ecosystems')}
					</h3>
					<Soils
						_soils={filteredEcosystems}
						type='ecosystems'
					/>
				</div>
			)}
			{!!object.stats?.publications?.[locale] && (
				<div id='publications-section'>
					<h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
						{t('connect_publ')}
					</h3>
					<Publications
						_publications={filteredPublications}
						isChild={true} />
				</div>
			)}
		</div>
	)
}
