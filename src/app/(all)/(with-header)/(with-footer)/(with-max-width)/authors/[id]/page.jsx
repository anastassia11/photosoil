'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Soils from '@/components/soils/Soils'
import { getAuthor } from '@/api/get_author'
import { BASE_SERVER_URL } from '@/utils/constants'
import Link from 'next/link'

export default function AuthorPage({ params: { id } }) {
    const router = useRouter();
    const [author, setAuthor] = useState({});

    const INFO = [
        { title: 'Организация', name: 'organization' },
        { title: 'Должность', name: 'position' },
        { title: 'Специальность', name: 'specialization' },
        { title: 'Ученая степень/звание', name: 'degree' },
        { title: 'Контакты', name: 'contact', isArray: true },
        { title: 'Профили в других БД', name: 'otherPrifile', isArray: true },
    ];

    useEffect(() => {
        fetchAuthor()
    }, [])

    const fetchAuthor = async () => {
        const result = await getAuthor(id)
        console.log(result)
        if (result.success) {
            setAuthor(result.data)
        }
    }

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-2'>
                {author.name}
            </h1>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!author.soilObjects?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('soil-section')}>
                    Связанные почвенные объекты ({author.soilObjects?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!author.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    Связанные экосистемы ({author.ecoSystems?.length})
                </button>
            </div>
            <div className='flex flex-row mt-6 space-x-8'>
                {author.photo && <div className=''>
                    <Image
                        src={`${BASE_SERVER_URL}${author.photo?.path}`}
                        className="aspect-[3/4] max-w-[400px] object-cover object-top border border-blue-600 shadow-md rounded-xl"
                        alt={author.name}
                        width={500}
                        height={500}
                    />
                </div>}

                <div className=''>
                    <h3 className='text-2xl font-semibold mb-2'>
                        Информация об авторе
                    </h3>
                    <ul className='flex flex-col space-y-2 '>
                        {INFO.map(({ title, name, isArray }, index) => <li key={index}
                            className='flex flex-col w-full'>
                            {author[name] ? <>
                                <span className=' text-zinc-500 font-semibold'>
                                    {title}
                                </span>
                                <span className=''>
                                    {author[name]}
                                </span>
                                {/* {isArray ? <>
                                    <ul>
                                        {author[name].map(item => <li key={item}>
                                            <Link href={item} className='text-blue-600'>
                                                {item}
                                            </Link>
                                        </li>)}
                                    </ul>
                                </> : <>
                                    <span className=''>
                                        {author[name]}
                                    </span>
                                </>} */}
                            </> : ''}
                        </li>)}
                    </ul>
                </div>
            </div>

            {author.soilObjects?.length ? <div id='soil-section'>
                <h3 className='text-2xl font-semibold mt-12 mb-2'>
                    Почвенные объекты автора
                </h3>
                <Soils soils={author.soilObjects} _filtersVisible={false} />
            </div> : ''}

            {author.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='text-2xl font-semibold mt-12 mb-2'>
                        Экосистемы автора
                    </h3>
                </div> : ''}
        </div >
    )
}