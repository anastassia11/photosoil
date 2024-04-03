'use client'

import Image from 'next/image'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Soils from '@/components/soils/Soils'

export default function AuthorPage({ params: { id } }) {
    const router = useRouter()

    const info = [
        { title: 'Организация', content: 'Национальный исследовательский Томский государственный университет' },
        { title: 'Должность', content: 'Заведующий почвенным музеем, старший научный сотрудник лаборатории биогеохимических и дистанционных методов мониторинга окружающей среды "БиоГеоКлим"' },
        { title: 'Специальность', content: 'Почвовед' },
        { title: 'Ученая степень/звание', content: 'канд.биол.наук.' },
        { title: 'Контакты', content: 's.loyko@yandex.ru', isRef: true },
        { title: 'Профили в других БД', content: 's.loyko@yandex.ru', isRef: true },
    ]

    const soils = [
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
        // { url: '/soil.jpg', name: 'Бурозем остаточно-карбонатный' },
    ]

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-4'>
                Об авторе фотоматериалов
            </h1>
            <div className='soils-grid bg-white rounded-xl border'>
                <div className='flex flex-col items-center py-8 px-[20px]'>
                    <Image
                        src='/author.jpg'
                        className="aspect-[1/1] object-cover object-center rounded-full max-w-[250px] border-4 border-blue-600"
                        alt=""
                        width={500}
                        height={500}
                    />
                    <h3 className='text-zinc-600 text-2xl font-semibold my-4 text-center'>
                        Лойко Сергей Анатольевич
                    </h3>
                </div>

                <div className='col-span-3 col-start-2 flex flex-col py-8 pr-8'>
                    <ul className='flex flex-col space-y-2 '>
                        {info.map(({ title, content, isRef }, index) => <li key={index}
                            className='flex flex-col w-full'>
                            <span className=' text-zinc-500 font-semibold'>
                                {title}
                            </span>
                            <span className={` ${isRef ? 'text-blue-600 cursor-pointer' : 'text-zinc-800'}`}>
                                {content}
                            </span>
                        </li>)}
                    </ul>
                </div>
            </div>
            <div className='mt-8'>
                <h3 className='text-2xl font-semibold mb-4'>
                    Объекты автора
                </h3>
                {/* <Soils items={soils} /> */}
            </div>
        </div>
    )
}