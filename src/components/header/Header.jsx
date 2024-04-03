'use client'

import { setDropdown } from '@/store/slices/generalSlice';
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

export default function Header() {
    const dispatch = useDispatch()
    const dropdown = useSelector(state => state.general.dropdown)
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);

    const handleScroll = useCallback(() => {
        const currentScrollPos = window.scrollY;
        setVisible(
            (prevScrollPos > currentScrollPos)
        );
        setPrevScrollPos(currentScrollPos);
    }, [prevScrollPos, setVisible, setPrevScrollPos]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    const soilsNavs = [
        { key: 'soils', title: 'Поиск по всем объектам' },
        { key: 'profiles', title: 'Почвенные профили' },
        { key: 'morphological', title: 'Почвенные морфологические элементы' },
        { key: 'dynamics', title: 'Динамика почв' }
    ]

    const navigation = [
        { key: '', title: 'Главная', isDropdown: false },
        { key: 'about', title: 'О нас', isDropdown: false },
        { key: 'soils', title: 'Почвенные объекты', isDropdown: true, navs: soilsNavs },
        { key: 'ecosystems', title: 'Экосистемы', isDropdown: false },
        { key: 'publications', title: 'Публикации', isDropdown: false },
        { key: 'authors', title: 'Авторы', isDropdown: false },
        { key: 'news', title: 'Новости', isDropdown: false },
    ]

    return (
        <header className={`${visible ? 'fixed top-0 ' : 'fixed -top-20'} transition-all duration-200 ease-in-out z-50 px-8 w-full border-b shadow-sm h-16 bg-white flex flex-row items-center justify-between`}>
            <div className='flex-1 '>
                <Link href={`/`} className='flex flex-row items-center w-fit'>
                    <Image src={'/logo.png'} width={300} height={300} alt='logo' className='w-9' />
                    <p className='text-zinc-600 ml-2 text-3xl font-semibold'>Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span></p>
                </Link>
            </div>

            <ul className='flex flex-row items-center space-x-8'>
                {navigation.map(({ key, title, isDropdown, navs }) => <li key={key}>
                    {isDropdown ?
                        <>
                            <button className={` ${key} w-full flex items-center justify-between gap-1  hover:text-blue-600`}
                                onClick={() => dispatch(setDropdown({ key: key, isActive: dropdown.key !== null && dropdown.key !== key ? true : !dropdown.isActive }))}>
                                {title}
                                {
                                    dropdown.key == key && dropdown.isActive ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                                        </svg>

                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                        </svg>
                                    )
                                }
                            </button>
                        </> :
                        <Link href={`/${key}`} className='duration-300 cursor-pointer hover:text-blue-600'>
                            {title}
                        </Link>
                    }
                    {
                        isDropdown && dropdown.key == key && dropdown.isActive ? (
                            <div className="overflow-hidden w-[400px] absolute border shadow-md mt-[18px] bg-white rounded-md">
                                <ul className='py-2'>
                                    {navs.map(({ key: navKey, title }) => <li key={navKey} className='duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4'
                                        onClick={() => dispatch(setDropdown({ isActive: false, key: null }))}>
                                        <Link href={`/${navKey}`}>
                                            {title}
                                        </Link>
                                    </li>)}
                                </ul>
                            </div>
                        ) : ""
                    }
                </li>)}
            </ul>

            <div className='flex-1 flex justify-end space-x-4'>
                <Link href={`/join`} className="px-4 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    Стать автором
                </Link>
                <button type="button" className='border pl-3 pr-2 rounded-lg flex flex-row items-center justify-center space-x-2
                hover:bg-zinc-50 duration-300 focus:outline-none active:bg-white'>
                    Ru
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </header>
    )
}

