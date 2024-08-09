'use client'

import { useEffect, useState } from 'react';
import Soils from './Soils';
import { useTranslation } from 'react-i18next';
import NewGallery from './NewGallery';
import { useParams } from 'next/navigation';
import Publications from '../publication/Publications';
import MapSelect from '../map/MapSelect';

export default function SoilObject({ object, children, type }) {
    const [mapVisible, setMapVisible] = useState(true);
    const { t } = useTranslation();
    const { locale } = useParams();
    let _isEng = locale === 'en';

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        document.documentElement.style.setProperty('--product-view-height', '480px');
    }, [])

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-2'>
                {object?.translations?.find(({ isEnglish }) => isEnglish === _isEng)?.name}
            </h1>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.soilObjects?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('soilObjects-section')}>
                    {t('connect_soils')} ({object.soilObjects?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    {t('connect_ecosystems')} ({object.ecoSystems?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.publications?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('publications-section')}>
                    {t('connect_publ')} ({object.publications?.length})
                </button>
                <button className={`y-2 text-blue-600 w-fit font-semibold border-b-2 translate-y-[2px]
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
