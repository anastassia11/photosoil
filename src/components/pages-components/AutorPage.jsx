'use client'

import { isAbsoluteUrl } from 'next/dist/shared/lib/utils'
import Image from 'next/image'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import Soils from '@/components/soils/Soils'

import { useConstants } from '@/hooks/useConstants'

import { BASE_SERVER_URL } from '@/utils/constants'

import { getTranslation } from '@/i18n/client'
import '@/styles/editor.css'
import useAuthor from '@/hooks/data/itemById/useAuthor'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'
import Loader from '../Loader'

export default function AuthorPageComponent({ id }) {
	const searchParams = useSearchParams()
	const { author, authorIsLoading } = useAuthor(id)

	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { AUTHOR_INFO } = useConstants()
	const [parser, setParser] = useState()

	const authorLang = useMemo(() => {
		if (!author) return {}
		return locale === 'en'
			? author.dataEng
			: locale === 'ru'
				? author.dataRu
				: {}
	}, [locale, author])

	useEffect(() => {
		if (typeof document !== 'undefined' && authorLang) {
			const title = authorLang.name
			if (title) {
				document.title = `${title} | PhotoSOIL`
			}
			setParser(new DOMParser())
		}
	}, [authorLang, searchParams])

	const handleScrollToSection = sectionId => {
		const section = document.getElementById(sectionId)
		section.scrollIntoView({ behavior: 'smooth' })
	}

	function isEmail(email) {
		let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
		return regex.test(email)
	}

	const filteredSoils = useMemo(() => {
		if (!author?.soilObjects?.length) return null

		const filterName = searchParams.get('soils_search')
		const draftIsVisible = searchParams.get('soils_draft')

		const data = author.soilObjects.filter(soil => {
			const translation = soil.translations?.find(
				transl => transl.isEnglish === (locale === 'en')
			)
			const matchesSearch = !filterName || (
				translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
				translation?.code?.toLowerCase().includes(filterName.toLowerCase())
			)
			const matchesDraft = (draftIsVisible && draftIsVisible == 1) || translation?.isVisible
			return matchesSearch
				&& matchesDraft
		}).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
		return data
	}, [author, searchParams, locale])

	const filteredEcosystems = useMemo(() => {
		if (!author?.ecoSystems?.length) return null

		const filterName = searchParams.get('ecosystems_search')
		const draftIsVisible = searchParams.get('ecosystems_draft')

		const data = author.ecoSystems.filter(ecosystem => {
			const translation = ecosystem.translations?.find(
				transl => transl.isEnglish === (locale === 'en')
			)
			const matchesSearch = !filterName || (
				translation?.name.toLowerCase().includes(filterName.toLowerCase()) ||
				translation?.code?.toLowerCase().includes(filterName.toLowerCase())
			)
			const matchesDraft = (draftIsVisible && draftIsVisible == 1) || translation?.isVisible
			return matchesSearch
				&& matchesDraft
		}).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
		return data
	}, [author, searchParams, locale])

	return (
		<div className='flex flex-col'>
			{!authorIsLoading ? (
				<MotionWrapper>
					<h1 className='sm:text-2xl text-xl font-semibold mb-2 flex justify-between md:flex-row md:items-center flex-col'>
						{authorLang?.name}
						<span className='md:ml-4 mt-2 md:mt-0'>
							{author.authorType !== undefined && (
								<div className='flex items-center gap-x-2'>
									{author.authorType == '0' ? (
										<p className='px-3 py-1 text-sm text-red-600 rounded-full bg-red-100/70'>
											{t('main_editor')}
										</p>
									) : author.authorType == '1' ? (
										<p className='px-3 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70'>
											{t('executive_editor')}
										</p>
									) : author.authorType == '2' ? (
										<p className='px-3 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70'>
											{t('editor')}
										</p>
									) : (
										''
									)}
								</div>
							)}
						</span>
					</h1>
				</MotionWrapper>
			) : (
				<Loader className='w-full h-[30px] mb-2' />
			)}

			<div className='flex md:flex-row w-full md:border-b-2 md:border-l-0 flex-col'>
				{!authorIsLoading && <>
					<button
						className={`w-fit font-semibold pl-2 md:pl-0 md:border-l-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 md:mr-10 mr-4 md:py-2 py-1.5 text-sm sm:text-base
                ${!author.stats?.soilObjects?.[locale] && 'hidden'}`}
						onClick={() => handleScrollToSection('soil-section')}
					>
						{t('soils')} ({author.stats?.soilObjects?.[locale]})
					</button>
					<button
						className={`text-blue-600 w-fit font-semibold text-sm sm:text-base md:border-l-0 pl-2 md:pl-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 md:py-2 py-1.5
                ${!author.stats?.ecoSystems?.[locale] && 'hidden'}`}
						onClick={() => handleScrollToSection('ecosystems-section')}
					>
						{t('ecosystems')} ({author.stats?.ecoSystems?.[locale]})
					</button>
				</>}
			</div>

			<div className='filters-grid mt-6 md:space-x-8'>
				{!authorIsLoading ? (
					<MotionWrapper>
						<div className='flex md:justify-start justify-center'>
							{author.photo?.path && <Image
								src={`${BASE_SERVER_URL}${author.photo?.path}`}
								className='aspect-[3/4] object-cover object-top border border-blue-600 shadow-md rounded-xl'
								alt={authorLang?.name}
								width={500}
								height={500}
							/>}
						</div>
					</MotionWrapper>
				) : (
					<Loader className='w-full aspect-[3/4]' />
				)}

				{!authorIsLoading && <div className='md:col-start-2 md:col-end-4 mt-6 md:mt-0'>
					<ul className='flex flex-col space-y-2 '>
						{AUTHOR_INFO.map(({ title, name, isArray }, index) =>
							name !== 'name' &&
								((authorLang?.[name] && authorLang?.[name]?.length) ||
									(author[name] && author[name]?.length)) ? (
								<li
									key={`INFO-${index}`}
									className='flex flex-col w-full'
								>
									<span className=' text-zinc-500 font-semibold'>
										{isArray ? (author[name].length ? title : '') : title}
									</span>
									{isArray ? (
										<ul className='flex flex-col'>
											{author[name].map(item => (
												<li key={item}>
													{isAbsoluteUrl(item) ? (
														<a
															target='_blank'
															href={item}
															className='text-blue-600 break-words'
														>
															{item}
														</a>
													) : isEmail(item) ? (
														<a
															target='_blank'
															href={`mailto:${item}`}
															className='text-blue-600 break-words'
														>
															{item}
														</a>
													) : (
														item
													)}
												</li>
											))}
										</ul>
									) : (
										<div
											className='tiptap'
											dangerouslySetInnerHTML={{
												__html: parser?.parseFromString(
													authorLang[name] || '',
													'text/html'
												).body.innerHTML
											}}
										></div>
									)}
								</li>
							) : (
								''
							)
						)}
					</ul>
				</div>}
			</div>

			{!authorIsLoading && <>

				{!!author.stats?.soilObjects?.[locale] && (
					<div id='soil-section'>
						<h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
							{t('author_soils')}
						</h3>
						<Soils
							_soils={filteredSoils}
							type='soils'
							isFilters={false}
						/>
					</div>
				)}

				{!!author.stats?.ecoSystems?.[locale] && (
					<div id='ecosystems-section'>
						<h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
							{t('author_ecosystems')}
						</h3>
						<Soils
							_soils={filteredEcosystems}
							type='ecosystems'
							isFilters={false}
						/>
					</div>
				)}
			</>}
		</div>
	)
}
