"use client";

import React, { useEffect, useState } from "react";
import Filter from '../soils/Filter';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useConstants } from '@/hooks/useConstants';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { addCategory, addTerm, deleteCategory, deleteTerm } from '@/store/slices/dataSlice';

export default function SideBar({ popupVisible, onVisibleChange, onLocationHandler }) {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSideBarOpen] = useState(true);
  const [layersVisible, setLayersVisible] = useState({
    soil: true,
    ecosystem: true,
    publication: true,
  })
  const [location, setLocation] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const [searchTitle, setSearchTitle] = useState('');
  const { selectedTerms, selectedCategories, classifications } = useSelector(state => state.data);
  const { locale } = useParams();
  const { t } = useTranslation();
  const { SOIL_ENUM } = useConstants();
  const CATEGORY_ARRAY = Object.entries(SOIL_ENUM).map(([key, value]) => ({
    id: Number(key),
    name: value,
  }));

  useEffect(() => {
    updateFiltersInHistory();
  }, [selectedCategories, selectedTerms])

  useEffect(() => {
    setSideBarOpen(!popupVisible)
  }, [popupVisible])

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

  const handleViewSidebar = () => {
    setSideBarOpen(!sidebarOpen);
  };

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
  };

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
  };

  const handleVisibleChange = (e) => {
    const { name, checked } = e.target;
    setLayersVisible(prev => ({ ...prev, [name]: checked }));
    onVisibleChange({ name, checked });
  }

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
          ${type === 'soil' ? 'peer-checked:bg-[#3b82f6]'
              : type === 'ecosystem' ? 'peer-checked:bg-[#19aa1e]' : 'peer-checked:bg-[#8b5cf6]'}
          `}></div>
        </label>
      </label>
    </div>
  }

  return (
    <div id='map-sidebar'
      className={`${sidebarOpen ? "left-0" : "-left-[408px]"
        } z-20 absolute top-0 w-[400px] max-w-[400px] max-h-[calc(100%-16px)] 
        shadow-lg bg-white duration-300 rounded-lg m-2 flex flex-row pb-4`}>
      <div className="relative flex-1 flex flex-col max-w-full">
        <button
          onClick={handleViewSidebar}
          className="absolute -right-[30px] top-0 bg-white w-6 h-10 rounded-md shadow-md">
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


        <div className='px-4 pt-3'>
          <div className="relative">
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
              placeholder="Поиск по названию региона"
              className="w-full py-2 px-12 border rounded-lg outline-none bg-white focus:border-blue-600" />

            <button className='absolute right-3 top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 hover:text-zinc-600 duration-300'
              onClick={() => setSearchTitle('')}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {searchTitle !== '' ? <div className="absolute top-[54px] z-50 dropdown bg-white w-full min-h-[calc(100%-38px)] 
        max-h-screen overflow-y-auto
        rounded-md shadow-md">
          <ul className="dropdown-menu space-y-1 mt-4">
            {location.map((item) => (
              <li key={item.id} className="cursor-pointer duration-300 hover:bg-zinc-100 px-4 py-2" onClick={() => onLocationHandler(item)}>
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

        <div className='flex-1 h-full overflow-y-auto scroll px-5 flex flex-col space-y-3 w-full pb-3'>
          <div className=''>
            <p className='font-medium text-xl mt-3 mb-1.5'>
              Слои карты
            </p>
            <div x-show="show" x-transition className="space-y-2.5 px-1">
              {LayerSwitch({ title: t('soils'), type: 'soil' })}
              {LayerSwitch({ title: t('ecosystems'), type: 'ecosystem' })}
              {LayerSwitch({ title: t('publications'), type: 'publication' })}
            </div>
          </div>

          <div>
            <p className='font-medium text-xl mb-1.5'>
              Фильтры
            </p>

            {
              <ul className='flex flex-col z-10 max-h-full space-y-2.5 px-1'>
                <li key={'category'}>
                  <Filter name={t('category')} itemId='category' items={CATEGORY_ARRAY}
                    allSelectedItems={selectedCategories}
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
}
