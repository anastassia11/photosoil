'use client'

import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { BASE_SERVER_URL } from '@/utils/constants'

import tokenVerification from '@/api/account/token_verification'
import { getAuthor } from '@/api/author/get_author'
import { getAuthors } from '@/api/author/get_authors'
import { getQuantity } from '@/api/enums/get_quantity'
import { getAllNews } from '@/api/news/get_allNews'

import { getTranslation } from '@/i18n/client'

export default function AdminPageComponent() {
	const [news, setNews] = useState([])
	const [authors, setAuthors] = useState([])
	const [quantity, setQuantity] = useState({})
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const _isEng = locale === 'en'

	useEffect(() => {
		fetchNews()
		// fetchAuthors();
		fetchQuantity()
	}, [])

	useEffect(() => {
		authors.length && authors.forEach(({ id }) => fetchAuthor(id))
	}, [authors.length])

	const fetchQuantity = async () => {
		const result = await getQuantity()
		if (result.success) {
			setQuantity(result.data)
		}
	}

	const fetchNews = async () => {
		await tokenVerification({ isRequired: true })
		const result = await getAllNews()
		if (result.success) {
			const _news = result.data.slice(0, 8).sort((a, b) => {
				// const dateA = new Date(a.createdDate);
				// const dateB = new Date(b.createdDate);
				return b.createdDate - a.createdDate
			})
			setNews(_news)
		}
	}

	const fetchAuthors = async () => {
		const result = await getAuthors()
		if (result.success) {
			const _authors = result.data.slice(0, 8)
			setAuthors(_authors)
		}
	}

	const fetchAuthor = async id => {
		const result = await getAuthor(id)
		if (result.success) {
			const _author = result.data
			setAuthors(prev =>
				prev.map(author =>
					author.id === id
						? {
								...author,
								soilsLength: _author.soilObjects.length,
								ecosystemsLength: _author.ecoSystems.length
							}
						: author
				)
			)
		}
	}

	const NewsCard = ({ id, tags, translations }) => {
		const currentTransl =
			translations?.find(({ isEnglish }) => isEnglish === _isEng) || null
		const date = new Date(currentTransl?.lastUpdated * 1000).toLocaleString()

		return currentTransl ? (
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
						<p className='mt-2 text-gray-600 '>
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
		) : (
			''
		)
	}

	const AuthorCard = ({
		photo,
		dataEng,
		dataRu,
		authorType,
		id,
		soilsLength,
		ecosystemsLength
	}) => {
		const curData = _isEng ? dataEng : dataRu

		return (
			<Link
				href={`/${locale}/authors/${id}`}
				prefetch={false}
				className='px-8 py-4 bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-start'
			>
				<div className='flex flex-col sm:-mx-4 sm:flex-row'>
					{photo && (
						<Image
							src={`${BASE_SERVER_URL}${photo?.path}`}
							width={500}
							height={500}
							alt='soil'
							className='aspect-square object-cover object-top rounded-full w-24 h-24 sm:mx-4 ring-4 ring-gray-300'
						/>
					)}

					<div className='mt-4 sm:mx-4 sm:mt-0'>
						<h1 className='text-xl font-semibold text-gray-700 capitalize md:text-2xl group-hover:text-white'>
							{curData.name || ''}
						</h1>

						<p className='mt-2 text-blue-700'>{curData.organization || ''}</p>
					</div>
				</div>

				<p className='mt-4 text-gray-500'>
					{curData.degree}, {curData.specialization}, {curData.position}.
				</p>
				<p className='text-gray-600 font-medium mt-1'>
					Автор {soilsLength} почвенных объектов и {ecosystemsLength} экосистем.
				</p>

				<div className='flex mt-4 -mx-2 self-end'>
					{authorType !== undefined && (
						<div className='flex items-center gap-x-2'>
							{authorType == '0' ? (
								<p className='px-4 py-1 text-sm text-red-600 rounded-full bg-red-100/70'>
									{t('main_editor')}
								</p>
							) : authorType == '1' ? (
								<p className='px-4 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70'>
									{t('executive_editor')}
								</p>
							) : authorType == '2' ? (
								<p className='px-4 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70'>
									{t('editor')}
								</p>
							) : (
								''
							)}
						</div>
					)}
				</div>
			</Link>
		)
	}

	return (
		<div className='px-4 sm:py-4 sm:px-6 md:py-8 lg:px-8'>
			<section className='max-w-screen-2xl mx-auto'>
				<div className='mx-auto max-w-3xl text-center'>
					<h2 className='sm:text-4xl text-2xl font-semibold text-center'>
						{t('admin_h1')}
					</h2>

					<p className='sm:mt-4 mt-2 text-gray-500 sm:text-xl text-base'>
						{t('admin_p')}
					</p>
				</div>

				<div className='sm:mt-12'>
					<dl className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4'>
						<div className='flex flex-col px-4 sm:py-8 py-4 text-center'>
							<dt className='order-last text-lg font-medium text-gray-500'>
								{t('soils_rod')}
							</dt>

							<dd className='text-4xl font-extrabold text-blue-600 md:text-5xl'>
								{quantity.soilObject}
							</dd>
						</div>

						<div className='flex flex-col px-4 sm:py-8 py-4 text-center'>
							<dt className='order-last text-lg font-medium text-gray-500'>
								{t('ecosystems_rod')}
							</dt>

							<dd className='text-4xl font-extrabold text-blue-600 md:text-5xl'>
								{quantity.ecoSystem}
							</dd>
						</div>

						<div className='flex flex-col px-4 sm:py-8 py-4 text-center'>
							<dt className='order-last text-lg font-medium text-gray-500'>
								{t('publ_rod')}
							</dt>

							<dd className='text-4xl font-extrabold text-blue-600 md:text-5xl'>
								{quantity.publication}
							</dd>
						</div>
						<div className='flex flex-col px-4 sm:py-8 py-4 text-center'>
							<dt className='order-last text-lg font-medium text-gray-500'>
								{t('news_rod')}
							</dt>

							<dd className='text-4xl font-extrabold text-blue-600 md:text-5xl'>
								{quantity.news}
							</dd>
						</div>
					</dl>
				</div>
			</section>
			{news.length ? (
				<section className='sm:mt-12 mt-8 max-w-[2000px] mx-auto w-full'>
					<h3 className='sm:text-3xl text-2xl font-semibold mb-8 text-center'>
						{t('last_news')}
					</h3>

					<ul className='w-full news-grid mb-4'>
						{news.map((item, idx) =>
							item.translations?.find(
								({ isEnglish }) => isEnglish === _isEng
							) ? (
								<li
									key={`news_${idx}`}
									className='w-full h-full'
								>
									<NewsCard {...item} />
								</li>
							) : (
								''
							)
						)}
					</ul>
				</section>
			) : (
				''
			)}
			{/* <section className='mt-12  mx-auto w-full max-w-[2000px]'>
                <h3 className="sm:text-3xl text-2xl font-semibold mb-8 text-center">Эксперты платформы</h3>

                <ul className='w-full expert-grid mb-4'>
                    {authors.map(author => <li key={author.id}>
                        {AuthorCard({ ...author })}
                    </li>
                    )}
                </ul>
            </section> */}
		</div>
	)
}
