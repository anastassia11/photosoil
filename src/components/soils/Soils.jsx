import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import Filter from './Filter'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BASE_SERVER_URL, PAGINATION_OPTIONS } from '@/utils/constants'
import { addCategory, addTerm, deleteCategory, deleteTerm } from '@/store/slices/dataSlice'
import Pagination from '../Pagination'
import { useTranslation } from 'react-i18next'
import Dropdown from '../admin-panel/Dropdown'
import { useConstants } from '@/hooks/useConstants'
import { getClassifications } from '@/api/classification/get_classifications'

export default function Soils({ soils, isAllSoils, isFilters, isDrafts, type }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = useTranslation();

    const didLogRef = useRef(true);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { selectedTerms, selectedCategories } = useSelector(state => state.data);

    const [classifications, setClassifications] = useState([]);

    const [filterName, setFilterName] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(true);
    const [filteredSoils, setFilteredSoils] = useState([]);

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);

    const [draftIsVisible, setDraftIsVisible] = useState(false);
    const [token, setToken] = useState(null);

    const { SOIL_ENUM } = useConstants();
    const CATEGORY_ARRAY = Object.entries(SOIL_ENUM).map(([key, value]) => ({
        id: Number(key),
        name: value,
    }));
    const _isEng = locale === 'en';

    useEffect(() => {
        setFilteredSoils(prev => soils.filter(soil =>
            soil.translations?.find(transl => transl.isEnglish === _isEng)?.name.toLowerCase().includes(filterName.toLowerCase())
            && (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm)))
        ))
    }, [filterName, selectedCategories, selectedTerms, soils])

    useEffect(() => {
        setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
        fetchClassifications();
        if (didLogRef.current) {
            didLogRef.current = false
            const categoriesParam = searchParams.get('categories');
            const termsParam = searchParams.get('terms');

            categoriesParam && categoriesParam.split(',').forEach((param) => dispatch(addCategory(Number(param))));
            termsParam && termsParam.split(',').forEach((param) => dispatch(addTerm(Number(param))));
        }
    }, [])

    useEffect(() => {
        updateFiltersInHistory();
    }, [selectedCategories, selectedTerms])

    const fetchClassifications = async () => {
        const result = await getClassifications();
        if (result.success) {
            setClassifications(result.data);
        }
    }

    const updateFiltersInHistory = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (selectedCategories.length > 0) {
            params.set('categories', selectedCategories.join(','));
        } else {
            params.delete('categories');
        }

        if (selectedTerms.length > 0) {
            params.set('terms', selectedTerms.join(','));
        } else {
            params.delete('terms');
        }
        router.replace(pathname + '?' + params.toString())
    };

    const handleAddCategory = (newItem) => {
        dispatch(addCategory(newItem))
    }

    const handleDeleteCategorie = (newItem) => {
        dispatch(deleteCategory(newItem))
    }

    const handleResetCategories = (deletedItems) => {
        for (let item of deletedItems) {
            dispatch(deleteCategory(item))
        }
    }

    const handleAddTerm = (newItem) => {
        dispatch(addTerm(newItem))
    }

    const handleDeleteTerm = (deletedItem) => {
        dispatch(deleteTerm(deletedItem))
    }

    const handleResetTerms = (deletedItems) => {
        for (let item of deletedItems) {
            dispatch(deleteTerm(item))
        }
    }

    const isSoils = type === 'soils' || type === 'profiles' ||
        type === 'morphological' || type === 'dynamics'

    const SoilCard = ({ photo, name, id }) => {
        return <Link href={`/${type}/${id}`}
            className='relative aspect-[2/3] overflow-hidden transition-all
    rounded-md  hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] flex flex-col  duration-300 cursor-pointer'>
            <div className='h-[100%] w-full overflow-hidden opacity-80'
                style={{
                    backgroundImage: `url("${BASE_SERVER_URL}${photo.path}")`,
                    backgroundSize: '200%',
                    backgroundPosition: 'center',
                    filter: 'blur(3px)',
                }}>

            </div>
            <div className='h-[75%] absolute top-0 w-full flex'>
                <Image src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='m-auto w-full h-full object-contain self-start' />
            </div>
            <p className='p-4 text-sm font-medium z-10 absolute bottom-0 h-[25%] backdrop-blur-md bg-black/40 text-white w-full'>
                {name}
            </p>
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
                        placeholder={`${isSoils ? t('search_code') :
                            type === 'ecosystems' ? t('search_title') :
                                t('search_name')}`}
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className={`flex flex-row ${isDrafts ? 'justify-between' : 'justify-end'}  items-center ${filtersVisible && isFilters ? 'mb-2' : 'mb-4'}`}>
                {isSoils && isFilters ? <button className='text-blue-600 w-fit' onClick={() => setFiltersVisible(!filtersVisible)}>
                    {filtersVisible ? t('hide_filters') : t('show_filters')}
                </button> : ''}
                {token && <label htmlFor='draftIsVisible' className={`flex-row cursor-pointer items-center justify-center
                    ${isFilters || !isDrafts ? 'hidden' : 'flex'}`}>
                    <input type="checkbox" id='draftIsVisible'
                        checked={draftIsVisible}
                        onChange={() => setDraftIsVisible(!draftIsVisible)}
                        className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                    <span>{t('grafts_visible')}</span>
                </label>}

                <div className='self-end flex-row items-center justify-center w-[190px]'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' noBold={true} />
                </div>

            </div>
            {
                isSoils && filtersVisible && isFilters ? <ul className='filters-grid z-10 w-full mb-4'>
                    {isAllSoils ? <li key='category'>
                        <Filter name={t('category')} items={CATEGORY_ARRAY}
                            allSelectedItems={selectedCategories}
                            addItem={handleAddCategory}
                            deleteItem={handleDeleteCategorie}
                            resetItems={handleResetCategories} />

                    </li> : ''}
                    {classifications?.map(item => {
                        const isEnglish = locale === 'en';
                        const isTranslationModeValid = item.translationMode === 0 || (isEnglish ? item.translationMode === 1 : item.translationMode === 2);
                        if (isTranslationModeValid) {
                            return (
                                <li key={item.id}>
                                    <Filter isEng={locale === 'en'} itemId={item.id}
                                        name={isEnglish ? item.nameEng : item.nameRu}
                                        items={item.terms}
                                        allSelectedItems={selectedTerms}
                                        addItem={handleAddTerm}
                                        deleteItem={handleDeleteTerm}
                                        resetItems={handleResetTerms}
                                    />
                                </li>
                            );
                        }
                    }
                    )}
                </ul> : ''
            }

            {token && <label htmlFor='draftIsVisible' className={`mb-4 sm:self-end flex-row cursor-pointer
            ${!isFilters || !isDrafts ? 'hidden' : 'flex'}`}>
                <input type="checkbox" id='draftIsVisible'
                    checked={draftIsVisible}
                    onChange={() => setDraftIsVisible(!draftIsVisible)}
                    className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                <span>{t('grafts_visible')}</span>
            </label>}

            <ul className='soils-grid mb-4'>
                {currentItems.map(({ id, photo, translations, dataRu, dataEng }) => <li key={id}>
                    {SoilCard({
                        name: translations?.find(({ isEnglish }) => isEnglish === (locale === 'en'))?.name ||
                            (locale === 'en' ? dataEng.name : locale === 'ru' ? dataRu.name : ''), photo, id
                    })}
                </li>
                )}
            </ul>
            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredSoils}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div >
    )
}
