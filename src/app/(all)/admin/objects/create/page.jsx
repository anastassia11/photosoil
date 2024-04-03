'use client'

import { createSoil } from '@/api/create_soil';
import { deletePhotoById } from '@/api/delete_photo';
import { sendPhoto } from '@/api/send_photo';
import SoilForm from '@/components/admin-panel/SoilForm';
import DragAndDrop from '@/components/admin-panel/ui-kit/DragAndDrop';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';
import { BASE_SERVER_URL, SOIL_INFO } from '@/utils/constants';
import { redirect } from 'next/dist/server/api-utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef, useState } from 'react'
import { Oval } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import uuid from 'react-uuid';

export default function CreatePage() {
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

    useEffect(() => {
        if (formRef.current) {
            setRightBlockHeight(formRef.current.clientHeight)
        }
    }, [photos.length, formData]);

    const handleChange = (e) => {
        e.preventDefault();
        let files = [...e.target.files];
        files.forEach((file) => {
            requestSendPhoto(file)
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
        files.forEach((file) => {
            requestSendPhoto(file)
        });
        setCurrentForm(0)
        setDrag(false);
    }

    const requestSendPhoto = async (file) => {
        const result = await sendPhoto(file);
        console.log(result)
        if (result.success) {
            setPhotos(prev => [...prev, { ...result.data }]);
            setFormData(prev => [...prev, { photoId: result.data.id }]);
            setOtherPhotos(prev => [...prev, []])
        }
    }

    const handleMainPhotoChange = (data) => {
        setPhotos(prev => {
            if (currentForm !== null) {
                return prev.map((item, index) => index === currentForm ? data : item);
            } else {
                return [...prev, { ...data }];
            }
        });
    }

    const handleOtherPhotosChange = (data) => {
        setOtherPhotos(prev => {
            if (currentForm !== null) {
                return prev.map((item, index) => index === currentForm ? data : item);
            }
        });
    }

    const handleDataChange = (data) => {
        setFormData(prev => prev.map((item, index) => index === currentForm ? { ...item, ...data } : item));
        !Number.isInteger(data.photoId) && setPhotos(prev => prev.map((item, index) => index === currentForm ? {} : item))
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        console.log(result)
        if (result.success) {

        }
    }

    const handleCreateClick = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                ...formData.map(data => fetchCreateSoil(data)),
                ...photos.map(photo => editPhoto(photo.id, { title: photo.title })),
                ...otherPhotos.map(otherArray => otherArray.map(photo => editPhoto(photo.id, { title: photo.title })))
            ]);
            setIsLoading(false);
            router.push('/admin/objects')
        } catch (error) {
            setIsLoading(false);
        }
    }

    const fetchCreateSoil = async (data) => {
        const result = await createSoil(data)
        if (result.success) {
            console.log(result)
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
            title: 'Предупреждение',
            message: 'Объект будет удален навсегда',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
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
        const id = uuid()
        setCurrentForm(0)
        setPhotos(prev => [...prev, { id }])
    }

    const PhotoCard = ({ id, path, idx }) => {
        return <div className={`aspect-[1/1] relative bg-white rounded-lg border flex flex-row
        duration-300 cursor-pointer hover:shadow-md ${currentForm === idx ? ' ring ring-blue-300 ring-opacity-80 w-full' : 'w-[95%]'}  overflow-hidden`}
            onClick={() => setCurrentForm(idx)}>
            <div className='flex flex-col items-center w-full h-full overflow-hidden'>
                <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                    onClick={(e) => handleSoilDelete(e, idx)}
                >
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                        <g id="Menu / Close_LG">
                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>
                {path ?
                    <>
                        <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id} className='w-full h-full object-cover' />
                    </> :
                    <div className='flex items-center justify-center w-full h-full'>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className='w-full h-full text-zinc-500'
                            viewBox="0 0 32 32" >
                            <path fill='currentColor' strokeWidth='100' d="M30 3.414 28.586 2 2 28.586 3.414 30l2-2H26a2.003 2.003 0 0 0 2-2V5.414ZM26 26H7.414l7.793-7.793 2.379 2.379a2 2 0 0 0 2.828 0L22 19l4 3.997Zm0-5.832-2.586-2.586a2 2 0 0 0-2.828 0L19 19.168l-2.377-2.377L26 7.414ZM6 22v-3l5-4.997 1.373 1.374 1.416-1.416-1.375-1.375a2 2 0 0 0-2.828 0L6 16.172V6h16V4H6a2.002 2.002 0 0 0-2 2v16Z" />
                        </svg>
                    </div>
                }
                <p className='max-w-full flex overflow-hidden rounded-b-lg px-4 py-2 text-sm font-medium z-10 absolute
                 bottom-0 max-h-[25%] backdrop-blur-md bg-black bg-opacity-40 text-white w-full
                 overflow-ellipsis'>
                    {formData.find((item, index) => index == idx).name ?? 'Без имени'}
                </p>
            </div>
        </div>
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='text-2xl font-semibold mb-4'>
                Создание объектов
            </h1>
            <div className='relative flex-1'>
                {!photos.length ? <>
                    {drag
                        ? <div className={`h-full absolute bg-black/45 top-0 w-full rounded-lg border-dashed border-[1.5px]
                border-black/80 items-center justify-center flex z-30`}
                            onDragStart={e => handleDragStart(e)}
                            onDragLeave={e => handleDragLeave(e)}
                            onDragOver={e => handleDragStart(e)}
                            onDrop={e => handleDrop(e)}>
                            <p className='text-2xl text-white'>
                                Отпустите файлы
                            </p>
                        </div> : ''}
                    <div className='w-full'
                        onDragStart={e => !drag && handleDragStart(e)}
                        onDragLeave={e => !drag && handleDragLeave(e)}
                        onDragOver={e => !drag && handleDragStart(e)}>
                        <div className='flex flex-col w-full items-center my-[200px]'>
                            <p className='w-[70%] text-center text-2xl'>
                                Чтобы создать объекты, загрузите главные изображения</p>
                            <label htmlFor='photo_file'
                                className='cursor-pointer mt-4 mb-2 w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600
                text-2xl'>
                                <input type="file" multiple id='photo_file' className="w-0 h-0"
                                    onChange={handleChange} />
                                Выбрать файлы
                            </label>
                            <p>
                                или перетащите файлы сюда
                            </p>
                            <button className='mt-[100px] text-blue-700 hover:underline duration-300'
                                onClick={handleFormClick}>
                                Перейти сразу к заполнению формы
                            </button>
                        </div>
                    </div>
                </> :
                    <div className='flex flex-row h-full space-x-12'>
                        <div ref={formRef} className='flex-1 h-fit'>
                            {currentForm !== null ?
                                <SoilForm item={formData.find((item, idx) => idx == currentForm)}
                                    mainSoilPhoto={photos.find((item, idx) => idx == currentForm)}
                                    otherSoilPhoto={otherPhotos.find((item, idx) => idx == currentForm)}
                                    onItemChange={(soil) => handleDataChange(soil)}
                                    onMainPhotoChange={handleMainPhotoChange}
                                    onOtherPhotosChange={handleOtherPhotosChange}
                                /> :
                                <div className='mt-[200px] w-full'>
                                    <p className='w-[60%] text-center text-2xl mx-auto'>
                                        Выберите объект, если хотите заполнить подробную информацию
                                    </p>
                                </div>}
                        </div>

                        <div className={`flex flex-col w-[280px] space-y-2`}>
                            <p className="font-medium">
                                Объекты (главное фото)
                            </p>
                            {photos.length &&
                                <ul style={{
                                    height: `${rightBlockHeight}px`
                                }}
                                    className={`w-full flex flex-col space-y-2 pr-2 rounded-lg overflow-y-auto scroll items-center`}
                                    onDragStart={e => !drag && handleDragStart(e)}
                                    onDragLeave={e => !drag && handleDragLeave(e)}
                                    onDragOver={e => !drag && handleDragStart(e)} >
                                    {photos.map((photo, idx) => <li key={photo.id} className='w-full p-[3px] flex flex-col items-center'>
                                        {PhotoCard({ ...photo, idx })}
                                    </li>)}
                                    <div className='w-[95%] p-[3px] min-h-[242px] '>
                                        <DragAndDrop onLoadClick={requestSendPhoto} />
                                    </div>
                                </ul>
                            }
                            <button
                                onClick={handleCreateClick}
                                disabled={isLoading}
                                className="min-h-[40px] flex items-center justify-center self-end w-full px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
                                    : 'Создать объекты'}
                            </button>
                        </div>
                    </div>}
            </div >
        </div >
    )
}
