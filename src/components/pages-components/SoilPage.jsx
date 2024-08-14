'use client'

import { getSoil } from '@/api/soil/get_soil'
import SoilObject from '@/components/soils/SoilObject'
import { useConstants } from '@/hooks/useConstants'
import { useTranslation } from '@/i18n/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function SoilPageComponent({ id }) {
    const [soil, setSoil] = useState({});
    const { locale } = useParams();
    const { t } = useTranslation(locale);
    const { SOIL_INFO, SOIL_ENUM } = useConstants();

    const _isEng = locale === 'en';

    const fetchSoil = async () => {
        const result = await getSoil(id)
        if (result.success) {
            setSoil(result.data);
        }
    }

    useEffect(() => {
        fetchSoil();
    }, [])

    return (
        <SoilObject object={soil} type='soil'>
            <ul className='flex flex-col space-y-2 '>
                {SOIL_INFO.map(({ name, title }) => {
                    let _isEng = locale === 'en';
                    const _soil = soil?.translations?.find(({ isEnglish }) => isEnglish === _isEng)
                    return (soil?.hasOwnProperty(name) || _soil?.hasOwnProperty(name)) ? <li key={name}
                        className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                        <span className='lg:w-[40%] w-full text-zinc-500 font-semibold'>
                            {title}
                        </span>
                        <span className={`lg:w-[60%] w-full  }`}>
                            {name === 'objectType' ? <Link href={`/soils?categories=${soil.objectType}`}
                                className='text-blue-600 hover:underline'>
                                {SOIL_ENUM[soil.objectType]}
                            </Link> : _soil[name]}
                        </span>
                    </li> : ''
                })}

                {soil.authors?.length ? <li key='authors'
                    className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                    <span className='lg:w-[40%] w-full text-zinc-500 font-semibold'>
                        {t('authors')}
                    </span>
                    <ul className={`lg:w-[60%] w-full flex flex-row flex-wrap items-start justify-start h-fit`}>
                        {soil.authors?.map(({ id, dataEng, dataRu }, index) =>
                            <li key={`author-${index}`} className='mr-2 min-w-fit h-fit'>
                                <Link href={`/authors/${id}`}
                                    className='text-blue-600 hover:underline'>
                                    {_isEng ? dataEng?.name : dataRu?.name}
                                </Link>
                                {soil.authors.length > 1 && index + 1 < soil.authors.length && ','}
                            </li>
                        )}
                    </ul>
                </li> : ''}
                {soil.classification?.map(({ nameRu, nameEng, terms, translationMode }, index) => {
                    const isVisible = translationMode == 0 || (_isEng ? (translationMode == 1) : (translationMode == 2))
                    if (isVisible) return <li key={`classification-${index}`}
                        className='flex lg:flex-row flex-col w-full lg:space-x-4 space-x-0'>
                        <span className='lg:w-[40%] w-full  text-zinc-500 font-semibold'>
                            {_isEng ? nameEng : nameRu}
                        </span>
                        <ul className={`lg:w-[60%] w-full flex flex-row flex-wrap items-start justify-start h-fit`}>
                            {terms.map(({ id, nameRu, nameEng }, index) =>
                                <li key={`term-${id}`} className='mr-2 min-w-fit h-fit'>
                                    <Link href={`/soils?terms=${id}`}
                                        className='text-blue-600 hover:underline'>
                                        {_isEng ? nameEng : nameRu}{terms.length > 1 && index + 1 < terms.length && ','}
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </li>
                }
                )}
            </ul>
        </SoilObject>
    )
}
