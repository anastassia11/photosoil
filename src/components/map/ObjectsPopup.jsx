'use client'

import { useConstants } from '@/hooks/useConstants';
import { BASE_SERVER_URL } from '@/utils/constants';
import { t } from 'i18next';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';

export default function ObjectsPopup({ visible, objects, onCloseClick }) {
    const { locale } = useParams();
    const { t } = useTranslation();
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
        return <Link href={`${object._type}s/${object.id}`}
            className='flex flex-row hover:bg-zinc-100 duration-300 px-4 py-3'>
            {object._type === 'publication' ? <div className='flex flex-col ml-2 max-w-full'>
                <p className='text-blue-700'>
                    {PUBLICATION_ENUM[object.type] || ''}
                </p>
                <p className='mt-1'>
                    {currentTransl.name}
                </p>
                <p className="text-gray-600 text-nowrap text-ellipsis max-w-full overflow-hidden mt-1">
                    {currentTransl.authors}
                </p>
                {/* <p className="text-gray-600 flex items-center font-medium">
                    {currentTransl.edition}
                </p> */}
            </div> : <> {object?.photo?.path
                ? <Image src={`${BASE_SERVER_URL}${object.photo?.path}`}
                    className="aspect-[3/4] object-cover object-top border border-blue-600 shadow-md rounded-xl w-[40%]"
                    alt={object?.name}
                    width={500}
                    height={500} /> : ''}
                <div className='flex flex-col ml-2'>
                    <p className='text-blue-700'>
                        {object._type === 'soil' ? (SOIL_ENUM[object.objectType] || '') : ''}
                    </p>
                    <p className='mt-1'>
                        {currentTransl.name}
                    </p>
                </div>
            </>
            }
        </Link>
    }

    useEffect(() => { console.log(isVisible['soils']) }, [isVisible])

    const Dropdown = (type) => {
        return <div className='flex flex-col'>
            <label onClick={() => setIsVisible(prev => ({ ...prev, [type]: !prev[type] }))}
                className="px-3 text-gray-500 flex flex-row items-center cursor-pointer text-xl font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`mr-1 size-6 duration-150 ${isVisible[type] ? 'rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
                {t(type)}
            </label>

            {<ul className={`flex flex-col duration-200 transition-all ${isVisible[type] ? 'visible translate-y-3' : 'invisible opacity-0'}`}>
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
        <div className={`${visible ? "-left-[2px]" : "-left-[440px]"} 
        z-30 absolute top-0 w-[400px] max-w-[400px] 
     max-h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row`}>
            <div className={`relative flex-1 flex flex-col max-w-full`}>
                <button
                    onClick={handleCloseClick}
                    className="absolute -right-[30px] top-0 bg-white w-6 h-10 rounded-md shadow-md flex
                     items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                        className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                {objects.length ? <div className='flex flex-col py-4 space-y-1 max-h-full overflow-y-auto scroll'>
                    {soils.length ? Dropdown('soils') : ''}
                    {ecosystems.length ? Dropdown('ecosystems') : ''}
                    {publications.length ? Dropdown('publications') : ''}
                </div> : ''}
            </div>
        </div>
    )
}