'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Soils from '@/components/soils/Soils'
import { getAuthor } from '@/api/author/get_author'
import { BASE_SERVER_URL } from '@/utils/constants'
import { useTranslation } from 'react-i18next'
import { isAbsoluteUrl } from 'next/dist/shared/lib/utils'
import { useConstants } from '@/hooks/useConstants'

export default function AuthorPage({ params: { id } }) {
    const router = useRouter();
    const [author, setAuthor] = useState({});
    const { locale } = useParams();
    const { t } = useTranslation();
    const { AUTHOR_INFO } = useConstants();

    const authorLang = (locale === 'en' ? author.dataEng : locale === 'ru' ? author.dataRu : {})

    useEffect(() => {
        fetchAuthor()
    }, [])

    const fetchAuthor = async () => {
        const result = await getAuthor(id)
        if (result.success) {
            setAuthor(result.data)
        }
    }

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    }

    function isEmail(email) {
        var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return regex.test(email);
    }

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-2 flex flex-row items-center'>
                {authorLang?.name}
                <span className='ml-4'>
                    {author.authorType !== undefined && <div className="flex items-center gap-x-2">
                        {author.authorType == '0' ? <p className="px-3 py-1 text-sm text-red-600 rounded-full bg-red-100/70">{t('main_editor')}</p> :
                            author.authorType == '1' ? <p className="px-3 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70">{t('executive_editor')}</p> :
                                author.authorType == '2' ? <p className="px-3 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70">{t('editor')}</p> : ''}
                    </div>}
                </span>
            </h1>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!author.soilObjects?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('soil-section')}>
                    {t('soils')} ({author.soilObjects?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!author.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    {t('ecosystems')} ({author.ecoSystems?.length})
                </button>
            </div>
            <div className='filters-grid mt-6 md:space-x-8'>
                {author.photo?.path && <div className='flex md:justify-start justify-center'>
                    <Image
                        src={`${BASE_SERVER_URL}${author.photo?.path}`}
                        className="aspect-[3/4] object-cover object-top border border-blue-600 shadow-md rounded-xl"
                        alt={authorLang?.name}
                        width={500}
                        height={500}
                    />
                </div>}

                <div className='md:col-start-2 md:col-end-4 mt-12 md:mt-0'>
                    <h3 className='sm:text-2xl text-xl font-semibold mb-2'>
                        {t('author_info')}
                    </h3>
                    <ul className='flex flex-col space-y-2 '>
                        {AUTHOR_INFO.map(({ title, name, isArray }, index) => name !== 'name' && <li key={`INFO-${index}`}
                            className='flex flex-col w-full'>
                            {(authorLang?.[name] || author[name]) ? <>
                                <span className=' text-zinc-500 font-semibold'>
                                    {title}
                                </span>
                                {isArray ?
                                    <ul className='flex flex-col'>
                                        {author[name].map(item => <li key={item}>
                                            {isAbsoluteUrl(item) ? <a href={item} className='text-blue-600'>
                                                {item}
                                            </a> : isEmail(item) ? <a href={`mailto:${item}`} className='text-blue-600'>
                                                {item}
                                            </a> : item}
                                        </li>)}
                                    </ul>
                                    :
                                    <span className=''>
                                        {authorLang[name]}
                                    </span>
                                }
                            </> : ''}
                        </li>)}
                    </ul>
                </div>
            </div>

            {author.soilObjects?.length ? <div id='soil-section'>
                <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-2'>
                    {t('author_soils')}
                </h3>
                <Soils soils={author.soilObjects} type='soils' isFilters={false} isDrafts={true} />
            </div> : ''}

            {author.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-2'>
                        {t('author_ecosystems')}
                    </h3>
                    <Soils soils={author.ecoSystems} type='ecosystems' isFilters={false} isDrafts={true} />
                </div> : ''}
        </div >
    )
}