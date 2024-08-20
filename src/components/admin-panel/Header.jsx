'use client'

import { useDispatch, useSelector } from 'react-redux';
import { setDropdown } from '@/store/slices/generalSlice';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Oval } from 'react-loader-spinner';
import LanguageChanger from '../header/LanguageChanger';
import { getTranslation } from '@/i18n/client';

export default function Header() {
    const dispatch = useDispatch()
    const dropdown = useSelector(state => state.general.dropdown)
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState(null);
    const [role, setRole] = useState(null);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    useEffect(() => {
        localStorage.getItem('email') && setEmail(localStorage.getItem('email'));
        localStorage.getItem('tokenData') && setRole(JSON.parse(localStorage.getItem('tokenData'))?.role);
    }, [])

    const handleLogOut = () => {
        setIsLoading(true)
        router.push('/login');
        localStorage.removeItem('tokenData');
    }

    return (
        <div className="relative w-fit self-end flex flex-row justify-center items-center">
            <div className='user relative w-fit self-end flex flex-row items-center space-x-4
                mini:px-4 py-1 cursor-pointer'
                onClick={() => dispatch(setDropdown({ key: 'user', isActive: dropdown.key !== null && dropdown.key !== 'user' ? true : !dropdown.isActive }))}>
                <span className='uppercase bg-blue-600 w-10 h-10 rounded-2xl text-white font-light text-2xl flex items-center justify-center'>
                    {email?.[0]}
                </span>
                <div className='flex flex-col justify-center items-start'>
                    <p className={`font-semibold ${dropdown.key == 'user' && dropdown.isActive ? 'text-blue-700' : ''} duration-300`}>
                        {email}
                    </p>
                    <p className='text-sm text-zinc-500'>
                        {role === 'Admin' ? t('admin') : t('moderator')}
                    </p>
                </div>
                {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 
                        text-zinc-500">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg> */}
                <span className={`transition ${dropdown.key == 'user' && dropdown.isActive ? '-rotate-180' : ''} `}>
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
                <div onClick={() => dispatch(setDropdown({ key: null, isActive: false }))} className={`absolute right-0 
                        z-20 w-48 py-2 mt-2 origin-top-right shadow-md  duration-200 transition-all 
                     rounded-md border border-gray-200 bg-white top-8
                    ${dropdown.key == 'user' && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                    {/* <button className="space-x-2 flex-row w-full duration-300 cursor-pointer hover:text-blue-600 h-9 
                            hover:bg-zinc-100 flex items-center px-4">
                    <p>
                        Настройки профиля
                    </p>
                </button> */}
                    <button onClick={handleLogOut} disabled={isLoading}
                        className="space-x-2 flex-row w-full duration-300 cursor-pointer hover:text-blue-600 h-9 
                            hover:bg-zinc-100 flex items-center px-4 disabled:justify-center">
                        {!isLoading && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 -translate-x-[3px]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>}
                        <p>
                            {isLoading ?
                                <Oval
                                    height={20}
                                    width={20}
                                    color="#71717a"
                                    visible={true}
                                    ariaLabel='oval-loading'
                                    secondaryColor="#71717a"
                                    strokeWidth={4}
                                    strokeWidthSecondary={4} />
                                : t('logout')}
                        </p>
                    </button>
                </div>
            </div>

            <LanguageChanger isTransparent={true} locale={locale} />
        </div>
    )
}
