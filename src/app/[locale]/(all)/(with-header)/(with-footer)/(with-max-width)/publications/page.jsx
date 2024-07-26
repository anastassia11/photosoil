'use client'

import { getPublications } from '@/api/publication/get_publications';
import Publications from '@/components/publication/Publications';
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function PublicationsPage() {
    const [publications, setPublications] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchPublications();
    }, [])

    const fetchPublications = async () => {
        const result = await getPublications();
        if (result.success) {
            setPublications(result.data);
        }
    }

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('publications')}
            </h1>
            <Publications publications={publications} />
        </div>
    )
}
