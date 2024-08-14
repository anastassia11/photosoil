'use client'

import Authors from '@/components/Authors';
import { useTranslation } from 'react-i18next';

export default function AuthorsPageComponent() {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('photo_authors')}
            </h1>
            <Authors />
        </section>
    )
}
