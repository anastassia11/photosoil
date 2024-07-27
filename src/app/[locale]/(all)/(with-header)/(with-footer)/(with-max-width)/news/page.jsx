'use client'

import { getAllNews } from '@/api/news/get_allNews';
import Pagination from '@/components/Pagination';
import Dropdown from '@/components/admin-panel/Dropdown';
import Filter from '@/components/soils/Filter';
import { addTag, deleteTag, getAllTags, resetTags } from '@/store/slices/dataSlice';
import { PAGINATION_OPTIONS } from '@/utils/constants';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export default function NewsPage() {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const [news, setNews] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredNews, setFilteredNews] = useState([]);
    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);
    const searchParams = useSearchParams();
    const router = useRouter();

    const { t } = useTranslation();
    const { locale } = useParams();
    const { tags, selectedTags } = useSelector(state => state.data);

    const _isEng = locale === 'en';

    useEffect(() => {
        fetchNews();
        dispatch(getAllTags())
    }, [])

    useEffect(() => {
        setFilteredNews(prev => news.filter(item =>
            item.translations?.find(transl => transl.isEnglish === _isEng)?.title.toLowerCase().includes(filterName.toLowerCase()) &&
            (selectedTags.length === 0 || selectedTags.some(selectedTag => item.tags.some(({ id }) => id === selectedTag)))
        ))
    }, [filterName, news, selectedTags])

    useEffect(() => {
        updateFiltersInHistory();
    }, [selectedTags])

    const updateFiltersInHistory = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (selectedTags.length > 0) {
            params.set('tags', selectedTags.join(','));
        } else {
            params.delete('tags');
        }
        router.replace(pathname + '?' + params.toString())
    }

    const handleAddTag = (newItem) => {
        dispatch(addTag(newItem))
    }

    const handleDeleteTag = (deletedItem) => {
        dispatch(deleteTag(deletedItem))
    }

    const handleResetTags = () => {
        dispatch(resetTags())
    }

    const fetchNews = async () => {
        const result = await getAllNews();
        if (result.success) {
            setNews(result.data)
        }
    }

    const NewsCard = ({ id, tags, translations }) => {
        const currentTransl = translations?.find(({ isEnglish }) => isEnglish === _isEng) || {};
        return <Link href={`${pathname}/${id}`}
            className="px-8 py-4 bg-white rounded-md hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] transition-all duration-300
             w-full h-full flex flex-col justify-between">
            <div className='flex flex-col'>
                <span className="text-sm font-light text-gray-600">{currentTransl?.lastUpdated || ''}</span>

                <div className="mt-2">
                    <h3 className="text-xl font-medium text-gray-700 hover:text-gray-600">{currentTransl?.title || ''}</h3>
                    <p className="mt-2 text-gray-600 ">{currentTransl?.annotation || ''}</p>
                </div>
            </div>
            <ul className="flex flex-row flex-wrap mt-4 align-bottom">
                {tags.map(({ id, nameRu, nameEng }) => <li key={`tag-${id}`} className="text-blue-600 min-w-fit mr-4">
                    {_isEng ? (nameEng || '') : (nameRu || '')}
                </li>)}
            </ul>
        </Link>
    }

    return (
        <div className='flex flex-col'>
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('news')}
            </h1>

            <div className="relative w-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    type="text"
                    placeholder={t('search_heading')}
                    className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                />
            </div>

            <div className='self-end flex-row items-center justify-center mb-4 w-[190px]'>
                <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                    onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' />
            </div>
            <div className='mb-6 filters-grid'>
                <Filter isEng={_isEng} itemId='tags'
                    name={t('tags')}
                    items={tags}
                    allSelectedItems={selectedTags}
                    addItem={handleAddTag}
                    deleteItem={handleDeleteTag}
                    resetItems={handleResetTags}
                />
            </div>


            <ul className='soils-grid mb-4'>
                {currentItems.map((item, idx) => <li key={`news_${idx}`} className='w-full h-full'>
                    <NewsCard {...item} />
                </li>)}
            </ul>

            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredNews}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div>
    )
}