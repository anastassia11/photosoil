import { Suspense } from 'react'

import MainMap from '@/components/map/MainMap'

import { getTranslation } from '@/i18n'

export async function generateMetadata({ params: { locale } }) {
	const { t } = await getTranslation(locale, 'seo')

	return {
		title: t('homePage-title'),
		description: t('homePage-description')
	}
}

export default function HomePage() {
	return (
		<div className='relative w-screen h-[calc(100vh-64px)]'>
			<Suspense>
				<MainMap />
			</Suspense>
		</div>
	)
}
