import { getclassifications } from '@/api/get_classifications'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import Filter from './Filter'
import { useDispatch, useSelector } from 'react-redux'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { BASE_SERVER_URL } from '@/utils/constants'
import { addCategory, addTerm, setCategories, setTerms } from '@/store/slices/dataSlice'
import Pagination from '../Pagination'

export default function Soils({ soils, isAllSoils }) {
    const dispatch = useDispatch();

    const didLogRef = useRef(true)
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { selectedTerms, selectedCategories, classifications } = useSelector(state => state.data);

    const [filterName, setFilterName] = useState('');
    const [filtersVisible, setFiltersVisible] = useState(true);
    const [filteredSoils, setFilteredSoils] = useState([]);

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const CATEGORY_FILTER = {
        id: 'category',
        name: 'Категория',
        terms: [
            {
                id: 0,
                name: 'Динамика почв'
            },
            {
                id: 1,
                name: 'Почвенные профили'
            },
            {
                id: 2,
                name: 'Почвенные морфологические элементы'
            }
        ]
    }

    const OPTIONS = ['3', '10', '20', '30', '40', '50']

    useEffect(() => {
        setFilteredSoils(prev => soils.filter(soil =>
            soil.name.toLowerCase().includes(filterName.toLowerCase()) &&
            (selectedCategories.length === 0 || selectedCategories.includes(soil.objectType)) &&
            (selectedTerms.length === 0 || selectedTerms.some(selectedTerm => soil.terms.some(term => term === selectedTerm)))
        ))
    }, [filterName, selectedCategories, selectedTerms, soils])

    useEffect(() => {
        console.log(filteredSoils)
    }, [filteredSoils])

    useEffect(() => {
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


    const handleCategoryChange = (newData) => {
        dispatch(setCategories(newData))
    }

    const handleTermsChange = (newData) => {
        dispatch(setTerms(newData))
    }

    const SoilCard = ({ photo, name, id }) => {
        console.log(name, photo.path)
        return <Link href={`${pathname}/${id}`}
            onClick={() => router.push(id)}
            className='relative aspect-[2/3] overflow-hidden transition-all
    bg-white rounded-md border border-zinc-400 flex flex-col hover:border-blue-600 duration-300 cursor-pointer'>
            <div className='h-[100%] w-full overflow-hidden '
                style={{
                    backgroundImage: `url("${BASE_SERVER_URL}${photo.path}")`,
                    backgroundSize: '200%',
                    backgroundPosition: 'center',
                    filter: 'blur(7px)',
                }}>

            </div>
            <div className='h-[80%] absolute top-0 w-full flex'>
                <Image src={`${BASE_SERVER_URL}${photo.path}`} width={500} height={500} alt='soil' className='m-auto w-full h-full object-contain self-start' />
            </div>
            <p className='p-4 text-sm font-medium z-10 absolute bottom-0 h-1/5 backdrop-blur-md bg-black bg-opacity-40 text-white w-full'>
                {name}
            </p>
        </Link>
    }

    useEffect(() => {
        console.log(currentItems)
    }, [currentItems])

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
                        placeholder="Найти по коду или названию"
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
                <button className="w-[200px] justify-center py-2 font-medium text-center text-white transition-all duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-600 flex flex-row items-center space-x-2">
                    Найти
                </button>
            </div>
            <div className={`flex flex-row justify-between items-center ${filtersVisible ? 'mb-2' : 'mb-4'}`}>
                <button className='text-blue-600 w-fit' onClick={() => setFiltersVisible(!filtersVisible)}>
                    {filtersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
                <div>
                    На странице
                    <select value={itemsPerPage}
                        onChange={e => setItemsPerPage(e.target.value)}
                        className="ml-2 p-0 px-2 h-8 focus:outline-[0] border rounded-md outline-none">
                        {OPTIONS.map((item) => <option value={item} key={item}
                            className=''>{item}</option>)}
                    </select >
                </div>

            </div>
            {
                filtersVisible ? <ul className='filters-grid z-10 w-full mb-4'>
                    {isAllSoils ? <li key={CATEGORY_FILTER.id}>
                        <Filter name={CATEGORY_FILTER.name} items={CATEGORY_FILTER.terms}
                            allSelectedItems={selectedCategories}
                            onChange={(newData) => handleCategoryChange(newData)} />

                    </li> : ''}
                    {classifications.map(item => <li key={item.id}>
                        <Filter name={item.name} items={item.terms}
                            allSelectedItems={selectedTerms}
                            onChange={(newData) => handleTermsChange(newData)} />
                    </li>
                    )}
                </ul> : ''
            }
            <ul className='soils-grid mb-4'>
                {currentItems.map(({ photo, name, id }) => <li key={id}>
                    {SoilCard({ photo, name, id })}
                </li>)}
            </ul>

            <Pagination itemsPerPage={itemsPerPage} items={filteredSoils}
                updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />

        </div >
    )
}
