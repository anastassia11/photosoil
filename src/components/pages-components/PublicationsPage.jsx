'use client'

import { getTranslation } from '@/i18n/client'
import Publications from '../Publications'
import usePublications from '@/hooks/data/usePublications'

export default function PublicationsPageComponent({ locale }) {
    const { t } = getTranslation(locale)
    const { data } = usePublications()

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('publications')}
            </h1>
            <Publications _publications={data} />
        </div>
    )
}
