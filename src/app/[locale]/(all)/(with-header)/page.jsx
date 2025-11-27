import { Suspense } from 'react'

import MainMap from '@/components/map/MainMap'

import { getTranslation } from '@/i18n'
import { BASE_URL } from '@/utils/constants'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('homePage-title'),
		description: t('homePage-description'),
		alternates: {
			canonical: `${BASE_URL}/${locale}`,
			languages: {
				'ru': `${BASE_URL}/ru`,
				'en': `${BASE_URL}/en`,
				'x-default': `${BASE_URL}/ru`
			}
		}
	}
}

export default async function HomePage({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')
	return (
		<div className='relative w-screen h-[calc(100vh-64px)]'>
			{/* Скрытый текст для SEO */}
			<div className="sr-only">
				<h1>{t('homePage-title')}</h1>
				<p>{t('homePage-description')}</p>
			</div>

			<Suspense>
				<MainMap />
			</Suspense>
		</div>
	)
}
