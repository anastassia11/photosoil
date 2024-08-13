import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
import SoilsLoader from '../content-loaders/SoilsLoader'
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper'

export default function Soils({ _soils, getItems, isAllSoils, isFilters, type }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = useTranslation();

    const didLogRef = useRef(true);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { selectedTerms, selectedCategories } = useSelector(state => state.data);

    const [classifications, setClassifications] = useState([]);
    const [soils, setSoils] = useState([]);

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
    const CATEGORY_ARRAY = Object.entries(SOIL_ENUM).map(([key, value]) => ({
        id: Number(key),
        name: value,
    }));
    const _isEng = locale === 'en';

    const isSoils = type === 'soils' || type === 'profiles' ||
        type === 'morphological' || type === 'dynamics'

    useEffect(() => {
        setFiltersVisible(window.innerWidth > 640);
        setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
        fetchClassifications();
        if (_soils) {
            setSoils(_soils);
            setIsLoading(prev => ({ ...prev, items: false }));
        } else fetchItems();

        if (didLogRef.current) {
            didLogRef.current = false
            const categoriesParam = searchParams.get('categories');
            const termsParam = searchParams.get('terms');

            categoriesParam && categoriesParam.split(',').forEach((param) => dispatch(addCategory(Number(param))));
            termsParam && termsParam.split(',').forEach((param) => dispatch(addTerm(Number(param))));
        }
    }, [])

    useEffect(() => {
        soils?.length && setFilteredSoils(prev => soils.filter(soil =>
            (draftIsVisible ? true : soil.translations?.find(transl => transl.isEnglish === _isEng)?.isVisible) &&
            soil.translations?.find(transl => transl.isEnglish === _isEng)?.name.toLowerCase().includes(filterName.toLowerCase())
            && (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm))))
            .sort((a, b) => {
                const dateA = new Date(a.createdDate);
                const dateB = new Date(b.createdDate);
                return dateB.getTime() - dateA.getTime();
            })
        )
    }, [filterName, selectedCategories, selectedTerms, soils, draftIsVisible])

    useEffect(() => {
        updateFiltersInHistory();
    }, [selectedCategories, selectedTerms])

    const fetchClassifications = async () => {
        const result = await getClassifications();
        if (result.success) {
            setClassifications(result.data);
        }
        setIsLoading(prev => ({ ...prev, classifications: false }))
    }

    const fetchItems = async () => {
        const result = await getItems();
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

    const SoilCard = ({ photo, name, id }) => {
        return <Link href={`/${type}/${id}`}
            className='relative aspect-[2/3] overflow-hidden transition-all
    rounded-md  hover:ring ring-blue-700 ring-opacity-30 hover:scale-[1.006] flex flex-col  duration-300 cursor-pointer'>
            <div className='h-[100%] w-full overflow-hidden opacity-80'>
                <Image priority src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='blur-sm w-full h-full object-cover scale-150' />
            </div>

            <div className='h-[77%] absolute top-0 w-full flex'>
                <Image priority src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='m-auto w-full h-full object-contain self-start' />
            </div>
            <div className='overflow-hidden rounded-b-md flex items-start p-4 text-sm font-medium z-10 absolute bottom-0 h-[24%] backdrop-blur-md bg-black/40 text-white w-full'>
                <p className='max-h-full overflow-hidden line-clamp-5'>
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
                        placeholder={`${isSoils ? t('search_code') :
                            type === 'ecosystems' ? t('search_title') :
                                t('search_name')}`}
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className={`flex flex-row w-full items-center ${isSoils && isFilters ? 'justify-between' : 'justify-end'}`}>
                {isSoils && isFilters ? <button className='text-blue-600 w-fit' onClick={() => setFiltersVisible(!filtersVisible)}>
                    {filtersVisible ? t('hide_filters') : t('show_filters')}
                </button> : ''}

                {/* <MotionWrapper>
                    <label htmlFor='draftIsVisible' className={`flex-row cursor-pointer items-center justify-center max-w-fit
                    ${isFilters || !token ? 'hidden' : 'flex'}`}>
                        <input type="checkbox" id='draftIsVisible'
                            checked={draftIsVisible}
                            onChange={() => setDraftIsVisible(!draftIsVisible)}
                            className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                        <span className='select-none'>{t('grafts_visible')}</span>
                    </label>
                </MotionWrapper> */}

                <div className='self-end flex-row items-center justify-center w-[190px]'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' noBold={true} />
                </div>

            </div>
            {
                isSoils && filtersVisible && isFilters ? <ul className='filters-grid z-10 w-full mt-4'>
                    <>
                        {isLoading?.classifications ? Array(8).fill('').map((item, idx) => <li key={idx}>
                            <SoilsLoader className='w-full h-[40px]' />
                        </li>)
                            : <>
                                {isAllSoils ? <li key='category'>
                                    <MotionWrapper>
                                        <Filter name={t('category')} items={CATEGORY_ARRAY}
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
                                                    <Filter isEng={locale === 'en'} itemId={item.id}
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
                    <SoilsLoader className='aspect-[2/3]' />
                </li>)
                    : <>
                        {soils.length && filteredSoils.length ? currentItems.map(({ id, photo, translations, dataRu, dataEng }) => <li key={id}>
                            <MotionWrapper>
                                {SoilCard({
                                    name: translations?.find(({ isEnglish }) => isEnglish === (locale === 'en'))?.name ||
                                        (locale === 'en' ? dataEng.name : locale === 'ru' ? dataRu.name : ''), photo, id
                                })}
                            </MotionWrapper>
                        </li>) : <MotionWrapper className='col-span-full'>
                            <p className='text-gray-500 mt-6 col-span-full'>
                                {t('no_objects')}
                            </p>
                        </MotionWrapper>}
                    </>}
            </ul>
            <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredSoils}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
        </div >
    )
}
