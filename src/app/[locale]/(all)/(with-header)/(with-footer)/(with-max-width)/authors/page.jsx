'use client'

import { getAuthors } from '@/api/author/get_authors'
import Authors from '@/components/author/Authors';
import Soils from '@/components/soils/Soils'
import React, { Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchAuthors()
    }, [])

    const fetchAuthors = async () => {
        const result = await getAuthors()
        if (result.success) {
            setAuthors(result.data)
        }
    }

    return (
        <section className="flex flex-col">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('photo_authors')}
            </h1>
            <Authors authors={authors} />
        </section>
    )
}