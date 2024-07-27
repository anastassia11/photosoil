'use client'

import MapPointView from '../map/MapPointView'
import { useEffect, useState } from 'react';
import Soils from './Soils';
import Gallery from './Gallery';
import Zoom from '../map/Zoom';
import FullScreen from '../map/FullScreen';
import { useTranslation } from 'react-i18next';
import NewGallery from './NewGallery';
import { useParams } from 'next/navigation';
import Publications from '../publication/Publications';

export default function SoilObject({ object, children }) {
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
                    {/* md:min-w-[50%] md:max-w-[50%] lg:max-w-[550px] lg:min-w-[550px] */}
                    {/* <Gallery mainPhoto={object.photo} objectPhoto={object.objectPhoto} /> */}
                    <NewGallery mainPhoto={object.photo} objectPhoto={object.objectPhoto} />
                </div>
                <div className='md:ml-8 mt-12 md:mt-0'>
                    <h3 className='sm:text-2xl text-xl font-semibold mb-2'>
                        {t('info_obj')}
                    </h3>
                    {children}
                </div>
            </div>
            {object.latitude && <>
                <button className='text-blue-600 w-fit mt-6' onClick={() => setMapVisible(!mapVisible)}>
                    {mapVisible ? t('hide_map') : t('show_map')}
                </button>
                {mapVisible ? <div id='map-section' className='mt-4 border rounded-lg overflow-hidden'>
                    <div className='relative w-full aspect-[2/1]'>
                        <MapPointView latitude={object.latitude} longtitude={object.longtitude} />
                        <div className='z-20 absolute top-0 right-0 m-2'>
                            <FullScreen />
                        </div>
                        <div className='z-30 absolute top-[calc(50%-50px)] right-0 m-2 '>
                            <Zoom />
                        </div>
                    </div>
                </div> : ''}
            </>}

            {object.soilObjects?.length ?
                <div id='soilObjects-section'>
                    <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
                        {t('connect_soils')}
                    </h3>
                    <Soils soils={object.soilObjects} isFilters={false} isDrafts={true} type='soils' />
                </div> : ''}
            {object.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='sm:text-2xl text-xl font-semibold mt-12 mb-4'>
                        {t('connect_ecosystems')}
                    </h3>
                    <Soils soils={object.ecoSystems} isFilters={false} isDrafts={true} type='ecosystems' />
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