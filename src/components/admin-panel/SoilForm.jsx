'use client'

import { useDispatch, useSelector } from 'react-redux';
import Zoom from '../map/Zoom'
import Filter from '../soils/Filter'
import { useEffect, useState } from 'react';
import { BASE_SERVER_URL, CATEGORIES, SOIL_INFO } from '@/utils/constants';
import Image from 'next/image';
import { sendPhoto } from '@/api/send_photo';
import { getAuthors } from '@/api/get_authors';
import { getEcosystems } from '@/api/get_ecosystems';
import Dropdown from './Dropdown';
import { getSoilPhoto } from '@/api/get_photo';
import DynamicMapSelect from '../map/DynamicMapSelect';
import DragAndDrop from './ui-kit/DragAndDrop';
import { deletePhotoById } from '@/api/delete_photo';
import FullScreen from '../map/FullScreen';
import uuid from 'react-uuid';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';

export default function SoilForm({ item, mainSoilPhoto, otherSoilPhoto, onItemChange, onMainPhotoChange, onOtherPhotosChange }) {
    const dispatch = useDispatch()
    const classifications = useSelector(state => state.data.classifications);

    const [soil, setSoil] = useState([]);
    const [mainPhoto, setMainPhoto] = useState({});
    const [otherPhotos, setOtherPhotos] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);

    useEffect(() => {
        fetchAuthors()
        fetchEcosystems()
    }, [])

    useEffect(() => {
        console.log(mainPhoto)
    }, [mainPhoto])

    useEffect(() => {
        if (item) {
            setSoil(item)
        }
    }, [item])

    useEffect(() => {
        if (mainSoilPhoto) {
            setMainPhoto(mainSoilPhoto)
        }
    }, [mainSoilPhoto])

    useEffect(() => {
        if (otherSoilPhoto) {
            setOtherPhotos(otherSoilPhoto)
        }
    }, [otherSoilPhoto])

    const fetchAuthors = async () => {
        const result = await getAuthors()
        if (result.success) {
            setAuthors(result.data)
        }
    }

    const fetchEcosystems = async () => {
        const result = await getEcosystems()
        if (result.success) {
            setEcosystems(result.data)
        }
    }

    const handleOtherPhotoSend = async (file) => {
        const result = await sendPhoto(file);

        if (result.success) {
            setOtherPhotos(prev => {
                const updatedPhotos = prev ? [...prev, result.data] : [result.data];
                onOtherPhotosChange(updatedPhotos);
                return updatedPhotos;
            });

            setSoil(prev => {
                const updatedObjectPhoto = prev.objectPhoto ? [...prev.objectPhoto, result.data.id] : [result.data.id];
                const updatedSoil = { ...prev, objectPhoto: updatedObjectPhoto };
                onItemChange(updatedSoil);
                return updatedSoil;
            });
        }
    }

    const handleMainPhotoSend = async (file) => {
        const result = await sendPhoto(file);

        if (result.success) {
            setMainPhoto(result.data);
            onMainPhotoChange(result.data);

            setSoil(prev => {
                const updatedSoil = { ...prev, photoId: result.data.id };
                onItemChange(updatedSoil);
                return updatedSoil;
            });
        };

    }

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setSoil(prev => {
            const updatedSoil = { ...prev, [name]: value };
            onItemChange(updatedSoil);
            return updatedSoil;
        })
    }

    const handleParamsChange = (type, newData) => {
        setSoil(prev => {
            const updatedSoil = { ...prev, [type]: newData };
            onItemChange(updatedSoil);
            return updatedSoil;
        })
    }

    const handleCategotyChange = (id) => {
        setSoil(prev => {
            const updatedSoil = { ...prev, objectType: id };
            onItemChange(updatedSoil);
            return updatedSoil;
        })
    }

    const handleMainPhotoChange = (e) => {
        setMainPhoto(prev => {
            const updatedPhoto = { ...prev, title: e.target.value }
            onMainPhotoChange(updatedPhoto)
            return updatedPhoto
        })
    }

    const handleOtherPhotosChange = (e, id) => {
        setOtherPhotos(prev => {
            const updatedPhoto = prev.map((item) => item.id === id ? ({ ...item, title: e.target.value }) : item)
            onOtherPhotosChange(updatedPhoto)
            return updatedPhoto
        })
    }

    const mainPhotoDelete = async (id) => {
        const newId = uuid()
        const result = await deletePhotoById(id)
        if (result.success) {
            setMainPhoto({})
            onMainPhotoChange({})
            setSoil(prev => {
                const updatedSoil = {
                    ...prev,
                    photoId: newId
                };
                onItemChange(updatedSoil);
                return updatedSoil;
            })
        }
    }

    const handleMainPhotoDelete = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Фотография будет удалена',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        if (isConfirm.payload) {
            await mainPhotoDelete(id);
        }
        dispatch(closeModal());
    }

    const otherPhotoDelete = async (id) => {
        const result = await deletePhotoById(id)
        if (result.success) {
            setOtherPhotos(prev => {
                const updatedPhotos = prev.filter(el => el.id !== id);
                onOtherPhotosChange(updatedPhotos);
                return updatedPhotos
            })
            setSoil(prev => {
                const updatedSoil = {
                    ...prev,
                    objectPhoto: prev.objectPhoto.filter(el => el.id !== id)
                };
                onItemChange(updatedSoil);
                return updatedSoil;
            })
        }
    }

    const handleOtherPhotoDelete = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Фотография будет удалена',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        if (isConfirm.payload) {
            await otherPhotoDelete(id);
        }
        dispatch(closeModal());
    }


    const Input = ({ name, label }) => {
        return <div>
            <label className="font-medium">
                {label}
            </label>
            <input
                value={soil[name] || ''}
                onChange={handleInputChange}
                name={name}
                type="text"
                className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const MapInput = ({ name, label, id }) => {
        return <input
            value={soil[name] || ''}
            onChange={handleInputChange}
            name={name}
            type="text"
            placeholder={label}
            id={id}
            className="bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
        />
    }

    const Textarea = ({ name, label }) => {
        return <div>
            <label className="font-medium">
                {label}
            </label>
            <textarea
                value={soil[name] || ''}
                name={name}
                onChange={handleInputChange}
                type="text"
                className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const PhotoCard = ({ id, title, path, fileName, onDelete, isMain }) => {
        return <div className='flex flex-row space-x-4 h-[150px] mt-1'>
            <div className='relative flex flex-col items-center min-w-[150px] aspect-[1/1] rounded-md overflow-hidden
                            shadow-lg'>
                <Image src={`${BASE_SERVER_URL}${path}`} height={150} width={150} alt={id} className='object-cover w-[150px] aspect-[1/1]' />
                <p className='overflow-hidden whitespace-nowrap overflow-ellipsis py-1 px-2 text-sm font-medium z-10 absolute bottom-0 backdrop-blur-md bg-black bg-opacity-40 text-white w-full'>
                    {fileName}
                </p>
                <button className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                    onClick={() => onDelete(id)}>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                        <g id="Menu / Close_LG">
                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                </button>
            </div>
            <div className='w-full'>
                <textarea
                    value={title ?? ''}
                    onChange={e => {
                        if (isMain) {
                            handleMainPhotoChange(e)
                        } else handleOtherPhotosChange(e, id)
                    }}
                    type="text"
                    placeholder='Текст к фото'
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
                    <div className='flex flex-col w-full'>
                        {Input({ name: 'name', label: 'Название' })}
                        <div className='mt-3'>
                            <Dropdown name='Тип объекта базы данных' items={CATEGORIES}
                                onCategotyChange={handleCategotyChange} />
                        </div>

                        <ul className='flex flex-col w-full'>
                            {SOIL_INFO.map(({ name, titleRu }) => {
                                return <li key={name} className={`mt-3 ${name === 'objectType' && 'hidden'} `}>
                                    {
                                        name === 'soilFeatures' ? Textarea({ name, label: titleRu }) :
                                            Input({ name, label: titleRu })
                                    }
                                </li>
                            })}
                            <li key='authors' className={`mt-3`}>
                                <Filter name='Авторы' items={authors}
                                    allSelectedItems={soil.authors}
                                    onChange={(newData) => handleParamsChange('authors', newData)}
                                />
                            </li>
                        </ul>
                    </div>
                    <div className='flex flex-col w-full h-[566px] max-h-[566px]'>
                        <label className="font-medium">
                            Расположение объекта на карте
                        </label>
                        <div className='flex flex-row mt-1 mb-2 w-full space-x-3'>
                            {MapInput({ name: 'latitude', label: 'Latitude', id: "LatitudeDec" })}
                            {MapInput({ name: 'longtitude', label: 'Longtitude', id: "LongtitudeDec" })}
                        </div>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-1 h-full'>
                            <div className='relative w-full h-full '>
                                <DynamicMapSelect />
                                <div className='z-20 absolute top-0 right-0 m-2'>
                                    <FullScreen />
                                </div>
                                <div className='z-20 absolute top-[calc(50%-50px)] right-0 m-2 '>
                                    <Zoom />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className='font-medium mt-8'>Основная фотография</p>
                {mainPhoto?.path ?
                    <div className='grid grid-cols-2 gap-4 mt-1'>
                        {PhotoCard({ ...mainPhoto, isMain: true, onDelete: handleMainPhotoDelete })}
                    </div>
                    : <div className='w-[50%] h-[150px] pr-2 mt-1'>
                        <DragAndDrop onLoadClick={handleMainPhotoSend} isMultiple={false} />
                    </div>}


                <p className='font-medium mt-8'>Дополнительные фотографии</p>
                {!otherPhotos?.length ?
                    <div className='w-[50%] h-[150px] pr-2 mt-1'>
                        <DragAndDrop onLoadClick={handleOtherPhotoSend} isMultiple={true} />
                    </div>
                    :
                    <ul className={` grid grid-cols-2 gap-4 `}>
                        {otherPhotos.map(photo => <li key={photo.id}>
                            {PhotoCard({ ...photo, isMain: false, onDelete: handleOtherPhotoDelete })}
                        </li>)}
                        <div className='h-[150px]'>
                            <DragAndDrop onLoadClick={handleOtherPhotoSend} isMultiple={true} />
                        </div>
                    </ul>}



                <p className='font-medium mt-8'>Классификаторы</p>
                <ul className='grid grid-cols-2 gap-4 w-full mt-1'>
                    {classifications.map(item => {
                        return <li key={item.id}>
                            <Filter name={item.name} items={item.terms}
                                allSelectedItems={soil.soilTerms}
                                onChange={(newData) => handleParamsChange('soilTerms', newData)} />
                        </li>
                    })}
                </ul>

                <p className='font-medium mt-8'>Связи с другими объектами</p>
                <div className='grid grid-cols-2 gap-4 w-full mt-1'>
                    <Filter name='Экосистемы' items={ecosystems}
                        allSelectedItems={soil.ecoSystems}
                        onChange={(newData) => handleParamsChange('ecoSystems', newData)} />

                    <Filter name='Публикации' items={''}
                        allSelectedItems={soil.publications}
                        onChange={(newData) => handleParamsChange('publications', newData)} />
                </div>

                <div className='mt-8 w-[50%] pr-2'>  {Input({ name: 'сode', label: 'Код' })}</div>

            </div>
        </form >
    )
}
