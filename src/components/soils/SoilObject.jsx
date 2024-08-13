'use client'

import { useEffect, useState } from 'react';
import Soils from './Soils';
import { useTranslation } from 'react-i18next';
import NewGallery from './NewGallery';
import { useParams } from 'next/navigation';
import Publications from '../publication/Publications';
import MapSelect from '../map/MapSelect';
import Link from 'next/link';

export default function SoilObject({ object, children, type }) {
    const [mapVisible, setMapVisible] = useState(true);
    const { t } = useTranslation();
    const { locale } = useParams();
    const [tokenData, setTokenData] = useState({});
    let _isEng = locale === 'en';

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--product-view-height', '480px');
        localStorage.getItem('tokenData') && setTokenData(JSON.parse(localStorage.getItem('tokenData')));
    }, [])

    useEffect(() => {
        console.log(tokenData, object)
    }, [tokenData, object])

    return (
        <div className='flex flex-col'>
            <div className='flex flex-col sm:flex-row mb-2 justify-between sm:items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {object?.translations?.find(({ isEnglish }) => isEnglish === _isEng)?.name}
                </h1>
                {tokenData.role === 'Admin' || (tokenData.name === object.user?.name) ? <Link target="_blank"
                    className='text-blue-700 cursor-pointer flex flex-row items-center hover:underline duration-300'
                    href={{
                        pathname: `/admin/${type === 'soil' ? 'objects' : 'ecosystems'}/edit/${object.id}`,
                        query: { lang: _isEng ? 'eng' : 'ru' }
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 mr-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <p className='pt-[3px]'>
                        {t('edit_go')}
                    </p>
                </Link> : ''}
            </div>

            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 sm:mr-10 mr-4 py-2 text-sm sm:text-base 
                ${!object.soilObjects?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('soilObjects-section')}>
                    {t('connect_soils')} ({object.soilObjects?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 sm:mr-10 mr-4 py-2 text-sm sm:text-base
                ${!object.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    {t('connect_ecosystems')} ({object.ecoSystems?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 sm:mr-10 mr-4 py-2 text-sm sm:text-base
                ${!object.publications?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('publications-section')}>
                    {t('connect_publ')} ({object.publications?.length})
                </button>
                <button className={`y-2 text-blue-600 w-fit font-semibold text-sm sm:text-base border-b-2 translate-y-[2px]
                hover:border-blue-600 py-2
                ${!object.latitude && 'hidden'}`}
                    onClick={() => handleScrollToSection('map-section')}>
                    {t('show_inMap')}
                </button>
            </div>
            <div className='flex md:flex-row flex-col mt-6 '>
                <div className='w-full md:min-w-[50%] md:max-w-[50%] lg:max-w-[550px] lg:min-w-[550px]'>
                    <NewGallery mainPhoto={object.photo} objectPhoto={object.objectPhoto} />
                </div>
                <div className='md:ml-8 mt-12 md:mt-0 w-full'>
                    <h3 className='sm:text-2xl text-xl font-semibold mb-2'>
                        {t('info_obj')}
                    </h3>
                    {children}
                </div>
            </div>
            {object.latitude && <div id='map-section'>
                <button className='text-blue-600 w-fit mt-6' onClick={() => setMapVisible(!mapVisible)}>
                    {mapVisible ? t('hide_map') : t('show_map')}
                </button>
                {mapVisible ? <div className='mt-4 border rounded-lg overflow-hidden'>
                    <div className='relative w-full aspect-[2/1]'>
                        <MapSelect type={type}
                            latitude={object?.latitude} longtitude={object?.longtitude} />
                    </div>
                </div> : ''}
            </div>}

            {object.soilObjects?.length ?
                <div id='soilObjects-section'>
                    <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
                        {t('connect_soils')}
                    </h3>
                    <Soils _soils={object.soilObjects} isFilters={false} type='soils' />
                </div> : ''}
            {object.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
                        {t('connect_ecosystems')}
                    </h3>
                    <Soils _soils={object.ecoSystems} isFilters={false} type='ecosystems' />
                </div> : ''}
            {object.publications?.length ? <div id='publications-section'>
                <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
                    {t('connect_publ')}
                </h3>
                <Publications publications={object.publications} />
            </div> : ''}
        </div>
    )
}
