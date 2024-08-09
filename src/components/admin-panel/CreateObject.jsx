'use client'

import { deletePhotoById } from '@/api/photo/delete_photo';
import { putPhoto } from '@/api/photo/put_photo';
import { sendPhoto } from '@/api/photo/send_photo';
import ObjectForm from '@/components/admin-panel/ObjectForm';
import DragAndDrop from '@/components/admin-panel/ui-kit/DragAndDrop';
import { openAlert } from '@/store/slices/alertSlice';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { BASE_SERVER_URL } from '@/utils/constants';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Oval } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import uuid from 'react-uuid';

export default function CreateObject({ title, onCreate, type }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const [drag, setDrag] = useState(false);

    const [photos, setPhotos] = useState([]);
    const [otherPhotos, setOtherPhotos] = useState([]);

    const [currentForm, setCurrentForm] = useState(null);

    const [formData, setFormData] = useState([]);
    const [rightBlockHeight, setRightBlockHeight] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);
    const { t } = useTranslation();
    const [creationResults, setCreationResults] = useState([]);

    useEffect(() => {
        if (formRef.current) {
            setRightBlockHeight(formRef.current.clientHeight)
        }
    }, [photos.length, formData]);

    const handleChange = (e) => {
        e.preventDefault();
        let files = [...e.target.files];
        files.forEach((file, index) => {
            setPhotos(prev => [...prev, { createTwoLang: false, currentLang: 'ru', isLoading: true }]);
            setFormData(prevData => [...prevData, { translations: [{ isEnglish: true }, { isEnglish: false }] }]);
            setOtherPhotos(prev => [...prev, []]);
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
            setPhotos(prev => [...prev, { createTwoLang: false, currentLang: 'ru', isLoading: true }]);
            setFormData(prevData => [...prevData, { translations: [{ isEnglish: true }, { isEnglish: false }] }]);
            setOtherPhotos(prev => [...prev, []]);
            requestSendPhoto(file, index);
        });
        setCurrentForm(0)
        setDrag(false);
    }

    const handleSendPhoto = (file, index) => {
        setPhotos(prev => [...prev, { createTwoLang: false, currentLang: 'ru', isLoading: true }]);
        setFormData(prevData => [...prevData, { translations: [{ isEnglish: true }, { isEnglish: false }] }]);
        setOtherPhotos(prev => [...prev, []]);
        requestSendPhoto(file, index + photos.length);
    }

    const requestSendPhoto = async (file, index) => {
        const result = await sendPhoto(file);
        if (result.success) {
            setPhotos(prev =>
                prev.map((photo, idx) =>
                    idx === index
                        ? { ...photo, ...result.data, isLoading: false }
                        : photo
                ));
            setFormData(prevData =>
                prevData.map((data, idx) =>
                    idx === index
                        ? { ...data, photoId: result.data.id }
                        : data
                ));
        }
    }

    const handleMainPhotoChange = (newPhoto) => {
        const updatedPhotos = currentForm !== null ? photos.map((photo, index) => index === currentForm ? newPhoto : photo) : [...photos, { ...newPhoto }];
        setPhotos(updatedPhotos);
        setFormData(prevData => prevData.map((soil, index) => index === currentForm ? { ...soil, photoId: newPhoto.id } : soil));
    }

    const handleOtherPhotosChange = (data) => {
        const updatedOtherPhotos = otherPhotos.map((item, index) => index === currentForm ? data : item);
        setOtherPhotos(updatedOtherPhotos);
        setFormData(prevData => prevData.map((soil, index) => index === currentForm ? { ...soil, objectPhoto: updatedOtherPhotos[index].map(({ id }) => id) } : soil));
    }

    const handleDataChange = (newData) => {
        setFormData(prev => prev.map((data, index) => index === currentForm ? newData : data));
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const handleCreateClick = async () => {
        setIsLoading(true);
        try {
            const _creationResults = await Promise.all([
                ...formData.map(async (data, idx) => {
                    const { createTwoLang, currentLang } = photos[idx];
                    const isEng = currentLang === 'eng';
                    const newData = { ...data, translations: data.translations.filter(({ isEnglish }) => isEnglish === isEng) };

                    if (photos[idx].createTwoLang) {
                        editPhoto(photos[idx].id, { titleRu: photos[idx].titleRu || '', titleEng: photos[idx].titleEng || '' });
                        otherPhotos[idx].map(photo => editPhoto(photo.id, { titleRu: photo.titleRu || '', titleEng: photo.titleEng || '' }));
                    } else {
                        if (photos[idx].currentLang === 'eng') {
                            editPhoto(photos[idx].id, { titleEng: photos[idx].titleEng || '' });
                            otherPhotos[idx].map(photo => editPhoto(photo.id, { titleEng: photo.titleEng || '' }));
                        } else {
                            editPhoto(photos[idx].id, { titleRu: photos[idx].titleRu || '' });
                            otherPhotos[idx].map(photo => editPhoto(photo.id, { titleRu: photo.titleRu || '' }));
                        }

                    }
                    return await onCreate(createTwoLang ? data : newData);
                }),
            ]);
            setCreationResults(_creationResults);
            if (_creationResults.every(result => result.success === true)) {
                router.push(`/admin/${type === 'soil' ? 'objects' : 'ecosystems'}`);
                dispatch(openAlert({ title: t('success'), message: t('created_objects'), type: 'success' }));
            } else {
                _creationResults[0].status === 400 && dispatch(openAlert({ title: t('warning'), message: t('form_required'), type: 'warning' }));
                _creationResults[0].status === 500 && dispatch(openAlert({ title: t('error'), message: t('error_objects'), type: 'error' }));
                _creationResults.forEach((result, index) => {
                    if (result.success) {
                        setFormData(prevData => prevData.filter((data, idx) => index !== idx));
                        setPhotos(prevPhotos => prevPhotos.filter((data, idx) => index !== idx));
                        setOtherPhotos(prevOther => prevOther.filter((data, idx) => index !== idx));
                    }
                })
            }
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_objects'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    const fetchDeletePhoto = async (id, idx) => {
        const result = await deletePhotoById(id)
        if (result.success) {
            setPhotos(prev => prev.filter((item, index) => index !== idx))
            setFormData(prev => prev.filter((item, index) => index !== idx))
            if (currentForm === idx) {
                if (formData.length === 1) {
                    setCurrentForm(null);
                } else {
                    const nextFormIndex = idx + 1 < formData.length ? idx + 1 : idx - 1;
                    setCurrentForm(nextFormIndex);
                }
            } else if (currentForm > idx) {
                setCurrentForm(prev => prev - 1);
            }
        }
    }

    const handleSoilDelete = async (e, idx) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_soil'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            if (Number.isInteger(photos[idx].id)) {
                await fetchDeletePhoto(photos[idx].id, idx)
            } else {
                setPhotos(prev => prev.filter((item, index) => index !== idx))
                setFormData(prev => prev.filter((item, index) => index !== idx))
                if (currentForm === idx) {
                    if (formData.length === 1) {
                        setCurrentForm(null);
                    } else {
                        const nextFormIndex = idx + 1 < formData.length ? idx + 1 : idx - 1;
                        setCurrentForm(nextFormIndex);
                    }
                } else if (currentForm > idx) {
                    setCurrentForm(prev => prev - 1);
                }
            }
        }
        dispatch(closeModal());
    }

    const handleFormClick = () => {
        const id = uuid();
        setCurrentForm(0);
        setPhotos([{ id }]);
        setOtherPhotos([[]]);
        setFormData([{ photoId: id, translations: [{ isEnglish: true }, { isEnglish: false }] }]);
    }

    const PhotoCard = ({ id, path, idx, isLoading }) => {
        return <div className={`aspect-[1/1] relative bg-white rounded-lg border flex flex-row
        duration-300 cursor-pointer hover:shadow-md ${currentForm === idx ? ' ring ring-blue-700 ring-opacity-30 w-full' : 'w-[95%]'}  overflow-hidden`}
            onClick={() => setCurrentForm(idx)}>
            <div className='flex flex-col items-center w-full h-full overflow-hidden'>
                <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
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
                    path ? <>
                        <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id}
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
                <p className='max-w-full flex overflow-hidden rounded-b-lg px-4 py-2 text-sm font-medium z-10 absolute
                 bottom-0 max-h-[25%] backdrop-blur-md bg-black bg-opacity-40 text-white w-full
                 overflow-ellipsis'>
                    {formData.find((item, index) => index == idx)?.name ?? t('no_name')}
                </p>
            </div>
        </div>
    }

    return (
        <div className="flex flex-col w-full h-full">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {title}
            </h1>
            <div className='relative h-full pb-16'>
                {!photos.length ? <>
                    {drag
                        ? <div className={`h-[calc(100%-64px)] absolute bg-black/45 top-0 w-full rounded-lg border-dashed border-[1.5px]
                border-black/80 items-center justify-center flex z-30`}
                            onDragStart={e => handleDragStart(e)}
                            onDragLeave={e => handleDragLeave(e)}
                            onDragOver={e => handleDragStart(e)}
                            onDrop={e => handleDrop(e)}>
                            <p className='sm:text-2xl text-xl text-white'>
                                Отпустите файлы
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
                        <div ref={formRef} className='flex-1 xl:order-1 order-2 xl:pr-6 xl:border-r'>
                            {currentForm !== null ?
                                <ObjectForm type={type}
                                    id={currentForm}
                                    item={formData.find((item, idx) => idx == currentForm)}
                                    mainObjectPhoto={photos.find((item, idx) => idx == currentForm)}
                                    otherObjectPhoto={otherPhotos.find((item, idx) => idx == currentForm)}
                                    onItemChange={handleDataChange}
                                    onMainPhotoChange={handleMainPhotoChange}
                                    onOtherPhotosChange={handleOtherPhotosChange}
                                /> : ""}
                        </div>

                        <div className={`mb-6 xl:mb-0 flex flex-col w-full xl:w-[250px] space-y-2 xl:order-2 order-1 xl:pl-6 xl:sticky xl:top-0 
                            xl:max-h-[calc(100vh-100px)] h-[250px] xl:h-fit`}>
                            <p className="font-medium">
                                {`${type === 'soil' ? t('soils') : type === 'ecosystem' ? t('ecosystems') : ''}`}
                            </p>
                            {photos.length &&
                                <ul className={`h-full w-full flex xl:flex-col flex-row justify-start 
                                    xl:space-y-2 xl:pr-2 pb-2 xl:pb-0 rounded-lg overflow-y-auto overflow-x-auto xl:overflow-x-hidden scroll items-center`}
                                    onDragStart={e => !drag && handleDragStart(e)}
                                    onDragLeave={e => !drag && handleDragLeave(e)}
                                    onDragOver={e => !drag && handleDragStart(e)} >
                                    {photos.map((photo, idx) => <li key={photo.id} className='xl:w-full h-full aspect-square p-[3px] flex flex-col items-center justify-center'>
                                        {PhotoCard({ ...photo, idx })}
                                    </li>)}
                                    <div className='xl:min-w-[95%] xl:h-auto h-[95%] p-[3px] flex w-[150px] aspect-square max-w-[150px] xl:w-auto ml-2 xl:ml-0'>
                                        <DragAndDrop onLoadClick={handleSendPhoto} accept='img' />
                                    </div>
                                </ul>
                            }
                            <button
                                onClick={handleCreateClick}
                                disabled={isLoading}
                                className="flex min-h-[40px] items-center justify-center self-end w-full px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
            </div >
        </div >
    )
}
