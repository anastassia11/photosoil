'use client'

import Soils from '@/components/soils/Soils'
import useEcosystems from '@/hooks/data/useEcosystems'
import { getTranslation } from '@/i18n/client'
import { Suspense } from 'react'

export default function EcosystemsPageComponent({ locale }) {
    const { t } = getTranslation(locale)
    const { data } = useEcosystems()

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('ecosystems')}
            </h1>
            <Soils
                type='ecosystems'
                isFilters={true}
                _soils={data}
            />
        </div >
    )
}
