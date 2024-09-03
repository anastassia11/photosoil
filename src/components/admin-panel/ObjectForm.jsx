'use client'

import { useDispatch, useSelector } from 'react-redux';
import * as Tabs from "@radix-ui/react-tabs";
import Filter from '../soils/Filter'
import { memo, useCallback, useEffect, useState } from 'react';
import { sendPhoto } from '@/api/photo/send_photo';
import { getAuthors } from '@/api/author/get_authors';
import Dropdown from './ui-kit/Dropdown';
import DragAndDrop from './ui-kit/DragAndDrop';
import { deletePhotoById } from '@/api/photo/delete_photo';
import uuid from 'react-uuid';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import { useConstants } from '@/hooks/useConstants';
import modalThunkActions from '@/store/thunks/modalThunk';
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems';
import { getBasePublications } from '@/api/publication/get_base_publications';
import { getBaseSoils } from '@/api/soil/get_base_soils';
import MapSelect from '../map/MapSelect';
import Input from './ui-kit/Input';
import MapInput from './ui-kit/MapInput';
import Textarea from './ui-kit/Textarea';
import PhotoCard from './ui-kit/PhotoCard';
import { getClassifications } from '@/api/classification/get_classifications';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import TextEditor from './TextEditor';
import { setDropdown } from '@/store/slices/generalSlice';

