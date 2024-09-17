'use client'

import { getTranslation } from '@/i18n/client';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchRegion({ onLocationHandler }) {
    const [searchTitle, setSearchTitle] = useState('');
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const [location, setLocation] = useState([]);

    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const handleSearch = async (e) => {
        const { value } = e.target;
        setSearchTitle(value);

        // Если есть активный таймер, сбрасываем его
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Устанавливаем новый таймер
        const newTimeout = setTimeout(() => {
            fetchLocations(value);
            clearTimeout(debounceTimeout);
        }, 300); // 300 мс задержка

        setDebounceTimeout(newTimeout);
    }

    const fetchLocations = async (value) => {
        const params = {
            q: value,
            format: "json",
            addressdetails: 1,
            polygon_geojson: 0,
        };
        const queryString = new URLSearchParams(params).toString();
        if (!value.length) {
            setLocation([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${queryString}`
            );
            const result = await response.json();

            if (result.length > 0) {
                setLocation(result.slice(0, 5));
            }
        } catch (err) {
            console.log(err);
        }
    }

    const handleLocationChange = (item) => {
        onLocationHandler(item);
        setSearchTitle('');
    }

    return (
        <div className="mx-2 w-full flex flex-col">
            <div className='relative overflow-visible'>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    value={searchTitle}
                    onChange={handleSearch}
                    type="text"
                    placeholder={t('search_byRegion')}
                    className="shadow-md w-full h-[40px] px-10 sm:px-12 border border-transparent rounded-md outline-none bg-white focus:border-blue-600" />

                <button className='absolute right-3 top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 hover:text-zinc-600 duration-300'
                    onClick={() => setSearchTitle('')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className='w-full mt-1'>
                {searchTitle !== '' ? <div className="z-50 dropdown bg-white/90 w-full min-h-[calc(100%-38px)] 
        max-h-screen overflow-y-auto
        rounded-md shadow-md">
                    <ul className={`dropdown-menu ${location.length && 'py-2 pr-2.5'}`}>
                        {location.map((item) => (
                            <li key={item.id} className="max-w-full cursor-pointer duration-300 hover:text-blue-600 px-1 py-1.5"
                                onClick={() => handleLocationChange(item)}>
                                <div className="flex items-start pl-2">
                                    <img className="w-6 h-6 mt-[2px]" src='/search-marker.svg' alt="Logo" />
                                    <p className='pl-2'>
                                        {item.display_name}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div> : ''}
            </div>

        </div >
    )
}
