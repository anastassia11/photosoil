'use client'

import Soils from '@/components/soils/Soils'
import useSoils from '@/hooks/data/useSoils'
import { getTranslation } from '@/i18n/client'

export default function SoilsPageComponent({ type, locale }) {
	const { t } = getTranslation(locale)
	const { soils } = useSoils(type)

	return (
		<div className='flex flex-col'>
			<h1 className='sm:text-2xl text-xl font-semibold mb-4'>
				{type === 'soils'
					? t('search_all')
					: type === 'profiles'
						? t('profiles')
						: type === 'dynamics'
							? t('dynamics')
							: type === 'morphological'
								? t('morphological')
								: ''}
			</h1>
			<Soils
				_soils={soils}
				isAllSoils={type === 'soils'}
				type={type}
				isFilters={true}
			/>
		</div>
	)
}