export default function ObjectForm({ id, oldTwoLang, oldIsEng, pathname, type, item, mainObjectPhoto, otherObjectPhoto,
    onItemChange, onMainPhotoChange, onOtherPhotosChange }) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const dropdown = useSelector(state => state.general.dropdown);
    const [classifications, setClassifications] = useState([]);
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

    const currentTransl = object?.translations?.find(({ isEnglish }) => isEnglish === isEng);

    useEffect(() => {
        fetchAuthors();
        fetchPublications()
        if (type === 'soil') {
            fetchClassifications();
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

    const handleOtherPhotoSend = useCallback(async (file, index) => {
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
        }
    }, [])

    const handleMainPhotoSend = useCallback(async (file) => {
        setMainPhoto(prev => ({ ...prev, isLoading: true }));
        const result = await sendPhoto(file);
        if (result.success) {
            setMainPhoto(prev => ({ ...prev, ...result.data }));
            onMainPhotoChange({ ...mainObjectPhoto, ...result.data });
        };
    }, [])

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setObject(prev => {
            const _prev = (name === 'latitude' || name === 'longtitude') ? { ...prev, [name]: value }
                : { ...prev, translations: prev.translations.map(translation => translation.isEnglish === isEng ? { ...translation, [name]: value } : translation) }
            onItemChange(_prev);
            return _prev
        });
    }

    const handleTextContentChange = (isEng, field, html) => {
        setObject(prev => {
            const _prev = {
                ...prev, translations: prev.translations?.map(translation =>
                    translation.isEnglish === isEng ? { ...translation, [field]: html } : translation)
            };
            onItemChange(_prev);
            return (_prev)
        })
    }

    const handleCoordChange = useCallback(({ latitude, longtitude }) => {
        setObject(prev => {
            const _prev = { ...prev, latitude, longtitude };
            onItemChange(_prev);
            return _prev;
        });
    }, [onItemChange])

    const handleCategotyChange = (id) => {
        const updatedObject = { ...object, objectType: Number(id) };
        setObject(updatedObject);
        onItemChange(updatedObject);
    }

    const handleMainPhotoChange = useCallback((e) => {
        const updatedMainPhoto = { ...mainPhoto, [isEng ? 'titleEng' : 'titleRu']: e.target.value };
        setMainPhoto(updatedMainPhoto)
        onMainPhotoChange(updatedMainPhoto);
    }, [])

    const handleOtherPhotosChange = useCallback((e, id) => {
        const updatedOtherPhotos = otherPhotos.map(item =>
            item.id === id
                ? { ...item, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
                : item
        );
        setOtherPhotos(updatedOtherPhotos)
        onOtherPhotosChange(updatedOtherPhotos);
    }, [])

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
        }
    }

    const handleMainPhotoDelete = useCallback(async (id) => {
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
    }, [])

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
        }
    }

    const handleOtherPhotoDelete = useCallback(async (id) => {
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
    }, [])

    const handleAddTerm = useCallback((type, newItem) => {
        setObject(prev => {
            const _prev = { ...prev, [type]: prev[type] ? [...prev[type], newItem] : [newItem] };
            // onItemChange(_prev);
            return _prev
        })
    }, [])

    const handleDeleteTerm = useCallback((type, deletedItem) => {
        setObject(prev => {
            const _prev = { ...prev, [type]: prev[type]?.filter(id => id !== deletedItem) };
            onItemChange(_prev);
            return _prev;
        })
    }, [])

    const handleResetTerms = useCallback((type, deletedItems) => {
        setObject(prev => {
            const _prev = { ...prev, [type]: prev[type].filter(id => !deletedItems.includes(id)) };
            onItemChange(_prev);
            return _prev;
        })
    }, [])

    const addTerm = useCallback((newItem) => handleAddTerm('soilTerms', newItem), [handleAddTerm]);
    const deleteTerm = useCallback((deletedItem) => handleDeleteTerm('soilTerms', deletedItem), [handleDeleteTerm]);
    const resetTerms = useCallback((deletedItems) => handleResetTerms('soilTerms', deletedItems), [handleResetTerms]);

    const addEcosystem = useCallback((newItem) => handleAddTerm('ecoSystems', newItem), [handleAddTerm]);
    const deleteEcosystem = useCallback((deletedItem) => handleDeleteTerm('ecoSystems', deletedItem), [handleDeleteTerm]);
    const resetEcosystems = useCallback((deletedItems) => handleResetTerms('ecoSystems', deletedItems), [handleResetTerms]);

    const addSoil = useCallback((newItem) => handleAddTerm('soilObjects', newItem), [handleAddTerm]);
    const deleteSoil = useCallback((deletedItem) => handleDeleteTerm('soilObjects', deletedItem), [handleDeleteTerm]);
    const resetSoils = useCallback((deletedItems) => handleResetTerms('soilObjects', deletedItems), [handleResetTerms]);

    const addPublication = useCallback((newItem) => handleAddTerm('publications', newItem), [handleAddTerm]);
    const deletePublication = useCallback((deletedItem) => handleDeleteTerm('publications', deletedItem), [handleDeleteTerm]);
    const resetPublications = useCallback((deletedItems) => handleResetTerms('publications', deletedItems), [handleResetTerms]);

    const handleIsExternalChange = (e) => {
        setObject(prev => {
            const _prev = { ...prev, isExternal: e.target.checked };
            onItemChange(_prev);
            return (_prev)
        })
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

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className={`flex flex-col w-full h-fit max-h-full ${pathname !== 'edit' ? 'pb-[200px]' : 'pb-16'}`}>
            <div className='flex flex-col w-full h-full'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-x-4 w-full'>
                    <Tabs.Root defaultValue={false} className="pt-2 md:col-span-2 sticky top-0 z-40  bg-[#f6f7f9]" value={isEng}
                        onValueChange={handleLangChange}>
                        <Tabs.List className="w-full border-b flex md:items-center gap-x-4 overflow-x-auto justify-between md:flex-row flex-col">
                            <div className='flex items-center gap-x-4 overflow-x-auto md:order-1 order-2'>
                                <Tabs.Trigger disabled={!createTwoLang && isEng}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={false}>
                                    <div className="pb-2.5 sm:px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        Русскоязычная версия
                                    </div>
                                </Tabs.Trigger>
                                <Tabs.Trigger disabled={!createTwoLang}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={true}>
                                    <div className="pb-2.5 sm:px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        English version
                                    </div>
                                </Tabs.Trigger>
                            </div>
                            {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang'
                                className={`select-none md:order-2 order-1 pb-4 pr-1 md:pb-2.5 flex flex-row cursor-pointer items-center`}>
                                <input type="checkbox" id='createTwoLang'
                                    checked={createTwoLang}
                                    onChange={handleTwoLangChange}
                                    className="cursor-pointer min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                                <span>{pathname === 'edit' ? `${oldIsEng ? t('add_ru') : t('add_en')}` : t('create_two_lang')}</span>
                            </label>}
                        </Tabs.List>
                    </Tabs.Root>

                    <div className='flex flex-col w-full mt-4'>
                        {Input({
                            label: t('title'),
                            isEng: isEng,
                            name: 'name',
                            value: currentTransl?.name || '',
                            required: true,
                            onChange: handleInputChange
                        })}
                        {type === 'soil' && <div className='mt-3'>
                            <Dropdown dropdown={dropdown}
                                name={t('objectType')} value={object?.objectType ?? null} items={SOIL_ENUM}
                                onCategotyChange={handleCategotyChange} dropdownKey='category' />
                        </div>}

                        <ul className='flex flex-col w-full'>
                            {INFO.map(({ name, title }) => {
                                return <li key={name} className={`mt-3 
                                    ${(name === 'objectType' || name === 'comments') && 'hidden'}`}>
                                    {
                                        name === 'soilFeatures' || name === 'description'
                                            ? Textarea({
                                                name: name,
                                                label: `${title} ${isEng ? '(EN)' : ''}`,
                                                value: currentTransl?.[name] || '',
                                                onChange: handleInputChange,
                                                required: false
                                            })
                                            : Input({
                                                label: title,
                                                isEng: isEng,
                                                name: name,
                                                value: currentTransl?.[name] || '',
                                                required: false,
                                                onChange: handleInputChange
                                            })
                                    }
                                </li>
                            })}

                            {type !== 'soil' ? <>
                                <p className='font-medium mt-2'>{`${t('comments')} ${isEng ? '(EN)' : ''}`}</p>
                                <div className={`${isEng ? 'hidden' : 'block'} w-full relative mt-1 mb-2`}>
                                    <TextEditor dropdown={dropdown} type='comments-ru' content={object?.translations?.find(({ isEnglish }) => !isEnglish)?.comments || ''}
                                        isSoil={true}
                                        setContent={html => handleTextContentChange(false, 'comments', html)} />
                                </div>
                                <div className={`${isEng ? 'block' : 'hidden'} w-full relative mt-1 mb-2`}>
                                    <TextEditor dropdown={dropdown} type='comments-en' content={object?.translations?.find(({ isEnglish }) => isEnglish)?.comments || ''}
                                        isSoil={true}
                                        setContent={html => handleTextContentChange(true, 'comments', html)} />
                                </div>
                            </> : ''}

                            <li key='authors' className={`mt-3 ${object?.isExternal ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Filter dropdown={dropdown}
                                    itemId={`author`} name={t('authors')} items={authors}
                                    type='authors'
                                    allSelectedItems={object?.authors} isEng={isEng}
                                    addItem={newItem => handleAddTerm('authors', newItem)}
                                    deleteItem={deletedItem => handleDeleteTerm('authors', deletedItem)}
                                    resetItems={deletedItems => handleResetTerms('authors', deletedItems)}
                                />
                            </li>
                        </ul>


                    </div>
                    <div className='flex flex-col w-full xl:h-[528px] md:h-[500px] h-[400px] mt-4'>
                        <label className="font-medium">
                            {t('in_map')}
                        </label>
                        <div className='flex flex-row mt-1 mb-2 w-full space-x-3'>
                            {MapInput({
                                name: 'latitude',
                                label: 'Latitude',
                                value: object?.latitude || '',
                                onChange: handleInputChange,
                            })}
                            {MapInput({
                                name: 'longtitude',
                                label: 'Longtitude',
                                value: object?.longtitude || '',
                                onChange: handleInputChange,
                            })}
                        </div>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-1 w-full h-full'>
                            <MapSelect id={id} type={type} latitude={object?.latitude} longtitude={object?.longtitude}
                                onCoordinateChange={handleCoordChange} />
                        </div>
                    </div>


                    <div className='md:col-span-2'>
                        <label htmlFor='isExternal'
                            className={`font-medium select-none mt-3 flex flex-row cursor-pointer items-center`}>
                            <input type="checkbox" id='isExternal'
                                checked={object?.isExternal}
                                onChange={handleIsExternalChange}
                                className="cursor-pointer min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                            <span>{`${t('isExternal')} ${isEng ? '(EN)' : ''}`}</span>
                        </label>

                        <div className={`${isEng ? 'hidden' : 'block'}
                            w-full relative mt-2 duration-300 
                            ${object?.isExternal ? 'visible' : 'invisible opacity-0 max-h-0'}`}>
                            <TextEditor dropdown={dropdown} type='externalSource-ru' content={object?.translations?.find(({ isEnglish }) => !isEnglish)?.externalSource || ''}
                                isSoil={true}
                                setContent={html => handleTextContentChange(false, 'externalSource', html)} />
                        </div>
                        <div className={`${isEng ? 'block' : 'hidden'}
                            w-full relative mt-2 duration-300 
                            ${object?.isExternal ? 'visible' : 'invisible opacity-0 max-h-0'}`}>
                            <TextEditor dropdown={dropdown} type='externalSource-en' content={object?.translations?.find(({ isEnglish }) => isEnglish)?.externalSource || ''}
                                isSoil={true}
                                setContent={html => handleTextContentChange(true, 'externalSource', html)} />
                        </div>

                        {type === 'soil' ? <>
                            <p className='font-medium mt-8'>{`${t('comments')} ${isEng ? '(EN)' : ''}`}</p>
                            <div className={`${isEng ? 'hidden' : 'block'} w-full relative mt-1`}>
                                <TextEditor dropdown={dropdown} type='comments-ru' content={object?.translations?.find(({ isEnglish }) => !isEnglish)?.comments || ''}
                                    isSoil={true}
                                    setContent={html => handleTextContentChange(false, 'comments', html)} />
                            </div>
                            <div className={`${isEng ? 'block' : 'hidden'} w-full relative mt-1`}>
                                <TextEditor dropdown={dropdown} type='comments-en' content={object?.translations?.find(({ isEnglish }) => isEnglish)?.comments || ''}
                                    isSoil={true}
                                    setContent={html => handleTextContentChange(true, 'comments', html)} />
                            </div>
                        </> : ''}

                        <p className='font-medium mt-8'>{t('main_photo')}<span className='text-orange-500'>*</span></p>
                        {mainPhoto.isLoading || mainPhoto.path ?
                            <div className='grid md:grid-cols-2 grid-cols-1 gap-4 mt-1'>
                                <PhotoCard {...mainPhoto} isEng={isEng} onDelete={handleMainPhotoDelete}
                                    onChange={handleMainPhotoChange} />
                            </div>
                            : <div className='md:w-[50%] w-full h-[150px] pr-2 mt-1'>
                                <DragAndDrop id='main-photo' onLoadClick={handleMainPhotoSend} isMultiple={false} accept='img' />
                            </div>}


                        <p className='font-medium mt-8'>{t('other_photos')}</p>
                        {!otherPhotos?.length ?
                            <div className='md:w-[50%] w-full h-[150px] pr-2 mt-1'>
                                <DragAndDrop id='other-photos' onLoadClick={handleOtherPhotoSend} isMultiple={true} accept='img' />
                            </div>
                            :
                            <ul className={`grid md:grid-cols-2 grid-cols-1 gap-4 `}>
                                {otherPhotos.map((otherPhoto, index) => <li key={`otherPhoto-${index}`}>
                                    <PhotoCard {...otherPhoto} isEng={isEng} onDelete={handleOtherPhotoDelete}
                                        onChange={handleOtherPhotosChange} />
                                </li>)}
                                <div key='otherPhoto-dragAndDrop' className='h-[150px]'>
                                    <DragAndDrop id='other-photos' onLoadClick={handleOtherPhotoSend} isMultiple={true} accept='img' />
                                </div>
                            </ul>}


                        {type === 'soil' ? <>
                            <p className='font-medium mt-8'>{t('classifications')}</p>
                            <ul className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full mt-1'>
                                {classifications?.map(item => {
                                    const isVisible = item.translationMode == 0 || (isEng ? (item.translationMode == 1) : (item.translationMode == 2))
                                    if (isVisible) return <li key={`classification-${item.id}`}>
                                        <Filter dropdown={dropdown}
                                            type='classif'
                                            itemId={`classif-${item.id}`} name={isEng ? item.nameEng : item.nameRu}
                                            items={item.terms} isEng={isEng}
                                            allSelectedItems={object?.soilTerms}
                                            addItem={addTerm}
                                            deleteItem={deleteTerm}
                                            resetItems={resetTerms}
                                        />
                                    </li>
                                })}
                            </ul>
                        </> : ''}

                        <p className='font-medium mt-8'>{t('connection')}</p>
                        <div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full mt-1'>
                            {type !== 'ecosystem' && <Filter dropdown={dropdown}
                                name={t('ecosystems')} items={ecosystems}
                                type='ecosystem'
                                allSelectedItems={object?.ecoSystems} isEng={isEng}
                                addItem={addEcosystem}
                                deleteItem={deleteEcosystem}
                                resetItems={resetEcosystems}
                            />}

                            {type !== 'soil' && <Filter dropdown={dropdown}
                                name={t('soils')} items={soils}
                                type='soil'
                                allSelectedItems={object?.soilObjects} isEng={isEng}
                                addItem={addSoil}
                                deleteItem={deleteSoil}
                                resetItems={resetSoils}
                            />}

                            <Filter dropdown={dropdown}
                                name={t('publications')} items={publications}
                                type='publications'
                                allSelectedItems={object?.publications} isEng={isEng}
                                addItem={addPublication}
                                deleteItem={deletePublication}
                                resetItems={resetPublications}
                            />
                        </div>

                        <div className='mt-8 md:w-[50%] w-full md:pr-2 pr-0'>  {
                            Input({
                                label: t('code'),
                                name: 'code',
                                value: currentTransl?.code || '',
                                required: false,
                                onChange: handleInputChange
                            })
                        }
                        </div>
                    </div>
                </div>
            </div>
        </form >
    )
}
