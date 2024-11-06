'use client'

import { deletePhotoById } from '@/api/photo/delete_photo';
import { putPhoto } from '@/api/photo/put_photo';
import { sendPhoto } from '@/api/photo/send_photo';
import ObjectForm from '@/components/admin-panel/ObjectForm';
import DragAndDrop from '@/components/admin-panel/ui-kit/DragAndDrop';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { BASE_SERVER_URL } from '@/utils/constants';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import { Oval } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import uuid from 'react-uuid';

export default function CreateObject({ title, onCreate, type }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [drag, setDrag] = useState(false);
    const [currentForm, setCurrentForm] = useState(null);
    const [formData, setFormData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const handleChange = (e) => {
        e.preventDefault();
        let files = [...e.target.files];
        files.forEach((file, index) => {
            setFormData(prevData => [...prevData, {
                mainPhoto: {
                    isLoading: true,
                },
            }]);
            requestSendPhoto(file, index);
        });
        setCurrentForm(0)
    }

    const handleDragStart = (e) => {
        e.preventDefault();
        setDrag(true);
    }

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDrag(false);
    }

    const handleDrop = (e) => {
        e.preventDefault();
        let files = [...e.dataTransfer.files];
        files.forEach((file, index) => {
            setFormData(prevData => [...prevData, {
                mainPhoto: {
                    isLoading: true,
                },
            }]);
            requestSendPhoto(file, index);
        });
        setCurrentForm(0)
        setDrag(false);
    }

    const handleSendPhoto = (file, index) => {
        setFormData(prevData => [...prevData, {
            mainPhoto: {
                isLoading: true,
            },
        }]);
        requestSendPhoto(file, index + formData.length);
    }

    const requestSendPhoto = async (file, index) => {
        const result = await sendPhoto(file);
        if (result.success) {
            setFormData(prevData =>
                prevData.map((data, idx) =>
                    idx === index
                        ? {
                            ...data,
                            mainPhoto: { ...result.data, isLoading: false },
                        }
                        : data
                ));
        }
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const validateDataArray = (data) => {
        return data.findIndex((item) => {
            if (item.createTwoLang) {
                const valid = item.translations?.every(translation => translation.name.length);
                return !valid || !item.mainPhoto?.path?.length;
            } else {
                const valid = item.translations?.find(translation => translation.isEnglish === item.currentLang);
                return !valid || !valid.name.length || !item.mainPhoto?.path?.length;
            }
        });
    };

    const submitForm = async (formData) => {
        setIsLoading(true);
        try {
            const _creationResults = await Promise.all([
                ...formData.map(async (data, idx) => {
                    const { createTwoLang, currentLang, mainPhoto, objectPhoto } = data;

                    editPhoto(mainPhoto.id, createTwoLang ? { titleEng: mainPhoto.titleEng, titleRu: mainPhoto.titleRu }
                        : (currentLang ? { titleEng: mainPhoto.titleEng } : { titleRu: mainPhoto.titleRu }));
                    objectPhoto.map(photo => editPhoto(photo.id, createTwoLang ? { titleEng: photo.titleEng, titleRu: photo.titleRu }
                        : (currentLang ? { titleEng: photo.titleEng } : { titleRu: photo.titleRu })));

                    const dataForFetch = {
                        ...data,
                        photoId: mainPhoto.id,
                        objectPhoto: objectPhoto.map(({ id }) => id),
                    }
                    const langData = { ...dataForFetch, translations: data.translations.filter(({ isEnglish }) => isEnglish === currentLang) };
                    return await onCreate(createTwoLang ? dataForFetch : langData);
                }),
            ]);
            if (_creationResults.every(result => result.success === true)) {
                router.push(`/admin/${type === 'soil' ? 'objects' : 'ecosystems'}`);
                dispatch(openAlert({ title: t('success'), message: t('created_objects'), type: 'success' }));
            } else {
                const indicesToRemove = _creationResults.reduce((indices, result, index) => {
                    if (!result.success) {
                        indices.push(index);
                        dispatch(openAlert({ title: t('error'), message: t('error_objects'), type: 'error' }));
                    }
                    return indices;
                }, []);
                setFormData(prevData => prevData.filter((data, idx) => indicesToRemove.includes(idx)));
            }
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_objects'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    const handleCreateClick = async () => {
        const newValues = formRef.current.updateState();
        let invalidIndex, updatedFormData;
        setFormData(prevData => {
            updatedFormData = prevData.map((soil, index) => index === currentForm ? newValues : soil);
            invalidIndex = validateDataArray(updatedFormData);
            return updatedFormData;
        });
        if (invalidIndex !== -1) {
            setCurrentForm(invalidIndex)
            await new Promise((resolve) => setTimeout(resolve, 100));
            formRef.current.formCheck();
        } else {
            submitForm(updatedFormData);
        }
    }

    const fetchDeletePhoto = async (id, idx) => {
        const result = await deletePhotoById(id)
        if (result.success) {
            setFormData(prev => prev.filter((item, index) => index !== idx))
            if (currentForm === idx) {
                if (formData.length === 1) {
                    setCurrentForm(null);
                } else {
                    setCurrentForm(currentForm === formData.length - 1 ? idx - 1 : idx);
                }
            } else if (currentForm > idx) {
                setCurrentForm(currentForm - 1)
            }
        }
    }

    const handleSoilDelete = async (e, idx) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_soil'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            if (Number.isInteger(formData[idx].mainPhoto.id)) {
                await fetchDeletePhoto(formData[idx].mainPhoto.id, idx)
            } else {
                setFormData(prev => prev.filter((item, index) => index !== idx))
                if (currentForm === idx) {
                    if (formData.length === 1) {
                        setCurrentForm(null);
                    } else {
                        setCurrentForm(idx);
                    }
                } else if (currentForm > idx) {
                    setCurrentForm(currentForm - 1)
                }
            }
        }
        dispatch(closeModal());
    }

    const handleFormClick = () => {
        const id = uuid();
        setCurrentForm(0);
        setFormData([{ mainPhoto: { id, isLoading: false } }]);
    }

    const selectCurrentForm = (id) => {
        const newValues = formRef.current.updateState();
        setCurrentForm(id);
        setFormData(prevData => prevData.map((soil, index) => index === currentForm ? newValues : soil));
    }

    const PhotoCard = ({ id, path, pathResize, idx, isLoading }) => {
        const translations = formData[idx]?.translations;
        let name = '';
        if (translations) {
            name = locale === 'en'
                ? (translations.find(({ isEnglish }) => isEnglish)?.name || translations.find(({ isEnglish }) => !isEnglish)?.name)
                : (translations.find(({ isEnglish }) => !isEnglish)?.name || translations.find(({ isEnglish }) => isEnglish)?.name);
        }

        return <div className={`aspect-[1/1] relative bg-white rounded-lg border flex flex-row
        duration-300 cursor-pointer hover:shadow-md ${currentForm === idx ? ' ring ring-blue-700 ring-opacity-30 w-full' : 'w-[95%]'}  overflow-hidden`}
            onClick={() => selectCurrentForm(idx)}>
            <div className='flex flex-col items-center w-full h-full overflow-hidden'>
                <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-tr-md rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSoilDelete(e, idx)
                    }} >
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                        <g id="Menu / Close_LG">
                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>
                {isLoading ? <div className='ackdrop-blur-md bg-black/10 flex items-center justify-center w-full h-full'>
                    <Oval
                        height={40}
                        width={40}
                        color="#FFFFFF"
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#FFFFFF"
                        strokeWidth={4}
                        strokeWidthSecondary={4} />
                </div> : (
                    (path || pathResize) ? <>
                        <Image src={`${BASE_SERVER_URL}${pathResize.length ? pathResize : path}`} height={500} width={500} alt={id}
                            className='w-full h-full object-cover bg-black/10' />
                    </> :
                        <div className='ackdrop-blur-md bg-black/10 flex items-center justify-center w-full h-full'>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className='w-full h-full text-white m-10 mb-16'
                                viewBox="0 0 32 32" >
                                <path fill='currentColor' strokeWidth="0.1" d="M30 3.414 28.586 2 2 28.586 3.414 30l2-2H26a2.003 2.003 0 0 0 2-2V5.414ZM26 26H7.414l7.793-7.793 2.379 2.379a2 2 0 0 0 2.828 0L22 19l4 3.997Zm0-5.832-2.586-2.586a2 2 0 0 0-2.828 0L19 19.168l-2.377-2.377L26 7.414ZM6 22v-3l5-4.997 1.373 1.374 1.416-1.416-1.375-1.375a2 2 0 0 0-2.828 0L6 16.172V6h16V4H6a2.002 2.002 0 0 0-2 2v16Z" />
                            </svg>
                        </div>
                )}
                <div className='w-full flex rounded-b-lg text-sm font-medium z-10 absolute
                 bottom-0 max-h-[25%] backdrop-blur-md bg-black bg-opacity-40 text-white px-4 py-2'>
                    <p className='whitespace-nowrap text-ellipsis overflow-hidden'>
                        {name || t('no_name')}
                    </p>
                </div>
            </div>
        </div>
    }

    return (
        <div className="flex flex-col w-full">
            <h1 className='sm:text-2xl text-xl font-semibold h-[40px] flex items-end'>
                {title}
            </h1>
            <div className='relative h-full'>
                {!formData.length ? <>
                    {drag
                        ? <div className={`h-[calc(100vh-200px)] absolute bg-black/45 top-0 w-full rounded-lg border-dashed border-[1.5px]
                border-black/80 items-center justify-center flex z-30`}
                            onDragStart={e => handleDragStart(e)}
                            onDragLeave={e => handleDragLeave(e)}
                            onDragOver={e => handleDragStart(e)}
                            onDrop={e => handleDrop(e)}>
                            <p className='sm:text-2xl text-xl text-white'>
                                {t('release_files')}
                            </p>
                        </div> : ''}
                    <div className='w-full h-full'
                        onDragStart={e => !drag && handleDragStart(e)}
                        onDragLeave={e => !drag && handleDragLeave(e)}
                        onDragOver={e => !drag && handleDragStart(e)}>
                        <div className='flex flex-col w-full items-center pt-12 xl:pt-24'>
                            <p className='md:w-[70%] w-full text-center sm:text-2xl text-xl'>
                                {t('to_create')} {type === 'soil' ? t('soils') : type === 'ecosystem' ? t('ecosystems') : ''}, {t('upload_main')}</p>
                            <label htmlFor='photo_file'
                                className='flex items-center justify-center cursor-pointer mt-4 mb-2 sm:px-8 px-4 w-[190px] sm:w-fit py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600
                sm:text-2xl text-xl'>
                                <input type="file" multiple id='photo_file' className="w-0 h-0" accept="image/*"
                                    onChange={handleChange} />
                                {t('select_files')}
                            </label>
                            <p>
                                {t('drag_files')}
                            </p>
                            <button className='mt-[50px] text-blue-700 hover:underline duration-300'
                                onClick={handleFormClick}>
                                {t('go_form')}
                            </button>
                        </div>
                    </div>
                </> :
                    <div className='flex xl:flex-row flex-col'>
                        <div className='pt-2 flex-1 xl:order-1 order-2 xl:pr-6 xl:border-r'>
                            {currentForm !== null ?
                                <ObjectForm ref={formRef}
                                    type={type}
                                    id={currentForm}
                                    item={formData.find((item, idx) => idx == currentForm)}
                                /> : ""}
                        </div>

                        <div className={`pt-2 xl:mb-0 flex flex-col xl:items-center w-full xl:w-[250px] space-y-2 xl:order-2 order-1 
                            xl:pl-6 xl:sticky xl:top-0 
                            xl:max-h-[calc(100vh-40px)] h-[250px] xl:h-fit`}>
                            <p className="font-medium">
                                {`${type === 'soil' ? t('soils') : type === 'ecosystem' ? t('ecosystems') : ''}`}
                            </p>
                            {formData.length &&
                                <ul className={`h-full w-full flex xl:flex-col flex-row justify-start 
                                    xl:space-y-2 xl:pr-2 pb-2 xl:pb-0 rounded-lg overflow-y-auto overflow-x-auto xl:overflow-x-hidden scroll items-center`}>
                                    {
                                        formData.map(({ mainPhoto }, idx) => <li key={`${type}-${mainPhoto.id || idx}`} className='xl:w-full h-full aspect-square p-[3px] flex flex-col items-center justify-center'>
                                            {PhotoCard({ ...mainPhoto, idx })}
                                        </li>)
                                    }
                                    <div className='xl:min-w-[95%] xl:h-auto h-[95%] p-[3px] flex w-[150px] aspect-square max-w-[150px] xl:w-auto ml-2 xl:ml-0'>
                                        <DragAndDrop id='objects' onLoadClick={handleSendPhoto} isMultiple={true} accept='img' />
                                    </div>
                                </ul>
                            }
                            <button
                                type='submit'
                                onClick={handleCreateClick}
                                disabled={isLoading}
                                className="self-end min-h-[40px] w-full flex items-center justify-center px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 disabled:bg-blue-600/70 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 align-bottom">
                                {isLoading ?
                                    <Oval
                                        height={20}
                                        width={20}
                                        color="#FFFFFF"
                                        visible={true}
                                        ariaLabel='oval-loading'
                                        secondaryColor="#FFFFFF"
                                        strokeWidth={4}
                                        strokeWidthSecondary={4} />
                                    : t('create_objects')}
                            </button>
                        </div>
                    </div>}
            </div>
        </div>
    )
}
