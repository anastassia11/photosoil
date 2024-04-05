'use client'

import SoilForm from '@/components/admin-panel/SoilForm'
import { useEffect, useState } from 'react';
import { Oval } from 'react-loader-spinner'
import { useDispatch } from 'react-redux';

export default function EcosystemEditPage({ params: { id } }) {
    const dispatch = useDispatch();

    const [ecosystem, setEcosystem] = useState({});
    const [mainPhoto, setMainPhoto] = useState({});
    const [otherPhotos, setOtherPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchEcosystem()
    }, [])

    const fetchEcosystem = async () => {
        const result = await getEcosystemForPut(id);
        if (result.success) {
            setEcosystem(result.data);
            fetchOtherPhotos(result.data.objectPhoto);
            fetchEcosystemPhoto(result.data.photoId);
        }
    }

    const fetchOtherPhotos = async (photos) => {
        const objectPhotos = await Promise.all(photos.map(async (id) => {
            const result = await getEcosystemPhoto(id);
            return result.success ? result.data : null;
        }));
        setOtherPhotos(objectPhotos.filter(photo => photo !== null));
    }

    const fetchEcosystemPhoto = async (id) => {
        const result = await getEcosystemPhoto(id)
        if (result.success) {
            setMainPhoto(result.data)
        }
    }

    const editEcosystem = async (id, data) => {
        const result = await putEcosystem(id, data);
        if (result.success) {

        }
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const handleMainPhotoChange = (data) => {
        setMainPhoto(data);
    }

    const handleOtherPhotosChange = (data) => {
        setOtherPhotos(data);
    }

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                editEcosystem(id, ecosystem),
                editPhoto(mainPhoto.id, { title: mainPhoto.title }),
                ...otherPhotos.map(photo => editPhoto(photo.id, { title: photo.title }))
            ]);
            setIsLoading(false);
            dispatch(openAlert({ title: 'Успешно', message: 'Изменения успешно сохранены' }))
            setTimeout(() => {
                dispatch(closeAlert())
            }, 3000)
        } catch (error) {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full space-y-4 ">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold'>
                    Редактирование экосистемы
                </h1>
            </div>
            <SoilForm type='edit' item={ecosystem}
                mainEcosystemPhoto={mainPhoto}
                otherEcosystemPhoto={otherPhotos}
                onItemChange={(ecosystem) => setEcosystem(ecosystem)}
                onMainPhotoChange={handleMainPhotoChange}
                onOtherPhotosChange={handleOtherPhotosChange} />
            <button
                onClick={handleSubmit}
                className="flex items-center justify-center self-end min-h-[40px] w-[250px] px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
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
                    : 'Сохранить изменения'}
            </button>
        </div>
    )
}
