'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BASE_SERVER_URL, PAGINATION_OPTIONS } from '@/utils/constants'
import Pagination from './Pagination'
import Dropdown from './admin-panel/ui-kit/Dropdown'
import { useConstants } from '@/hooks/useConstants'
import { getAuthors } from '@/api/author/get_authors'
import Loader from './Loader'
import MotionWrapper from './admin-panel/ui-kit/MotionWrapper'
import { getTranslation } from '@/i18n/client'

export default function Authors() {
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const [authors, setAuthors] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredAuthors, setFilteredAuthors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);
    const _isEng = locale === 'en';

    useEffect(() => {
        setFilteredAuthors(prev => authors.filter(author =>
            locale === 'en' ? author.dataEng?.name.toLowerCase().includes(filterName.toLowerCase())
                : author.dataRu?.name.toLowerCase().includes(filterName.toLowerCase())).sort((a, b) => a.rank - b.rank)
            .sort((a, b) => {
                return a.authorType - b.authorType;
            }))
    }, [filterName, authors])

    useEffect(() => {
        fetchAuthors();
    }, [])

    const fetchAuthors = async () => {
        const result = await getAuthors();
        if (result.success) {
            setAuthors(result.data)
        }
        setIsLoading(false);
    }

    const AuthorCard = ({ photo, dataEng, dataRu, authorType, id }) => {
        return <Link href={`/${locale}/authors/${id}`}
            className='relative aspect-[2/3] overflow-hidden
    rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300 flex flex-col  cursor-pointer'>
            <div className='w-full h-full relative'>
                {photo && <Image src={`${BASE_SERVER_URL}${photo?.path}`} width={500} height={500} alt='soil' className='m-auto w-full h-full object-cover self-start' />}
            </div>
            <div className='absolute right-4 top-4'>
                {authorType !== undefined && <div className="flex items-center gap-x-2">
                    {authorType == '0' ? <p className="px-5 py-1 text-sm text-red-600 rounded-full bg-red-100/70">{t('main_editor')}</p> :
                        authorType == '1' ? <p className="px-5 py-1 text-sm text-emerald-600 rounded-full bg-emerald-100/70">{t('executive_editor')}</p> :
                            authorType == '2' ? <p className="px-5 py-1 text-sm text-blue-600 rounded-full bg-blue-100/70">{t('editor')}</p> : ''}
                </div>}
            </div>
            <div className='flex flex-col space-y-2 p-4 z-10 absolute bottom-0 h-[25%] backdrop-blur-sm bg-white/50 w-full'>
                <p className='text-base font-medium text-black'>
                    {_isEng ? (dataEng.name || '') : (dataRu.name || '')}
                </p>
                <p className='text-blue-700 '>
                    {_isEng ? (dataEng.organization || '') : (dataRu.organization || '')}
                </p>
            </div>
        </Link>
    }

    return (
        <div className='flex flex-col'>
            <div className='relative flex flex-row space-x-2 mb-4'>
                <div className="relative w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        type="text"
                        placeholder={t('search_name')}
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className={`flex flex-row justify-end  items-center mb-4`}>
                <div className='self-end flex-row items-center justify-center w-[190px]'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' noBold={true} />
                </div>
            </div>

            <ul className='soils-grid mb-4'>
                {isLoading ? Array(8).fill('').map((item, idx) => <li key={idx}>
                    <Loader className='w-full h-full aspect-[2/3]' />
                </li>) :
                    authors.length && filteredAuthors.length ? currentItems.map(author => <li key={author.id}>
                        <MotionWrapper>
                            {AuthorCard({ ...author })}
                        </MotionWrapper>
                    </li>) : <MotionWrapper className='col-span-full'>
                        <p className='text-gray-500 mt-6 col-span-full'>
                            {t('no_objects')}
                        </p>
                    </MotionWrapper>}
            </ul>
            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredAuthors}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div >
    )
}

