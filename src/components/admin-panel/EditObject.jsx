'use client'

import { getPhoto } from '@/api/photo/get_photo';
import { putPhoto } from '@/api/photo/put_photo';
import { putSoil } from '@/api/soil/put_soil';
import ObjectForm from '@/components/admin-panel/ObjectForm';
import { openAlert } from '@/store/slices/alertSlice';
import React, { useEffect, useState } from 'react'
import { Oval } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { putEcosystem } from '@/api/ecosystem/put_ecosystem';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getSoil } from '@/api/soil/get_soil';
import { getEcosystem } from '@/api/ecosystem/get_ecosystem';
import { getTranslation } from '@/i18n/client';

export default function EditObject({ id, type, title }) {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [object, setObject] = useState({});
    const [mainPhoto, setMainPhoto] = useState({});
    const [otherPhotos, setOtherPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const router = useRouter();

    useEffect(() => {
        fetchObject()
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && Object.keys(object).length) {
            const title = object.translations?.find(({ isEnglish }) =>
                isEnglish === (searchParams.get('lang') === 'eng'))?.name
            if (title) {
                document.title = `${title} | ${t('edit')} | PhotoSOIL`;
            }
        }
    }, [object]);

    const fetchObject = async () => {
        const result = type === 'soil' ? await getSoil(id) : await getEcosystem(id);
        if (result.success) {
            let data = result.data;
            let dataForPut = {
                ...data, authors: data.authors?.map(({ id }) => id),
                soilObjects: data.soilObjects?.map(({ id }) => id),
                publications: data.publications?.map(({ id }) => id),
                objectPhoto: data.objectPhoto?.map(({ id }) => id),
                photoId: data.photo?.id,
                ecoSystems: data.ecoSystems?.map(({ id }) => id),
                soilTerms: data.classification?.map(item => item.terms.map(({ id }) => id)).flat(),
            }
            type === 'soil' ? delete dataForPut.soilObjects : delete dataForPut.ecoSystems;
            let createTwoLang = data.translations?.length > 1;

            setObject(dataForPut);
            setOtherPhotos(data.objectPhoto);
            setMainPhoto({ ...data.photo, createTwoLang, currentLang: searchParams.get('lang') })
            // fetchOtherPhotos(result.data.objectPhoto);
            setOldTwoLang(createTwoLang);
            // fetchSoilPhoto(result.data.photoId, createTwoLang);
        }
    }

    const fetchOtherPhotos = async (photos) => {
        const objectPhotos = await Promise.all(photos.map(async (id) => {
            const result = await getPhoto(id);
            return result.success ? result.data : null;
        }));
        setOtherPhotos(objectPhotos.filter(photo => photo !== null));
    }

    const fetchSoilPhoto = async (id, createTwoLang) => {
        const result = await getPhoto(id)
        if (result.success) {
            setMainPhoto({ ...result.data, createTwoLang, currentLang: searchParams.get('lang') })
        }
    }

    const editObject = async (id, data) => {
        const result = type === 'soil' ? await putSoil(id, data) : await putEcosystem(id, data);
        if (result.success) {

        } else {
            console.log(result)
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
        if (mainPhoto.id) {
            setIsLoading(true);
            const { createTwoLang } = mainPhoto;
            const updatedObject = {
                ...object, photoId: mainPhoto.id,
                objectPhoto: otherPhotos.map(({ id }) => id)
            };
            delete updatedObject.photo;
            const langObject = { ...updatedObject, translations: updatedObject.translations.filter(({ isEnglish }) => isEnglish === (searchParams.get('lang') === 'eng')) }
            setObject(updatedObject);
            try {
                await Promise.all([
                    editObject(id, createTwoLang ? updatedObject : langObject),
                    editPhoto(mainPhoto.id, createTwoLang ? { titleEng: mainPhoto.titleEng || '', titleRu: mainPhoto.titleRu || '' }
                        : (searchParams.get('lang') === 'eng' ? { titleEng: mainPhoto.titleEng || '' } : { titleRu: mainPhoto.titleRu || '' })),
                    ...otherPhotos.map(photo => editPhoto(photo.id, createTwoLang ? { titleEng: photo.titleEng || '', titleRu: photo.titleRu || '' }
                        : (searchParams.get('lang') === 'eng' ? { titleEng: photo.titleEng || '' } : { titleRu: photo.titleRu || '' })))
                ]);
                router.push(`/${locale}/admin/${type === 'soil' ? 'objects' : 'ecosystems'}`);
                dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
            } catch (error) {
                dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
            } finally {
                setIsLoading(false);
            }
        } else {
            dispatch(openAlert({ title: t('warning'), message: t('form_required'), type: 'warning' }))
        }
    }

    return (
        <div className="flex flex-col w-full space-y-2 pb-[100px]">
            <div className='flex flex-row items-center justify-between'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {title}
                </h1>
            </div>
            <ObjectForm type={type} item={object} pathname='edit'
                oldTwoLang={oldTwoLang} oldIsEng={searchParams.get('lang') === 'eng'}
                mainObjectPhoto={mainPhoto}
                otherObjectPhoto={otherPhotos}
                onItemChange={setObject}
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
                    : t('save')}
            </button>
        </div>
    )
}
