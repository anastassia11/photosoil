'use client'

import { useConstants } from '@/hooks/useConstants';
import { getTranslation } from '@/i18n/client';
import { BASE_SERVER_URL } from '@/utils/constants';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function ObjectsPopup({ visible, objects, onCloseClick }) {
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const [soils, setSoils] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [publications, setPublications] = useState([]);

    const { SOIL_ENUM, PUBLICATION_ENUM } = useConstants();

    const [isVisible, setIsVisible] = useState({
        soils: true,
        ecosystems: true,
        publications: true,
    })

    useEffect(() => {
        setSoils(objects.filter(({ _type }) => _type === 'soil'));
        setEcosystems(objects.filter(({ _type }) => _type === 'ecosystem'));
        setPublications(objects.filter(({ _type }) => _type === 'publication'));
    }, [objects])

    const handleCloseClick = () => {
        onCloseClick();
    }

    const ObjectCard = (object) => {
        const currentTransl = object.translations?.find(({ isEnglish }) => isEnglish === (locale === 'en')) || {};
        return <Link href={`/${locale}/${object._type}s/${object.id}`}
            prefetch={false}
            className={`flex flex-row hover:bg-zinc-100 duration-300 px-4 ${object._type === 'publication' ? 'py-2' : 'py-3'}`}>
            {object._type === 'publication' ? <div className='flex flex-col ml-1 max-w-full'>
                <p className='text-blue-700 text-sm sm:text-base'>
                    {PUBLICATION_ENUM[object.type] || ''}
                </p>
                <p className='mt-1 text-sm sm:text-base'>
                    {currentTransl.name}
                </p>
                <p className="text-gray-600 text-nowrap text-ellipsis max-w-full overflow-hidden mt-1 text-sm sm:text-base">
                    {currentTransl.authors}
                </p>
            </div> : <div className='flex flex-row'>
                {object?.photo?.path
                    ? <div className='max-w-[40%] w-[40%]'><Image src={`${BASE_SERVER_URL}${object.photo?.path}`}
                        className="aspect-[3/4] object-cover object-top border border-blue-600 shadow-md rounded-xl overflow-hidden"
                        alt={object?.name}
                        width={500}
                        height={500} /></div> : ''}
                <div className='flex flex-col ml-2 max-w-[60%]'>
                    <p className='text-blue-700 text-sm sm:text-base'>
                        {object._type === 'soil' ? (SOIL_ENUM[object.objectType] || '') : ''}
                    </p>
                    <p className='mt-1 text-sm sm:text-base'>
                        {currentTransl.name}
                    </p>
                </div>
            </div>
            }
        </Link>
    }

    const Dropdown = (type) => {
        return <div className='flex flex-col'>
            <label onClick={() => setIsVisible(prev => ({ ...prev, [type]: !prev[type] }))}
                className="select-none px-3 py-1 text-gray-500 flex flex-row items-center cursor-pointer sm:text-xl text-lg font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`mr-1 size-6 duration-150 ${isVisible[type] ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
                {t(type)}
            </label>

            {<ul className={`flex flex-col duration-300 transition-all overflow-hidden ${isVisible[type] ? 'max-h-fit opacity-100 visible translate-y-0' : '-translate-y-2 max-h-0 invisible opacity-0'}`}>
                {type === 'soils' ? soils.map(obj => <li key={obj.id}>
                    {ObjectCard(obj)}
                </li>)
                    : type === 'ecosystems' ? ecosystems.map(obj => <li key={obj.id}>
                        {ObjectCard(obj)}
                    </li>)
                        : publications.map(obj => <li key={obj.id}>
                            {ObjectCard(obj)}
                        </li>)}
            </ul>}
        </div>
    }

    return (
        <div className={`${visible ? "-left-[0px] z-30" : "sm:-left-[440px] z-20 -left-[calc(100%-90px)]"} 
       absolute lg:top-0 top-[45px] sm:w-[400px] w-[calc(100%-98px)] sm:max-w-[400px] 
     sm:max-h-[calc(100%-16px)] max-h-[calc(100%-100px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row`}>
            <div className={`relative flex-1 flex flex-col max-w-full`}>
                <button
                    onClick={handleCloseClick}
                    className="absolute -right-[33px] top-0 bg-white w-[25px] h-10 rounded-md shadow-md flex
                     items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                        className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                {objects.length ? <div className='flex flex-col sm:py-4 py-2 space-y-2 max-h-full overflow-y-auto scroll'>
                    {soils.length ? Dropdown('soils') : ''}
                    {ecosystems.length ? Dropdown('ecosystems') : ''}
                    {publications.length ? Dropdown('publications') : ''}
                </div> : ''}
            </div>
        </div>
    )
}
