'use client'

import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import Soils from '@/components/soils/Soils';
import { useTranslation } from '@/i18n/client';

export default function EcosystemsPageComponent({ locale }) {
    const { t } = useTranslation(locale);

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('ecosystems')}
            </h1>
            <Soils getItems={getEcosystems} type='ecosystems' isFilters={false} />
        </div>
    )
}