'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import SoilObject from '@/components/soils/SoilObject'

import { useConstants } from '@/hooks/useConstants'

import CollapsibleText from '../admin-panel/ui-kit/CollapsibleText'
import CollapsibleHtml from '../admin-panel/ui-kit/CollapsibleHtml'

import { getTranslation } from '@/i18n/client'
import useSoil from '@/hooks/data/itemById/useSoil'

export default function SoilPageComponent({ id }) {
	const searchParams = useSearchParams()
	const { soil, soilIsLoading } = useSoil(id)
	const [parser, setParser] = useState()

	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const { SOIL_INFO, SOIL_ENUM } = useConstants()

	const _isEng = locale === 'en'
	const currentTransl = soil?.translations?.find(
		({ isEnglish }) => isEnglish === _isEng
	)

	useEffect(() => {
		if (typeof document !== 'undefined') {
			setParser(new DOMParser())
		}
	}, [])

	useEffect(() => {
		if (typeof document !== 'undefined' && currentTransl) {
			const title = currentTransl.name
			if (title) {
				document.title = `${title} | PhotoSOIL`
			}
		}
	}, [currentTransl, searchParams])

	return (
		<SoilObject
			object={soil ?? {}}
			type='soil'
			isLoading={soilIsLoading}
		>
			{!soilIsLoading && <ul className='flex flex-col space-y-2 '>
				{SOIL_INFO.map(({ name, title }) => {
					return (soil?.hasOwnProperty(name) ?? soil?.[name]?.length) ||
						(currentTransl?.hasOwnProperty(name) &&
							currentTransl[name]?.length) ? (
						<li
							key={name}
							className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'
						>
							<span className='xl:w-[40%] w-full text-zinc-500 font-semibold'>
								{title}
							</span>
							<div
								id={name}
								className='xl:w-[60%] w-full flex flex-col items-start'
							>
								{name === 'objectType' ? (
									<Link
										href={`/${locale}/soils?category=${soil.objectType}`}
										prefetch={false}
										className='text-blue-600 hover:underline'
									>
										{SOIL_ENUM[soil.objectType]}
									</Link>
								) : name === 'soilFeatures' ? (
									<CollapsibleText
										text={currentTransl[name]}
									/>
								) : name === 'comments' ? (
									<CollapsibleHtml
										className='tiptap'
										html={parser?.parseFromString(
											currentTransl[name] || '',
											'text/html'
										).body.innerHTML}
									/>
								) : (
									currentTransl[name]
								)}
							</div>
						</li>
					) : (
						''
					)
				})}
				{!soil.isExternal && soil.authors?.length ? (
					<li
						key='authors'
						className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'
					>
						<span className='xl:w-[40%] w-full text-zinc-500 font-semibold'>
							{t('authors')}
						</span>
						<ul
							className={`xl:w-[60%] w-full flex flex-row flex-wrap items-start justify-start h-fit`}
						>
							{soil.authors?.map(({ id, dataEng, dataRu }, index) => (
								<li
									key={`author-${index}`}
									className='mr-2 min-w-fit h-fit'
								>
									<Link
										href={`/${locale}/authors/${id}`}
										prefetch={false}
										className='text-blue-600 hover:underline'
									>
										{_isEng ? dataEng?.name : dataRu?.name}
									</Link>
									{soil.authors.length > 1 &&
										index + 1 < soil.authors.length &&
										','}
								</li>
							))}
						</ul>
					</li>
				) : (
					''
				)}
				{soil.classification?.map(
					({ nameRu, nameEng, terms, translationMode }, index) => {
						const isVisible =
							translationMode == 0 ||
							(_isEng ? translationMode == 1 : translationMode == 2)
						if (isVisible)
							return (
								<li
									key={`classification-${index}`}
									className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'
								>
									<span className='xl:w-[40%] w-full  text-zinc-500 font-semibold'>
										{_isEng ? nameEng : nameRu}
									</span>
									<ul
										className={`xl:w-[60%] w-full flex flex-row flex-wrap items-start justify-start h-fit`}
									>
										{terms.map(({ id, nameRu, nameEng }, index) => (
											<li
												key={`term-${id}`}
												className='mr-2 min-w-fit h-fit'
											>
												<Link
													href={`/${locale}/soils?terms=${id}`}
													prefetch={false}
													className='text-blue-600 hover:underline'
												>
													{_isEng ? nameEng : nameRu}
													{terms.length > 1 && index + 1 < terms.length && ','}
												</Link>
											</li>
										))}
									</ul>
								</li>
							)
					}
				)}
				{currentTransl?.code ? (
					<div className='flex xl:flex-row flex-col w-full xl:space-x-4 space-x-0'>
						<span className='xl:w-[40%] w-full text-zinc-500 font-semibold'>
							{t('code')}
						</span>
						<div className='xl:w-[60%] w-full flex flex-col items-start'>
							{currentTransl.code}
						</div>
					</div>
				) : (
					''
				)}
			</ul>}
		</SoilObject>
	)
}
