'use client'

import { getAuthors } from '@/api/get_authors'
import { BASE_SERVER_URL } from '@/utils/constants'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function AuthorsPage() {
    const [authors, setAuthors] = useState([])

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
            <div className='relative flex flex-row space-x-2 mb-4'>
                <div className="relative w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Найти автора"
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
                <button className="w-[200px] justify-center py-2 font-medium text-center text-white transition-all duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-400 flex flex-row items-center space-x-2">
                    Найти
                </button>
            </div>
            <ul className="mb-4 authors-grid">
                {
                    authors?.map(({ fio, id, description, photo }) => (
                        <li key={id} className='overflow-hidden border bg-white rounded-lg  hover:border-blue-600 duration-300 cursor-pointer'>
                            <Link href={`authors/${id}`}
                                className=''>
                                <div className="w-full h-[360px] sm:h-[312px] md:h-[336px]">
                                    <Image
                                        src={`${BASE_SERVER_URL}${photo.path}`}
                                        className="w-full h-full object-cover object-center "
                                        alt=""
                                        width={500}
                                        height={500}
                                    />
                                </div>
                                <div className="p-4 py-6">
                                    <h4 className="font-semibold">{fio}</h4>
                                    <p className="text-indigo-600 text-sm">{description}</p>
                                </div>
                            </Link>
                        </li>
                    ))
                }
            </ul>
            <div className="flex self-end">
                <a href="#" className="border flex items-center justify-center px-4 py-2 mx-1 text-gray-500 capitalize bg-white rounded-md cursor-not-allowed rtl:-scale-x-100 ">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </a>

                <a href="#" className="border hidden px-4 py-2 mx-1 transition-colors duration-300 transform bg-white rounded-md sm:inline  hover:bg-blue-600  hover:text-white ">
                    1
                </a>

                <a href="#" className="border hidden px-4 py-2 mx-1 transition-colors duration-300 transform bg-white rounded-md sm:inline  hover:bg-blue-600 hover:text-white">
                    2
                </a>

                <a href="#" className="border hidden px-4 py-2 mx-1 transition-colors duration-300 transform bg-white rounded-md sm:inline  hover:bg-blue-600 hover:text-white">
                    ...
                </a>

                <a href="#" className="border hidden px-4 py-2 mx-1 transition-colors duration-300 transform bg-white rounded-md sm:inline  hover:bg-blue-600 hover:text-white">
                    9
                </a>

                <a href="#" className="border hidden px-4 py-2 mx-1 transition-colors duration-300 transform bg-white rounded-md sm:inline  hover:bg-blue-600 hover:text-white">
                    10
                </a>

                <a href="#" className="border flex items-center justify-center px-4 py-2 ml-1 transition-colors duration-300 transform bg-white rounded-md rtl:-scale-x-100  hover:bg-blue-600 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </a>
            </div>
        </section>
    )
}