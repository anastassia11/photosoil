'use client'

import moment from 'moment'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import NewGallery from '@/components/soils/NewGallery'
import PdfGallery from '@/components/soils/PdfGallery'

import { BASE_SERVER_URL } from '@/utils/constants'

import { getNewsById } from '@/api/news/get_news'

import { getTranslation } from '@/i18n/client'
import '@/styles/editor.css'

export default function NewsItemPageComponent({ id }) {
	const [news, setNews] = useState({})
	const [tokenData, setTokenData] = useState({})
	const { locale } = useParams()
	const { t } = getTranslation(locale)
	const [parser, setParser] = useState()

	let _isEng = locale === 'en'

	const currentTransl = news?.translations?.find(
		({ isEnglish }) => isEnglish === _isEng
	)
	const date = new Date(currentTransl?.lastUpdated * 1000).toLocaleString()

	useEffect(() => {
		localStorage.getItem('tokenData') &&
			setTokenData(JSON.parse(localStorage.getItem('tokenData')))
		document.documentElement.style.setProperty(
			'--product-view-height',
			window.innerWidth > 640 ? '600px' : '300px'
		)
		fetchNews()
	}, [])

	useEffect(() => {
		if (typeof document !== 'undefined' && currentTransl) {
			const title = currentTransl.title
			if (title) {
				document.title = `${title} | PhotoSOIL`
			}
			setParser(new DOMParser())
		}
	}, [currentTransl])

	const fetchNews = async () => {
		const result = await getNewsById(id)
		if (result.success) {
			setNews(result.data)
		}
	}

	const handleScrollToSection = sectionId => {
		const section = document.getElementById(sectionId)
		section.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<div className='flex flex-col'>
			<div className='flex flex-col md:flex-row mb-2 justify-between sm:items-start'>
				<h1 className='sm:text-2xl text-xl font-semibold'>
					{currentTransl?.title}
				</h1>
				{tokenData.role === 'Admin' || tokenData.email === news.userEmail ? (
					<Link
						target='_blank'
						prefetch={false}
						className='pt-[3px] text-blue-700 cursor-pointer flex flex-row items-center hover:underline duration-300 pb-1'
						href={{
							pathname: `/${locale}/admin/news/edit/${news.id}`,
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
				) : (
					''
				)}
			</div>
			<div className='flex md:flex-row w-full md:border-b-2 md:border-l-0 flex-col'>
				<button
					className={`w-fit font-semibold pl-2 md:pl-0 md:border-l-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 md:mr-10 mr-4 md:py-2 py-1.5 text-sm sm:text-base 
                ${!news.objectPhoto?.length && 'hidden'}`}
					onClick={() => handleScrollToSection('gallery-section')}
				>
					{t('gallery')} ({news.objectPhoto?.length})
				</button>
				<button
					className={`text-blue-600 w-fit font-semibold text-sm sm:text-base md:border-l-0 pl-2 md:pl-0 border-l-2 md:border-b-2 translate-y-[2px]
                hover:border-blue-600 md:py-2 py-1.5
                ${!news.files?.length && 'hidden'}`}
					onClick={() => handleScrollToSection('files-section')}
				>
					{t('files')} ({news.files?.length})
				</button>
			</div>
			<div className='flex sm:flex-row flex-col justify-between mt-4'>
				<p className='text-gray-500 font-medium'>{date}</p>
				<ul className='flex items-center flex-row'>
					{news?.tags?.map(({ id, nameRu, nameEng }, index) => (
						<li
							key={`tag-${id}`}
							className='mr-2 min-w-fit h-fit'
						>
							<Link
								href={`/${locale}/news?tags=${id}`}
								prefetch={false}
								className='text-blue-600 hover:underline'
							>
								{_isEng ? nameEng || '' : nameRu || ''}
								{news?.tags?.length > 1 &&
									index + 1 < news?.tags?.length &&
									','}
							</Link>
						</li>
					))}
				</ul>
			</div>
			{currentTransl?.content ? (
				<div className='w-full bg-white md:pl-16 px-4 md:pr-32 md:pb-8 pb-4 md:mt-6 mt-2'>
					<div
						className='tiptap sm:mt-8 mt-4'
						dangerouslySetInnerHTML={{
							__html: parser?.parseFromString(
								currentTransl?.content || '',
								'text/html'
							).body.innerHTML
						}}
					></div>
				</div>
			) : (
				''
			)}

			<div
				id='gallery-section'
				className='mt-8 self-center'
			>
				<NewGallery objectPhoto={news?.objectPhoto} />
			</div>

			{!!news.files?.length && (
				<div
					id='files-section'
					className='mt-8 flex flex-col'
				>
					<label className='font-medium min-h-fit mb-2'>
						{`${t('files')}`}
					</label>
					<ul className={`mt-1 flex flex-col space-y-2`}>
						{news.files.map(file => (
							<li key={file.id}>
								<a
									className='flex flex-row text-blue-700 hover:underline duration-300 cursor-pointer'
									href={`${BASE_SERVER_URL}${file?.path}`}
									download={true}
									target='_blank'
								>
									{file?.fileName}
								</a>
								{/* <PdfGallery path={file?.path} title={file?.fileName} /> */}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
