'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Filter from './Filter'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BASE_SERVER_URL, PAGINATION_OPTIONS } from '@/utils/constants'
import { addAuthor, addCategory, addTerm, deleteAuthor, deleteCategory, deleteTerm, resetAuthor, resetCategory, resetTerm } from '@/store/slices/dataSlice'
import Pagination from '../Pagination'
import Dropdown from '../admin-panel/ui-kit/Dropdown'
import { useConstants } from '@/hooks/useConstants'
import { getClassifications } from '@/api/classification/get_classifications'
import Loader from '../Loader'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'
import { getTranslation } from '@/i18n/client'
import { getEcosystems } from '@/api/ecosystem/get_ecosystems'
import { getSoils } from '@/api/soil/get_soils'
import { getAuthors } from '@/api/author/get_authors'

export default function Soils({ _soils, isAllSoils, isFilters, type }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const didLogRef = useRef(true);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdown = useSelector(state => state.general.dropdown);

    const { selectedTerms, selectedCategories, selectedAuthors } = useSelector(state => state.data);

    const [classifications, setClassifications] = useState([]);
    const [soils, setSoils] = useState([]);
    const [authors, setAuthors] = useState([]);

    const [filterName, setFilterName] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(true);
    const [filteredSoils, setFilteredSoils] = useState([]);

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);

    const [isLoading, setIsLoading] = useState({
        items: true,
        classifications: true,
    });

    const [draftIsVisible, setDraftIsVisible] = useState(false);
    const [token, setToken] = useState(null);

    const { SOIL_ENUM } = useConstants();
    const SOIL_ENUM_REF = useRef(SOIL_ENUM);

    const CATEGORY_ARRAY = useMemo(() => {
        return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
            id: Number(key),
            name: value,
        }));
    }, [SOIL_ENUM_REF]);

    const _isEng = locale === 'en';

    const isSoils = type === 'soils' || type === 'profiles' ||
        type === 'morphological' || type === 'dynamics'

    useEffect(() => {
        setFiltersVisible(window.innerWidth > 640 || type === 'ecosystem');
        setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
        isSoils && fetchClassifications();
        fetchAuthors();
        if (_soils) {
            setSoils(_soils);
            setIsLoading(prev => ({ ...prev, items: false }));
        } else fetchItems();

        // if (didLogRef.current && isFilters) {
        //     didLogRef.current = false
        //     const categoriesParam = searchParams.get('categories');
        //     const termsParam = searchParams.get('terms');
        //     const authorsParam = searchParams.get('authors');

        //     categoriesParam && categoriesParam.split(',').forEach((param) => dispatch(addCategory(Number(param))));
        //     termsParam && termsParam.split(',').forEach((param) => dispatch(addTerm(Number(param))));
        //     authorsParam && authorsParam.split(',').forEach((param) => dispatch(addAuthor(Number(param))));
        // }
    }, [])

    useEffect(() => {
        soils?.length && setFilteredSoils(prev => soils.filter(soil =>
            (draftIsVisible ? true : soil.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible) &&
            (soil.translations?.find(transl => transl.isEnglish === _isEng)?.name.toLowerCase().includes(filterName.toLowerCase())
                || soil.translations?.find(transl => transl.isEnglish === _isEng)?.code?.toLowerCase().includes(filterName.toLowerCase())) &&
            (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedAuthors.length === 0 || selectedAuthors.some(selectedAuthor => soil.authors?.some(author => author === selectedAuthor))) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm))))
            .sort((a, b) => {
                const dateA = new Date(a.createdDate);
                const dateB = new Date(b.createdDate);
                return dateB.getTime() - dateA.getTime();
            })
        )
    }, [filterName, selectedCategories, selectedTerms, selectedAuthors, soils, draftIsVisible])

    // useEffect(() => {
    //     isFilters && updateFiltersInHistory();
    // }, [selectedCategories, selectedTerms, selectedAuthors])

    const fetchClassifications = async () => {
        const result = await getClassifications();
        if (result.success) {
            setClassifications(result.data);
        }
        setIsLoading(prev => ({ ...prev, classifications: false }))
    }

    const fetchAuthors = async () => {
        const result = await getAuthors();
        if (result.success) {
            setAuthors(result.data);
        }
    }

    const fetchItems = async () => {
        const result = type === 'ecosystems' ? await getEcosystems() : await getSoils();
        if (result.success) {
            const data = result.data;
            const items =
                type === 'profiles' ? data.filter(soil => soil.objectType === 1) :
                    type === 'dynamics' ? data.filter(soil => soil.objectType === 0) :
                        type === 'morphological' ? data.filter(soil => soil.objectType === 2) : data;
            setSoils(items);
        }
        setIsLoading(prev => ({ ...prev, items: false }))
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

        if (selectedAuthors.length > 0) {
            params.set('authors', selectedAuthors.join(','));
        } else {
            params.delete('authors');
        }

        router.replace(pathname + '?' + params.toString())
    };

    const handleAddCategory = useCallback((newItem) => {
        dispatch(addCategory(newItem))
    }, [dispatch])

    const handleDeleteCategorie = useCallback((newItem) => {
        dispatch(deleteCategory(newItem))
    }, [dispatch])

    const handleResetCategories = useCallback((deletedItems) => {
        for (let item of deletedItems) {
            dispatch(deleteCategory(item))
        }
    }, [dispatch])

    const handleAddTerm = useCallback((newItem) => {
        dispatch(addTerm(newItem))
    }, [dispatch])

    const handleDeleteTerm = useCallback((deletedItem) => {
        dispatch(deleteTerm(deletedItem))
    }, [dispatch])

    const handleResetTerms = useCallback((deletedItems) => {
        for (let item of deletedItems) {
            dispatch(deleteTerm(item))
        }
    }, [dispatch])

    const handleAddAuthor = useCallback((newItem) => {
        dispatch(addAuthor(newItem))
    }, [dispatch])

    const handleDeleteAuthor = useCallback((deletedItem) => {
        dispatch(deleteAuthor(deletedItem))
    }, [dispatch])

    const handleResetAuthors = useCallback((deletedItems) => {
        for (let item of deletedItems) {
            dispatch(deleteAuthor(item))
        }
    }, [dispatch])

    const SoilCard = ({ photo, name, id }) => {
        return <Link href={{
            pathname: `/${locale}/${type}/${id}`,
            query: {},
        }}
            prefetch={false}
            className='relative aspect-[2/3] overflow-hidden transition-all
    rounded-md  hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] flex flex-col  duration-300 cursor-pointer'>
            <div className='h-[100%] w-full overflow-hidden opacity-80'>
                <Image priority src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='blur-sm w-full h-full object-cover scale-150' />
            </div>

            <div className='h-[77%] absolute top-0 w-full flex'>
                <Image priority src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='m-auto w-full h-full object-contain self-start' />
            </div>
            <div className='rounded-b-md flex p-4 items-start text-sm font-medium z-10 absolute bottom-0 h-[24%] backdrop-blur-md bg-black/40 text-white w-full'>
                <p className='max-h-full overflow-hidden max-w-full'>
                    {name}
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
                        placeholder={`${isSoils || type === 'ecosystems' ? t('search_code') :
                            t('search_name')}`}
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className={`flex flex-row w-full items-center ${isSoils && isFilters ? 'justify-between' : 'justify-end'}`}>
                {isSoils && isFilters ? <button className='text-blue-600 w-fit' onClick={() => setFiltersVisible(!filtersVisible)}>
                    {filtersVisible ? t('hide_filters') : t('show_filters')}
                </button> : ''}
                <div className='self-end flex-row items-center justify-center w-[190px]'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' noBold={true} />
                </div>
            </div>
            {
                filtersVisible && isFilters ? <ul className='filters-grid z-10 w-full mt-4'>
                    <>
                        {isLoading?.classifications && type !== 'ecosystems' ? Array(8).fill('').map((item, idx) => <li key={idx}>
                            <Loader className='w-full h-[40px]' />
                        </li>)
                            : <>
                                <MotionWrapper>
                                    <li key={'authors'}>
                                        <Filter dropdown={dropdown}
                                            itemId={`author`} name={t('authors')} items={authors}
                                            type='authors'
                                            allSelectedItems={selectedAuthors}
                                            addItem={handleAddAuthor}
                                            deleteItem={handleDeleteAuthor}
                                            resetItems={handleResetAuthors}
                                        />
                                    </li>
                                </MotionWrapper>
                                {isAllSoils ? <li key='category'>
                                    <MotionWrapper>
                                        <Filter dropdown={dropdown}
                                            name={t('category')} items={CATEGORY_ARRAY}
                                            type='category'
                                            allSelectedItems={selectedCategories}
                                            addItem={handleAddCategory}
                                            deleteItem={handleDeleteCategorie}
                                            resetItems={handleResetCategories} />
                                    </MotionWrapper>
                                </li> : ''}
                                {classifications?.map(item => {
                                    const isEnglish = locale === 'en';
                                    const isTranslationModeValid = item.translationMode === 0 || (isEnglish ? item.translationMode === 1 : item.translationMode === 2);
                                    if (isTranslationModeValid) {
                                        return (
                                            <li key={item.id}>
                                                <MotionWrapper>
                                                    <Filter dropdown={dropdown}
                                                        isEng={locale === 'en'} itemId={item.id}
                                                        type='classif'
                                                        name={isEnglish ? item.nameEng : item.nameRu}
                                                        items={item.terms}
                                                        allSelectedItems={selectedTerms}
                                                        addItem={handleAddTerm}
                                                        deleteItem={handleDeleteTerm}
                                                        resetItems={handleResetTerms}
                                                    />
                                                </MotionWrapper>
                                            </li>
                                        );
                                    }
                                })}
                            </>
                        }
                    </>
                </ul> : ''
            }

            <MotionWrapper>
                <label htmlFor='draftIsVisible' className={`my-4 sm:self-end flex-row cursor-pointer max-w-fit
            ${!token ? 'hidden' : 'flex'}`}>
                    <input type="checkbox" id='draftIsVisible'
                        checked={draftIsVisible}
                        onChange={() => setDraftIsVisible(!draftIsVisible)}
                        className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                    <span className='select-none'>{t('grafts_visible')}</span>
                </label>
            </MotionWrapper>

            <ul className='soils-grid my-4'>
                {isLoading?.items ? Array(8).fill('').map((item, idx) => <li key={idx}>
                    <Loader className='aspect-[2/3]' />
                </li>)
                    : <>
                        {soils.length && filteredSoils.length ? currentItems.map(({ id, photo, translations, dataRu, dataEng }) => <li key={id}>
                            <MotionWrapper>
                                <SoilCard id={id}
                                    photo={photo}
                                    name={translations?.find(({ isEnglish }) => isEnglish === (locale === 'en'))?.name ||
                                        (locale === 'en' ? dataEng.name : locale === 'ru' ? dataRu.name : '')} />
                            </MotionWrapper>
                        </li>) : <MotionWrapper className='col-span-full'>
                            <p className='text-gray-500 mt-6 col-span-full'>
                                {t('no_objects')}
                            </p>
                        </MotionWrapper>}
                    </>}
            </ul>
            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredSoils}
                updateCurrentItems={setCurrentItems} />
        </div >
    )
}
