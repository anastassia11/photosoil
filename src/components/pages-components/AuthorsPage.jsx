'use client'

import { getTranslation } from '@/i18n/client'
import Authors from '../Authors'

export default function AuthorsPageComponent({ locale }) {
    const { t } = getTranslation(locale)

    return (
        <section className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('photo_authors')}
            </h1>
            <Authors />
        </section>
    )
}
