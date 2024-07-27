'use client'

import { useDispatch, useSelector } from 'react-redux';
import * as Tabs from "@radix-ui/react-tabs";
import Zoom from '../map/Zoom'
import Filter from '../soils/Filter'
import { useEffect, useState } from 'react';
import { BASE_SERVER_URL } from '@/utils/constants';
import Image from 'next/image';
import { sendPhoto } from '@/api/photo/send_photo';
import { getAuthors } from '@/api/author/get_authors';
import { getEcosystems } from '@/api/ecosystem/get_ecosystems';
import Dropdown from './Dropdown';
// import DynamicMapSelect from '../map/DynamicMapSelect';
import DragAndDrop from './ui-kit/DragAndDrop';
import { deletePhotoById } from '@/api/photo/delete_photo';
import FullScreen from '../map/FullScreen';
import uuid from 'react-uuid';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import { getPublications } from '@/api/publication/get_publications';
import { Oval } from 'react-loader-spinner';
import { useTranslation } from 'react-i18next';
import { useConstants } from '@/hooks/useConstants';
import modalThunkActions from '@/store/thunks/modalThunk';
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems';
import { getBasePublications } from '@/api/publication/get_base_publications';
import { getBaseSoils } from '@/api/soil/get_base_soils';
import NewMapSelect from '../map/NewMapSelect';

