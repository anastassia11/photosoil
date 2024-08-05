'use client'

import { setDropdown } from '@/store/slices/generalSlice';
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import LanguageChanger from './LanguageChanger';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from "framer-motion"
import { BarLoader } from 'react-spinners';

export default function Header() {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const dropdown = useSelector(state => state.general.dropdown)
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const { t } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const soilsNavs = [
        { key: 'soils', title: t('search_all') },
        { key: 'profiles', title: t('profiles') },
        { key: 'morphological', title: t('morphological') },
        { key: 'dynamics', title: t('dynamics') }
    ]

    const navigation = [
        { key: '', title: t('main'), isDropdown: false },
        { key: 'about', title: t('about'), isDropdown: false },
        { key: 'soils', title: t('soils'), isDropdown: true, navs: soilsNavs },
        { key: 'ecosystems', title: t('ecosystems'), isDropdown: false },
        { key: 'publications', title: t('publications'), isDropdown: false },
        { key: 'authors', title: t('authors'), isDropdown: false },
        { key: 'news', title: t('news'), isDropdown: false },
    ];

    useEffect(() => {
        localStorage.getItem('tokenData') && setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

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

    return (
        <header className={`${visible ? 'fixed top-0 ' : 'fixed -top-20'} transition-all duration-200 ease-in-out z-40 px-4 sm:px-8 w-full border-b shadow-sm h-16 bg-white flex flex-row items-center justify-between`}>
            <div className='flex-1 '>
                <Link href={`/`} className='flex flex-row items-center w-fit'>
                    <Image src={'/logo.png'} width={300} height={300} alt='logo' className='sm:w-9 w-8' />
                    <p className='text-zinc-600 ml-2 sm:text-3xl text-2xl font-semibold'>Photo<span className='pl-[2px] text-[#226eaf] font-bold'>SOIL</span></p>
                </Link>
            </div>

            <ul className='hidden 2xl:flex flex-row items-center space-x-8'>
                {navigation.map(({ key, title, isDropdown, navs }) => <li key={key}>
                    {isDropdown ?
                        <>
                            <button className={` ${key} w-full flex items-center justify-between gap-1  hover:text-blue-600`}
                                onClick={() => dispatch(setDropdown({ key: key, isActive: dropdown.key !== null && dropdown.key !== key ? true : !dropdown.isActive }))}>
                                {title}
                                <span className={`transition ${dropdown.key == key && dropdown.isActive ? '-rotate-180' : ''} `}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="h-4 w-4"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </span>
                            </button>
                        </> :
                        <Link href={`/${key}`} className='duration-300 cursor-pointer hover:text-blue-600'>
                            {title}
                        </Link>
                    }

                    <div className={`${isDropdown && dropdown.key == key && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}
                            overflow-hidden w-[400px] absolute border shadow-md bg-white rounded-md transition-all duration-200`}>
                        <ul className='py-2'>
                            {navs?.map(({ key: navKey, title }) => <li key={navKey} className='duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4'
                                onClick={() => dispatch(setDropdown({ isActive: false, key: null }))}>
                                <Link href={`/${navKey}`}>
                                    {title}
                                </Link>
                            </li>)}
                        </ul>
                    </div>
                </li>)}
            </ul>

            {!isLoading ?
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className='flex-1 justify-end space-x-4 h-full flex flex-row items-center w-fit'>

                    {!token ? <Link href={`/join`} className="hidden sm:flex max-h-[40px] px-4 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                        {t('join')}
                    </Link> : <Link href={`/admin`} className="min-w-fit hidden sm:flex max-h-[40px] px-4 py-2 font-medium text-center text-blue-600 transition-colors duration-300 
                transform ">
                        {t('dashboard')}
                    </Link>}
                    <div className='w-[80px] h-full flex items-center'>
                        <LanguageChanger />
                    </div>
                </motion.div>
                : <div className='flex-1 justify-end space-x-4 h-full flex flex-row items-center w-fit'></div>}


            <div className="block 2xl:hidden ml-2">
                <button className="m-2 mr-0 transition text-gray-600"
                    onClick={() => setMenuOpen(!menuOpen)} >
                    {
                        menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )
                    }
                </button>
            </div>
            <div className={`bg-white 2xl:block px-3 sm:w-[60%] w-full self-end h-[calc(100vh-64px)] fixed top-[64px] flex 
            flex-col justify-between p-4
                duration-300 ${menuOpen ? 'block right-0' : 'opacity-0 -right-[60%]'}`}>
                <ul className='flex flex-col space-y-2'>
                    {navigation.map(({ key, title, isDropdown, navs }) => <li key={key}>
                        {isDropdown ?
                            <>
                                <button className={` ${key} px-4 w-full flex items-center justify-between gap-1  hover:text-blue-600`}
                                    onClick={() => dispatch(setDropdown({ key: key, isActive: dropdown.key !== null && dropdown.key !== key ? true : !dropdown.isActive }))}>
                                    {title}
                                    <span className={`transition ${dropdown.key == key && dropdown.isActive ? '-rotate-180' : ''} `}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="1.5"
                                            stroke="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </span>
                                </button>
                            </> :
                            <Link href={`/${key}`} className='px-4 duration-300 cursor-pointer hover:text-blue-600'>
                                {title}
                            </Link>
                        }
                        {
                            isDropdown && dropdown.key == key && dropdown.isActive ? (
                                <div className="overflow-hidden ">
                                    <ul className='pt-1 pl-4'>
                                        {navs.map(({ key: navKey, title }) => <li key={navKey} className='duration-300 cursor-pointer hover:text-blue-600 py-1 hover:bg-zinc-100 flex items-center px-4'
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

                <li className='h-fit flex-col space-y-2 justify-end flex sm:hidden w-full px-2'>
                    {!token ? <Link href={`/join`} className="max-h-[40px] px-4 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                        {t('join')}
                    </Link> : <Link href={`/admin`} className="min-w-fit max-h-[40px] px-2 py-2 font-medium text-left text-blue-600 transition-colors duration-300 
                transform ">
                        {t('dashboard')}
                    </Link>}
                </li>
            </div>
        </header>
    )
}

