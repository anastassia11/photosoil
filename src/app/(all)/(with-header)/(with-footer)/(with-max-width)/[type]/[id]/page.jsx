'use client'

import { getSoil } from '@/api/get_soil'
import SoilObject from '@/components/soils/SoilObject'
import { BASE_URL, SOIL_INFO } from '@/utils/constants'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'


export default function SoilPage({ params: { id } }) {
    const [soil, setSoil] = useState({});
    const [category, setCategory] = useState({});

    const fetchSoil = async () => {
        const result = await getSoil(id)
        if (result.success) {
            setSoil(result.data)
            const soilTypes = {
                0: { title: 'Динамика почв', id: 0, ref: '/' },
                1: { title: 'Почвенные профили', id: 1, ref: '/' },
                2: { title: 'Почвенные морфологические элементы', id: 2, ref: '/' },
            };
            setCategory(soilTypes[result.data.objectType]);
        }
    }

    useEffect(() => {
        fetchSoil()
    }, [])

    return (
        <SoilObject object={soil} >
            <ul className='flex flex-col space-y-2 '>
                {SOIL_INFO.map(({ name, titleRu }) =>
                    soil.hasOwnProperty(name) && <li key={name}
                        className='flex flex-row w-full space-x-4'>
                        <span className='w-[40%] text-zinc-500 font-semibold'>
                            {titleRu}
                        </span>
                        <span className={`w-[60%] }`}>
                            {name === 'objectType' ? <Link href={`/soils?categories=${category.id}`}
                                className='text-blue-600 hover:underline'>
                                {category.title}
                            </Link> : soil[name]}
                        </span>
                    </li>)}

                {soil.authors?.length ? <li key='authors'
                    className='flex flex-row w-full space-x-4'>
                    <span className='w-[40%] text-zinc-500 font-semibold'>
                        Авторы
                    </span>
                    <ul className={`w-[60%] flex flex-col`}>
                        {soil.authors?.map(({ id, name }, index) =>
                            <li key={id} className='mr-1'>
                                <Link href={`${BASE_URL}/authors/${id}`}
                                    className='text-blue-600 hover:underline'>
                                    {name}
                                </Link>
                                {soil.authors.length > 1 && index + 1 < soil.authors.length && ','}
                            </li>
                        )}
                    </ul>
                </li> : ''}
                {soil.classification?.map(({ name, terms }) =>
                    <li key={name}
                        className='flex flex-row w-full space-x-4'>
                        <span className='w-[40%] text-zinc-500 font-semibold'>
                            {name}
                        </span>
                        <ul className={`w-[60%] flex flex-row`}>
                            {terms.map(({ id, name }, index) =>
                                <li key={id} className='mr-1'>
                                    <Link href={`${BASE_URL}/soils?terms=${id}`}
                                        className='text-blue-600 hover:underline'>
                                        {name}
                                    </Link>
                                    {terms.length > 1 && index + 1 < terms.length && ','}
                                </li>
                            )}
                        </ul>
                    </li>)}
            </ul>
        </SoilObject>
    )
}
