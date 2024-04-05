'use client'

import MapPointView from '../map/MapPointView'
import { useState } from 'react';
import Soils from './Soils';

export default function SoilObject({ object, children }) {
    const [mapVisible, setMapVisible] = useState(true);

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-2'>
                {object.name}
            </h1>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.soilObjects?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('soilObjects-section')}>
                    Почвенные объекты ({object.soilObjects?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    Экосистемы ({object.ecoSystems?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!object.publications?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('publications-section')}>
                    Публикации ({object.publications?.length})
                </button>
                <button className={`y-2 text-blue-600 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 py-2
                ${!object.latitude && 'hidden'}`}
                    onClick={() => handleScrollToSection('map-section')}>
                    Показать на карте
                </button>
            </div>
            <div className='flex flex-row mt-6 space-x-8'>
                <div className='w-1/2'>
                    {/* <Gallery mainPhoto={object.photo} objectPhoto={object.objectPhoto} /> */}
                </div>
                <div className='w-1/2'>
                    <h3 className='text-2xl font-semibold mb-2'>
                        Информация об объекте
                    </h3>
                    {children}
                </div>
            </div>
            {object.latitude && <>
                <button className='text-blue-600 w-fit mt-6' onClick={() => setMapVisible(!mapVisible)}>
                    {mapVisible ? 'Скрыть карту' : 'Показать карту'}
                </button>
                {mapVisible ? <div id='map-section' className='mt-4 border rounded-lg overflow-hidden'>
                    <div className='relative w-full aspect-[2/1]'>
                        <MapPointView latitude={object.latitude} longtitude={object.longtitude} />
                        {/* <div className='z-20 absolute top-[calc(50%-112px)] right-0'>
                        <Zoom />
                    </div> */}
                    </div>
                </div> : ''}
            </>}

            {object.soilObjects?.length ?
                <div id='soilObjects-section'>
                    <h3 className='text-2xl font-semibold mt-12 mb-4'>
                        Почвенные объекты
                    </h3>
                    <Soils soils={object.soilObjects} _filtersVisible={false} type='soils' />
                </div> : ''}
            {object.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='text-2xl font-semibold mt-12 mb-4'>
                        Экосистемы
                    </h3>
                    <Soils soils={object.ecoSystems} _filtersVisible={false} type='ecosystems' />
                </div> : ''}
            {object.publications?.length ? <div id='publications-section'>
                <h3 className='text-2xl font-semibold mt-12 mb-4'>
                    Публикации
                </h3>
            </div> : ''}
        </div>
    )
}
