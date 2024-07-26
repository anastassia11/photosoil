'use client'

import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Pagination from '../Pagination';
import Link from 'next/link';
import Dropdown from '../admin-panel/Dropdown';
import { BASE_URL, PAGINATION_OPTIONS } from '@/utils/constants';
import { useConstants } from '@/hooks/useConstants';

export default function Publications({ publications }) {
    const [filterName, setFilterName] = useState('');
    const [filteredPublications, setFilteredPublications] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);
    const [draftIsVisible, setDraftIsVisible] = useState(false);
    const [token, setToken] = useState(false);

    const { locale } = useParams();
    const { t } = useTranslation();
    const { PUBLICATION_ENUM } = useConstants();

    const _isEng = locale === 'en';

    useEffect(() => {
        localStorage.getItem('tokenData') && setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
    }, [])

    useEffect(() => {
        setFilteredPublications(prev => publications.filter(publication =>
        (locale === 'en' ? publication.translations?.find(transl => transl.isEnglish)?.name.toLowerCase().includes(filterName.toLowerCase())
            : publication.translations?.find(transl => !transl.isEnglish)?.name.toLowerCase().includes(filterName.toLowerCase()))
        ))
    }, [filterName, publications])

    return (
        <div className='flex flex-col'>
            <div className='relative flex flex-row space-x-2 mb-4'>
                <div className="relative w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        type="text"
                        placeholder={t('search_title')}
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className={`flex flex-row ${token ? 'justify-between' : 'justify-end'} items-center`}>
                {token && <label htmlFor='draftIsVisible' className={`flex-row cursor-pointer items-center justify-center
                    flex`}>
                    <input type="checkbox" id='draftIsVisible'
                        checked={draftIsVisible}
                        onChange={() => setDraftIsVisible(!draftIsVisible)}
                        className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                    <span>{t('grafts_visible')}</span>
                </label>}
                <div className='self-end flex-row items-center justify-center w-[190px]'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' />
                </div>
            </div>
            <section className="">
                <div className="mx-auto ">
                    <ul className="">
                        {
                            currentItems.map((item, idx) => (
                                <li key={idx} className={`mt-4 ${idx + 1 === currentItems.length ? '' : 'border-b'} flex flex-row`}>
                                    <Link href={`${BASE_URL}/publications/${item.id}`}
                                        className='justify-between items-start flex flex-row flex-1 mb-4 px-4 py-5 cursor-pointer hover:bg-white
                                        rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300'>
                                        <div className='space-y-3'>
                                            <div className="flex items-center gap-x-3">
                                                <div>
                                                    <span className="block text-indigo-600 font-medium">{PUBLICATION_ENUM[item.type] || ''}</span>
                                                    <h3 className="text-base text-gray-800 font-semibold mt-1">{item.translations.find(({ isEnglish }) => isEnglish === _isEng).name}</h3>
                                                </div>
                                            </div>
                                            <p className="text-gray-600">
                                                {item.translations.find(({ isEnglish }) => isEnglish === _isEng).authors}
                                            </p>
                                            <p className="text-gray-600 flex items-center font-medium">
                                                {item.translations.find(({ isEnglish }) => isEnglish === _isEng).edition}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </section>
            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredPublications}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div>
    )
}
