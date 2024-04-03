'use client'

import { getSoil } from '@/api/get_soil'
import MapPointView from '@/components/map/MapPointView'
import Zoom from '@/components/map/Zoom'
import Gallery from '@/components/soils/Gallery'
import { BASE_URL, SOIL_INFO } from '@/utils/constants'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'


export default function SoilPage({ params: { id } }) {
    const [soil, setSoil] = useState({})
    const [category, setCategory] = useState({})
    const [mapVisible, setMapVisible] = useState(true)

    const handleScrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSoil = async () => {
        const result = await getSoil(id)
        if (result.success) {
            setSoil(result.data)
            console.log(result.data)
            const soilTypes = {
                0: { title: 'Динамика почв', id: 0, ref: '/' },
                1: { title: 'Почвенные профили', id: 1, ref: '/' },
                2: { title: 'Почвенные морфологические элементы', id: 2, ref: '/' },
            };
            setCategory(soilTypes[result.data.objectType]);
        }
    }

    useEffect(() => {
        fetchSoil()
    }, [])

    return (
        <div className='flex flex-col'>
            <h1 className='text-2xl font-semibold mb-2'>
                {soil.name}
            </h1>
            <div className='flex flex-row w-full border-b-2'>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!soil.ecoSystems?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('ecosystems-section')}>
                    Экосистемы ({soil.ecoSystems?.length})
                </button>
                <button className={`y-2 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 text-blue-600 mr-10 py-2
                ${!soil.publications?.length && 'hidden'}`}
                    onClick={() => handleScrollToSection('publications-section')}>
                    Публикации ({soil.publications?.length})
                </button>
                <button className='y-2 text-blue-600 w-fit font-semibold border-b-2 translate-y-[2px]
                hover:border-blue-600 py-2'
                    onClick={() => handleScrollToSection('map-section')}>
                    Показать на карте
                </button>
            </div>
            <div className='flex flex-row mt-6 space-x-8'>
                <div className='w-1/2'>
                    {/* <Gallery mainPhoto={soil.photo} objectPhoto={soil.objectPhoto} /> */}
                </div>
                <div className='w-1/2'>
                    <h3 className='text-2xl font-semibold mb-2'>
                        Информация об объекте
                    </h3>
                    <ul className='flex flex-col space-y-2 '>
                        {SOIL_INFO.map(({ name, titleRu }) =>
                            soil.hasOwnProperty(name) && <li key={name}
                                className='flex flex-row w-full space-x-4'>
                                <span className='w-[40%] text-zinc-500 font-semibold'>
                                    {titleRu}
                                </span>
                                <span className={`w-[60%] }`}>
                                    {name === 'objectType' ? <Link href={`/soils?categories=${category.id}`}
                                        className='text-blue-600 hover:underline'>
                                        {category.title}
                                    </Link> : soil[name]}
                                </span>
                            </li>)}

                        {soil.authors?.length ? <li key='authors'
                            className='flex flex-row w-full space-x-4'>
                            <span className='w-[40%] text-zinc-500 font-semibold'>
                                Авторы
                            </span>
                            <ul className={`w-[60%] flex flex-row`}>
                                {soil.authors?.map(({ id, fio }, index) =>
                                    <li key={id} className='mr-1'>
                                        <Link href={`${BASE_URL}/authors/${id}`}
                                            className='text-blue-600 hover:underline'>
                                            {fio}
                                        </Link>
                                        {soil.authors.length > 1 && index + 1 < soil.authors.length && ','}
                                    </li>
                                )}
                            </ul>
                        </li> : ''}
                        {soil.classification?.map(({ name, terms }) =>
                            <li key={name}
                                className='flex flex-row w-full space-x-4'>
                                <span className='w-[40%] text-zinc-500 font-semibold'>
                                    {name}
                                </span>
                                <ul className={`w-[60%] flex flex-row`}>
                                    {terms.map(({ id, name }, index) =>
                                        <li key={id} className='mr-1'>
                                            <Link href={`${BASE_URL}/soils?terms=${id}`}
                                                className='text-blue-600 hover:underline'>
                                                {name}
                                            </Link>
                                            {terms.length > 1 && index + 1 < terms.length && ','}
                                        </li>
                                    )}
                                </ul>
                            </li>)}
                    </ul>
                </div>
            </div>
            <button className='text-blue-600 w-fit mt-6' onClick={() => setMapVisible(!mapVisible)}>
                {mapVisible ? 'Скрыть карту' : 'Показать карту'}
            </button>
            {mapVisible ? <div id='map-section' className='mt-4 border rounded-lg overflow-hidden'>
                <div className='relative w-full aspect-[2/1]'>
                    <MapPointView latitude={soil.latitude} longtitude={soil.longtitude} />
                    {/* <div className='z-20 absolute top-[calc(50%-112px)] right-0'>
                        <Zoom />
                    </div> */}
                </div>
            </div> : ''}
            {soil.ecoSystems?.length ?
                <div id='ecosystems-section'>
                    <h3 className='text-2xl font-semibold mt-8'>
                        Экосистемы
                    </h3>
                </div> : ''}
            {soil.publications?.length ? <div id='publications-section'>
                <h3 className='text-2xl font-semibold mt-8'>
                    Публикации
                </h3>
            </div> : ''}
        </div>
    )
}
