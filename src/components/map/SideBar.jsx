"use client"

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Filter from '../soils/Filter';
import { useDispatch, useSelector } from 'react-redux';
import { useConstants } from '@/hooks/useConstants';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { addAuthor, addCategory, addTerm, deleteAuthor, deleteCategory, deleteTerm } from '@/store/slices/dataSlice';
import { getClassifications } from '@/api/classification/get_classifications';
import { getTranslation } from '@/i18n/client';
import MotionWrapper from '../admin-panel/ui-kit/MotionWrapper';
import { getAuthors } from '@/api/author/get_authors';

const SideBar = memo(function SideBar({ sidebarOpen, setSideBarOpen, filterName, setFilterName,
  layersVisible, popupVisible, onVisibleChange, draftIsVisible, setDraftIsVisible }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const didLogRef = useRef(true);

  const [classifications, setClassifications] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [token, setToken] = useState(null);

  const { selectedTerms, selectedCategories, selectedAuthors } = useSelector(state => state.data);
  const { locale } = useParams();
  const { t } = getTranslation(locale);

  const { SOIL_ENUM } = useConstants();
  const SOIL_ENUM_REF = useRef(SOIL_ENUM);

  const CATEGORY_ARRAY = useMemo(() => {
    return Object.entries(SOIL_ENUM_REF.current).map(([key, value]) => ({
      id: Number(key),
      name: value,
    }));
  }, [SOIL_ENUM_REF]);

  useEffect(() => {
    setToken(JSON.parse(localStorage.getItem('tokenData'))?.token);
    setSideBarOpen(window.innerWidth > 640);
    fetchClassifications();
    fetchAuthors();
    if (didLogRef.current) {
      didLogRef.current = false
      const categoriesParam = searchParams.get('categories');
      const termsParam = searchParams.get('terms');
      const authorsParam = searchParams.get('authors');

      categoriesParam && categoriesParam.split(',').forEach((param) => dispatch(addCategory(Number(param))));
      termsParam && termsParam.split(',').forEach((param) => dispatch(addTerm(Number(param))));
      authorsParam && authorsParam.split(',').forEach((param) => dispatch(addAuthor(Number(param))));
    }
  }, [])

  useEffect(() => {
    updateFiltersInHistory();
  }, [selectedCategories, selectedTerms, selectedAuthors])

  useEffect(() => {
    window.innerWidth > 640 && setSideBarOpen(!popupVisible)
  }, [popupVisible])

  const fetchClassifications = async () => {
    const result = await getClassifications();
    if (result.success) {
      setClassifications(result.data);
    }
  }

  const fetchAuthors = async () => {
    const result = await getAuthors();
    if (result.success) {
      setAuthors(result.data);
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

    if (selectedAuthors.length > 0) {
      params.set('authors', selectedAuthors.join(','));
    } else {
      params.delete('authors');
    }
    router.replace(pathname + '?' + params.toString())
  };

  const handleViewSidebar = () => {
    setSideBarOpen(!sidebarOpen);
  }

  const handleVisibleChange = (e) => {
    const { name, checked } = e.target;
    onVisibleChange({ name, checked });
  }

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
  }, [])

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

  const LayerSwitch = ({ title, type }) => {
    return <div className="form-control">
      <label className="flex justify-between cursor-pointer label">
        <span className="label-text">{title}</span>
        <label className="inline-flex items-center cursor-pointer">
          <input
            checked={layersVisible[type]}
            onChange={handleVisibleChange}
            type="checkbox"
            name={type}
            className="sr-only peer toggle layerCheker toggle-primary"
          />
          <div className={`relative w-10 h-[22px] bg-gray-200 rounded-full peer peer-checked:after:translate-x-full 
          rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
          after:absolute after:top-0.5 after:start-[1px] after:bg-white after:border-gray-300 after:border 
          after:rounded-full after:h-[18px] after:w-[18px] after:transition-all 

          ${type === 'soil' ? 'peer-checked:bg-[#993300]/80'
              : type === 'ecosystem' ? 'peer-checked:bg-[#73ac13]/80' : 'peer-checked:bg-[#8b008b]/80'}
          `}></div>
        </label>
      </label>
    </div>
  }

  return (
    <div id='map-sidebar'
      className={`${sidebarOpen ? "left-0 z-30" : "sm:-left-[408px] sm:z-20 z-30 -left-[calc(100%-90px)]"
        } absolute lg:top-0 top-[45px] sm:w-[400px] w-[calc(100%-98px)] sm:max-w-[400px] max-h-[calc(100%-150px)] sm:max-h-[calc(100%-16px)]
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row pb-4`}>
      <div className="relative flex-1 flex flex-col max-w-full">
        <button
          onClick={handleViewSidebar}
          className="absolute -right-[33px] top-0 bg-white w-[25px] h-10 rounded-md shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${sidebarOpen ? "rotate-90" : "-rotate-90"}`}>
            <path d="M15.793 9.4l1.414 1.414L12 16.024l-5.207-5.21L8.207 9.4 12 13.195z"></path>
          </svg>
        </button>


        <div className='sm:px-4 pt-3 px-2'>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-1"
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
              value={filterName}
              onChange={e => setFilterName(e.target.value)}
              type="text"
              placeholder={t('search_code')}
              className="w-full h-[40px] px-8 sm:px-10 border-b rounded-none outline-none bg-white focus:border-blue-600" />

            <button className='absolute right-1 top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 hover:text-zinc-600 duration-300'
              onClick={() => setFilterName('')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className='flex-1 h-full overflow-y-auto scroll sm:px-5 px-3 flex flex-col sm:space-y-3 space-y-1 w-full pb-3'>
          <MotionWrapper className='ml-1'>
            <label htmlFor='draftIsVisible' className={`sm:mt-4 mt-3 flex-row cursor-pointer max-w-fit
            ${!token ? 'hidden h-0 my-0' : 'flex'}`}>
              <input type="checkbox" id='draftIsVisible'
                checked={draftIsVisible}
                onChange={() => setDraftIsVisible(!draftIsVisible)}
                className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
              <span className='select-none'>{t('grafts_visible')}</span>
            </label>
          </MotionWrapper>
          <div className='pb-1.5'>
            <p className='font-medium sm:text-xl text-lg sm:mb-1.5'>
              {t('map_layers')}
            </p>
            <div x-show="show" x-transition className="sm:space-y-2.5 space-y-1 px-1">
              {LayerSwitch({ title: t('soils'), type: 'soil' })}
              {LayerSwitch({ title: t('ecosystems'), type: 'ecosystem' })}
              {LayerSwitch({ title: t('publications'), type: 'publication' })}
            </div>
          </div>

          <div>
            <p className='font-medium sm:text-xl text-lg sm:mb-1.5 '>
              {t('filters')}
            </p>

            {
              <ul className='flex flex-col z-10 max-h-full sm:space-y-2.5 space-y-1 px-1'>
                <li key={'authors'}>
                  <Filter itemId={`author`} name={t('authors')} items={authors}
                    type='authors'
                    isMapFilter={true}
                    allSelectedItems={selectedAuthors}
                    addItem={handleAddAuthor}
                    deleteItem={handleDeleteAuthor}
                    resetItems={handleResetAuthors}
                  />
                </li>
                <li key={'category'}>
                  <Filter name={t('category')} itemId='category' items={CATEGORY_ARRAY}
                    allSelectedItems={selectedCategories}
                    type='category'
                    isMapFilter={true}
                    addItem={handleAddCategory}
                    deleteItem={handleDeleteCategorie}
                    resetItems={handleResetCategories}
                  />
                </li>
                {classifications?.map(item => {
                  const isEnglish = locale === 'en';
                  const isTranslationModeValid = item.translationMode === 0 || (isEnglish ? item.translationMode === 1 : item.translationMode === 2);
                  if (isTranslationModeValid) {
                    return (
                      <li key={item.id}>
                        <Filter isEng={locale === 'en'} itemId={item.id}
                          type='classif'
                          isMapFilter={true}
                          name={isEnglish ? item.nameEng : item.nameRu}
                          items={item.terms}
                          allSelectedItems={selectedTerms}
                          addItem={handleAddTerm}
                          deleteItem={handleDeleteTerm}
                          resetItems={handleResetTerms}
                        />
                      </li>
                    )
                  }
                })}
              </ul>}
          </div>
        </div>
      </div>
    </div>
  );
})
export default SideBar;