export default function ObjectForm({ oldTwoLang, oldIsEng, pathname, type, item, mainObjectPhoto, otherObjectPhoto, onItemChange, onMainPhotoChange, onOtherPhotosChange }) {
    const dispatch = useDispatch()
    const classifications = useSelector(state => state.data.classifications);
    const { t } = useTranslation();

    const [object, setObject] = useState({});
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const [isEng, setIsEng] = useState(false);
    const [mainPhoto, setMainPhoto] = useState({});
    const [otherPhotos, setOtherPhotos] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [soils, setSoils] = useState([]);
    const [publications, setPublications] = useState([]);
    const { SOIL_INFO, ECOSYSTEM_INFO, SOIL_ENUM } = useConstants();

    const INFO = type === 'soil' ? SOIL_INFO : type === 'ecosystem' ? ECOSYSTEM_INFO : {};

    useEffect(() => {
        fetchAuthors();
        fetchPublications()
        if (type === 'soil') {
            fetchEcosystems();
        } else if (type === 'ecosystem') {
            fetchSoils();
        }
    }, [])

    useEffect(() => {
        if (item) {
            setObject(item);
            setMainPhoto(mainObjectPhoto);
        }
    }, [item])

    useEffect(() => {
        if (mainObjectPhoto) {
            setIsEng(mainObjectPhoto.currentLang === 'eng');
            setCreateTwoLang(mainObjectPhoto.createTwoLang);
            setMainPhoto(mainObjectPhoto);
        }
    }, [mainObjectPhoto])

    useEffect(() => {
        if (otherObjectPhoto) {
            setOtherPhotos(otherObjectPhoto)
        }
    }, [otherObjectPhoto])

    const fetchAuthors = async () => {
        const result = await getAuthors();
        if (result.success) {
            setAuthors(result.data);
        }
    }

    const fetchSoils = async () => {
        const result = await getBaseSoils();
        if (result.success) {
            setSoils(result.data);
        }
    }

    const fetchEcosystems = async () => {
        const result = await getBaseEcosystems();
        if (result.success) {
            setEcosystems(result.data);
        }
    }

    const fetchPublications = async () => {
        const result = await getBasePublications();
        if (result.success) {
            setPublications(result.data);
        }
    }

    const handleOtherPhotoSend = async (file, index) => {
        setOtherPhotos(prev => [...prev, { isLoading: true }]);
        const result = await sendPhoto(file);
        if (result.success) {
            setOtherPhotos(prev => {
                const _prev = prev.map((photo, idx) =>
                    idx === index + otherPhotos.length
                        ? { ...photo, ...result.data, isLoading: false }
                        : photo
                );
                onOtherPhotosChange(_prev);
                return _prev;
            });
            // pathname === 'edit' && setObject(prev => ({ ...prev, objectPhoto: [...prev.objectPhoto, result.data.id] }));
        }
    }

    const handleMainPhotoSend = async (file) => {
        setMainPhoto(prev => ({ ...prev, isLoading: true }));
        const result = await sendPhoto(file);
        if (result.success) {
            setMainPhoto(prev => ({ ...prev, ...result.data }));
            onMainPhotoChange({ ...mainObjectPhoto, ...result.data });
        };
    }

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        const updatedObject = (name === 'code' || name === 'latitude' || name === 'longtitude') ? { ...object, [name]: value }
            : { ...object, translations: object.translations.map(translation => translation.isEnglish === isEng ? { ...translation, [name]: value } : translation) }
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleCoordChange = ({ latitude, longtitude }) => {
        setObject(prev => {
            const _prev = { ...prev, latitude, longtitude };
            onItemChange(_prev);
            return _prev;
        });
    }

    const handleCategotyChange = (id) => {
        const updatedObject = { ...object, objectType: Number(id) };
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleMainPhotoChange = (e) => {
        const updatedMainPhoto = { ...mainPhoto, [isEng ? 'titleEng' : 'titleRu']: e.target.value };
        setMainPhoto(updatedMainPhoto)
        onMainPhotoChange(updatedMainPhoto);
    }

    const handleOtherPhotosChange = (e, id) => {
        const updatedOtherPhotos = otherPhotos.map(item =>
            item.id === id
                ? { ...item, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
                : item
        );
        setOtherPhotos(updatedOtherPhotos)
        onOtherPhotosChange(updatedOtherPhotos);
    }

    const mainPhotoDelete = async (id) => {
        const newId = uuid()
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id)
        }
        if (pathname === 'edit' || result.success) {
            setMainPhoto({});
            onMainPhotoChange({});
            const updatedObject = { ...object, photoId: newId };
            setObject(updatedObject);
            // onItemChange(updatedObject);
        }
    }

    const handleMainPhotoDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await mainPhotoDelete(id);
        }
        dispatch(closeModal());
    }

    const otherPhotoDelete = async (id) => {
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id)
        }
        if (pathname === 'edit' || result.success) {
            const updatedOtherPhotos = otherPhotos.filter(el => el.id !== id);
            setOtherPhotos(updatedOtherPhotos)
            onOtherPhotosChange(updatedOtherPhotos);
            const updatedObject = {
                ...object,
                objectPhoto: updatedOtherPhotos
            };
            setObject(updatedObject);
            // onItemChange(updatedObject);
        }

    }

    const handleOtherPhotoDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await otherPhotoDelete(id);
        }
        dispatch(closeModal());
    }

    const handleAddTerm = (type, newItem) => {
        const updatedObject = { ...object, [type]: object[type] ? [...object[type], newItem] : [newItem] };
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleDeleteTerm = (type, deletedItem) => {
        const updatedObject = { ...object, [type]: object[type]?.filter(id => id !== deletedItem) };
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleResetTerms = (type, deletedItems) => {
        const updatedObject = { ...object, [type]: object[type].filter(id => !deletedItems.includes(id)) };
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleTwoLangChange = (e) => {
        // setCreateTwoLang(e.target.checked);
        const updatedMainPhoto = { ...mainPhoto, createTwoLang: e.target.checked };

        // setMainPhoto(updatedMainPhoto);
        onMainPhotoChange(updatedMainPhoto);
        if (pathname === 'edit') {
            if (e.target.checked) {
                if (object.translations?.length < 2) {
                    const updatedObject = { ...object, translations: [...object.translations, { isEnglish: !isEng }] }
                    setObject(updatedObject);
                    onItemChange(updatedObject);
                }
            } else {
                setIsEng(oldIsEng);
            }
        }
    }

    const handleLangChange = (value) => {
        const updatedMainPhoto = { ...mainPhoto, currentLang: value ? 'eng' : 'ru' };
        setIsEng(value);
        setMainPhoto(updatedMainPhoto);
        onMainPhotoChange(updatedMainPhoto);
    }

    const Input = ({ name, label }) => {
        return <div>
            <label className="font-medium flex flex-row">
                {`${label} ${(name !== 'code' && isEng) ? '(EN) ' : ''}`}<span className={`text-orange-500
                    ${name === 'name' ? 'block' : 'hidden'}`}>*</span>
            </label>
            <input
                value={name === 'code' ? object[name]
                    : object.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || ''}
                onChange={handleInputChange}
                name={name}
                type="text"
                className="h-[40px] bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const MapInput = ({ name, label, id }) => {
        return <input
            value={object?.[name] || ''}
            onChange={handleInputChange}
            name={name}
            type="text"
            placeholder={label}
            id={id}
            className="h-[40px] bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
        />
    }

    const Textarea = ({ name, label }) => {
        return <div className=''>
            <label className="font-medium">
                {`${label} ${isEng ? '(EN)' : ''}`}
            </label>
            <textarea
                value={object.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || ''}
                name={name}
                onChange={handleInputChange}
                type="text"
                className="h-full bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const PhotoCard = ({ id, titleEng, titleRu, path, fileName, onDelete, isMain, isLoading }) => {
        return <div className='flex flex-row space-x-4 h-[150px] mt-1'>
            <div className='bg-black/10 relative flex flex-col justify-center items-center min-w-[150px] aspect-[1/1] rounded-md overflow-hidden
                            shadow-lg'>
                {isLoading ? <Oval
                    height={30}
                    width={30}
                    color="#FFFFFF"
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#FFFFFF"
                    strokeWidth={4}
                    strokeWidthSecondary={4} />
                    : <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id}
                        className='object-cover w-[150px] aspect-[1/1]' />}
                {!isLoading && <p className='overflow-hidden whitespace-nowrap overflow-ellipsis py-1 px-2 text-sm font-medium z-10 absolute bottom-0 backdrop-blur-md bg-black bg-opacity-40 text-white w-full'>
                    {fileName}
                </p>}
                {!isLoading && <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                    onClick={() => onDelete(id)}>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                        <g id="Menu / Close_LG">
                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>}
            </div>

            <div className='w-full flex flex-col justify-between'>
                <textarea
                    value={isEng ? (titleEng || '') : (titleRu || '')}
                    onChange={e => {
                        if (isMain) {
                            handleMainPhotoChange(e)
                        } else handleOtherPhotosChange(e, id)
                    }}
                    type="text"
                    placeholder={`Текст к фото ${isEng ? '(EN)' : ''}`}
                    className="bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md max-h-full"
                />
            </div>
        </div>
    }

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col w-full h-fit">
            <div className='flex flex-col w-full h-full'>
                <div className='grid grid-cols-2 gap-4 w-full'>

                    <Tabs.Root defaultValue={false} className="col-span-2" value={isEng}
                        onValueChange={handleLangChange}>
                        <Tabs.List className="w-full border-b flex items-center gap-x-4 overflow-x-auto justify-between">
                            <div className='flex items-center gap-x-4 overflow-x-auto'>
                                <Tabs.Trigger disabled={!createTwoLang && isEng}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={false}>
                                    <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        Русскоязычная версия
                                    </div>
                                </Tabs.Trigger>
                                <Tabs.Trigger disabled={!createTwoLang}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={true}>
                                    <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        English version
                                    </div>
                                </Tabs.Trigger>
                            </div>
                            {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang' className={`pb-2.5 flex flex-row cursor-pointer items-center`}>
                                <input type="checkbox" id='createTwoLang'
                                    checked={createTwoLang}
                                    onChange={handleTwoLangChange}
                                    className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                                <span>{pathname === 'edit' ? `${oldIsEng ? t('add_ru') : t('add_en')}` : t('create_two_lang')}</span>
                            </label>}
                        </Tabs.List>
                    </Tabs.Root>

                    <div className='flex flex-col w-full'>
                        {Input({ name: 'name', label: t('title') })}
                        {type === 'soil' && <div className='mt-3'>
                            <Dropdown name={t('objectType')} value={object?.objectType ?? null} items={SOIL_ENUM}
                                onCategotyChange={handleCategotyChange} dropdownKey='category' />
                        </div>}

                        <ul className='flex flex-col w-full'>
                            {INFO.map(({ name, title }) => {
                                return <li key={name} className={`mt-3 ${name === 'objectType' && 'hidden'}`}>
                                    {
                                        name === 'soilFeatures' || name === 'description' ? Textarea({ name, label: title }) :
                                            Input({ name, label: title })
                                    }
                                </li>
                            })}
                            <li key='authors' className={`mt-3`}>
                                <Filter name={t('authors')} items={authors}
                                    allSelectedItems={object?.authors} isEng={isEng}
                                    addItem={newItem => handleAddTerm('authors', newItem)}
                                    deleteItem={deletedItem => handleDeleteTerm('authors', deletedItem)}
                                    resetItems={deletedItems => handleResetTerms('authors', deletedItems)}
                                />
                            </li>
                        </ul>
                    </div>
                    <div className='flex flex-col w-full h-[566px] max-h-[566px]'>
                        <label className="font-medium">
                            {t('in_map')}
                        </label>
                        <div className='flex flex-row mt-1 mb-2 w-full space-x-3'>
                            {MapInput({ name: 'latitude', label: 'Latitude', id: "LatitudeDec" })}
                            {MapInput({ name: 'longtitude', label: 'Longtitude', id: "LongtitudeDec" })}
                        </div>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-1 h-full'>
                            {/* <div className='relative w-full h-full '>
                                <DynamicMapSelect />
                                <div className='z-20 absolute top-0 right-0 m-2'>
                                    <FullScreen />
                                </div>
                                <div className='z-20 absolute top-[calc(50%-50px)] right-0 m-2 '>
                                    <Zoom />
                                </div>
                            </div> */}
                            <NewMapSelect type={type} latitude={object?.latitude} longtitude={object?.longtitude}
                                onCoordinateChange={handleCoordChange} />
                        </div>
                    </div>
                </div>
                <p className='font-medium mt-8'>{t('main_photo')}<span className='text-orange-500'>*</span></p>
                {mainPhoto?.path ?
                    <div className='grid grid-cols-2 gap-4 mt-1'>
                        {PhotoCard({ ...mainPhoto, isMain: true, onDelete: handleMainPhotoDelete })}
                    </div>
                    : <div className='w-[50%] h-[150px] pr-2 mt-1'>
                        <DragAndDrop onLoadClick={handleMainPhotoSend} isMultiple={false} accept='img' />
                    </div>}


                <p className='font-medium mt-8'>{t('other_photos')}</p>
                {!otherPhotos?.length ?
                    <div className='w-[50%] h-[150px] pr-2 mt-1'>
                        <DragAndDrop onLoadClick={handleOtherPhotoSend} isMultiple={true} accept='img' />
                    </div>
                    :
                    <ul className={` grid grid-cols-2 gap-4 `}>
                        {otherPhotos.map(photo => <li key={photo.id}>
                            {PhotoCard({ ...photo, isMain: false, onDelete: handleOtherPhotoDelete })}
                        </li>)}
                        <div className='h-[150px]'>
                            <DragAndDrop onLoadClick={handleOtherPhotoSend} isMultiple={true} accept='img' />
                        </div>
                    </ul>}


                {type === 'soil' && <>
                    <p className='font-medium mt-8'>{t('classifications')}</p>
                    <ul className='grid grid-cols-2 gap-4 w-full mt-1'>
                        {classifications?.map(item => {
                            const isVisible = item.translationMode == 0 || (isEng ? (item.translationMode == 1) : (item.translationMode == 2))
                            if (isVisible) return <li key={`classification-${item.id}`}>
                                <Filter name={isEng ? item.nameEng : item.nameRu} items={item.terms} isEng={isEng}
                                    allSelectedItems={object?.soilTerms}
                                    addItem={newItem => handleAddTerm('soilTerms', newItem)}
                                    deleteItem={deletedItem => handleDeleteTerm('soilTerms', deletedItem)}
                                    resetItems={deletedItems => handleResetTerms('soilTerms', deletedItems)}
                                />
                            </li>
                        })}
                    </ul>
                </>}

                <p className='font-medium mt-8'>{t('connection')}</p>
                <div className='grid grid-cols-2 gap-4 w-full mt-1'>
                    {type !== 'ecosystem' && <Filter name={t('ecosystems')} items={ecosystems}
                        type='ecosystem'
                        allSelectedItems={object?.ecoSystems} isEng={isEng}
                        addItem={newItem => handleAddTerm('ecoSystems', newItem)}
                        deleteItem={deletedItem => handleDeleteTerm('ecoSystems', deletedItem)}
                        resetItems={deletedItems => handleResetTerms('ecoSystems', deletedItems)}
                    />}

                    {type !== 'soil' && <Filter name={t('soils')} items={soils}
                        type='soil'
                        allSelectedItems={object?.soilObjects} isEng={isEng}
                        addItem={newItem => handleAddTerm('soilObjects', newItem)}
                        deleteItem={deletedItem => handleDeleteTerm('soilObjects', deletedItem)}
                        resetItems={deletedItems => handleResetTerms('soilObjects', deletedItems)}
                    />}

                    <Filter name={t('publications')} items={publications}
                        type='publications'
                        allSelectedItems={object?.publications} isEng={isEng}
                        addItem={newItem => handleAddTerm('publications', newItem)}
                        deleteItem={deletedItem => handleDeleteTerm('publications', deletedItem)}
                        resetItems={deletedItems => handleResetTerms('publications', deletedItems)}
                    />
                </div>

                <div className='mt-8 w-[50%] pr-2'>  {Input({ name: 'code', label: t('code') })}</div>
            </div>
        </form >
    )
}