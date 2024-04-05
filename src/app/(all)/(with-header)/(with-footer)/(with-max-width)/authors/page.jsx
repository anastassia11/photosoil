'use client'

import { getAuthors } from '@/api/get_authors'
import Soils from '@/components/soils/Soils'
import React, { Suspense, useEffect, useState } from 'react'

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([]);

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
            <h1 className='text-2xl font-semibold mb-4'>
                Авторы фотоматериалов
            </h1>
            <Suspense fallback={<div>Loading...</div>}>
                <Soils soils={authors} type='authors' />
            </Suspense>
        </section>
    )
}