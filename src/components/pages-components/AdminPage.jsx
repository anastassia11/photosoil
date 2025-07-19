'use client'


import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { getQuantity } from '@/api/enums/get_quantity'

import { getTranslation } from '@/i18n/client'
import useNews from '@/hooks/data/useNews'

export default function AdminPageComponent() {
	const { news, newsIsLoading } = useNews()
	const [quantity, setQuantity] = useState({})
	const { locale } = useParams()
	const { t } = getTranslation(locale)

	const _isEng = locale === 'en'

	const filteredNews = useMemo(() => {
		if (!news) return []
		return news.slice(0, 8).sort((a, b) => {
			return b.createdDate - a.createdDate
		})
	}, [news])

	useEffect(() => {
		fetchQuantity()
	}, [])

	const fetchQuantity = async () => {
		const result = await getQuantity()
		if (result.success) {
			setQuantity(result.data)
		}
	}

	const NewsCard = ({ id, tags, translations }) => {
		const currentTransl =
			translations?.find(({ isEnglish }) => isEnglish === _isEng) || null
		const date = new Date(currentTransl?.lastUpdated * 1000).toLocaleString()

		if (!currentTransl) return
		return <Link
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
			{!!news?.length && (
				<section className='sm:mt-12 mt-8 max-w-[2000px] mx-auto w-full'>
					<h3 className='sm:text-3xl text-2xl font-semibold mb-8 text-center'>
						{t('last_news')}
					</h3>

					<ul className='w-full news-grid mb-4'>
						{filteredNews.map((item, idx) =>
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
			)}
		</div>
	)
}
