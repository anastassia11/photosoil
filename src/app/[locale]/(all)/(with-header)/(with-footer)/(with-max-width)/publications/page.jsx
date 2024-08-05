'use client'

import Publications from '@/components/publication/Publications';
import { useTranslation } from 'react-i18next';

export default function PublicationsPage() {
    const { t } = useTranslation();

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('publications')}
            </h1>
            <Publications />
        </div>
    )
}
