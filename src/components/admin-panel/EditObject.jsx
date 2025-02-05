'use client'

import { putPhoto } from '@/api/photo/put_photo';
import { putSoil } from '@/api/soil/put_soil';
import ObjectForm from '@/components/admin-panel/ObjectForm';
import { openAlert } from '@/store/slices/alertSlice';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux';
import { putEcosystem } from '@/api/ecosystem/put_ecosystem';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getSoil } from '@/api/soil/get_soil';
import { getEcosystem } from '@/api/ecosystem/get_ecosystem';
import { getTranslation } from '@/i18n/client';
import SubmitBtn from './ui-kit/SubmitBtn';
import { setDirty } from '@/store/slices/formSlice';
import { deletePhotoById } from '@/api/photo/delete_photo';

export default function EditObject({ id, type, title }) {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [object, setObject] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const formRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        fetchObject();
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
            const data = result.data;
            const dataForPut = {
                ...data,
                mainPhoto: data.photo,
                currentLang: searchParams.get('lang') === 'eng',
                createTwoLang: data.translations?.length > 1,
                authors: data.authors?.map(({ id }) => id),
                publications: data.publications?.map(({ id }) => id),
            };
            if (type === 'soil') {
                dataForPut.ecoSystems = data.ecoSystems?.map(({ id }) => id);
                dataForPut.soilTerms = data.classification?.map(item => item.terms.map(({ id }) => id)).flat();
            } else if (type === 'ecosystem') {
                dataForPut.soilObjects = data.soilObjects?.map(({ id }) => id);
            }
            setObject(dataForPut);
            setOldTwoLang(result.data.translations?.length > 1);
        }
    }

    const editObject = async (data) => {
        const result = type === 'soil' ? await putSoil(data.id, data) : await putEcosystem(data.id, data);
        if (result.success) {

        }
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const submitForm = async (data) => {
        setIsLoading(true);
        const { createTwoLang, currentLang, mainPhoto, objectPhoto } = data;
        const dataForFetch = {
            ...data,
            photoId: mainPhoto.id,
            objectPhoto: objectPhoto.map(({ id }) => id),
        }
        const langData = { ...dataForFetch, translations: data.translations.filter(({ isEnglish }) => isEnglish === currentLang) };
        try {
            await Promise.all([
                editPhoto(mainPhoto.id, createTwoLang ? { titleEng: mainPhoto.titleEng || '', titleRu: mainPhoto.titleRu || '' }
                    : (currentLang ? { titleEng: mainPhoto.titleEng || '' } : { titleRu: mainPhoto.titleRu || '' })),
                ...objectPhoto.map(photo => editPhoto(photo.id, createTwoLang ? { titleEng: photo.titleEng || '', titleRu: photo.titleRu || '' }
                    : (currentLang ? { titleEng: photo.titleEng || '' } : { titleRu: photo.titleRu || '' }))),
                editObject(createTwoLang ? dataForFetch : langData)
            ]);
            const initialObjPhotos = object.objectPhoto.map(({ id }) => id);
            for (const id of initialObjPhotos) {
                if (!dataForFetch.objectPhoto.includes(id)) {
                    await deletePhotoById(id);
                }
            }
            if (object.photoId !== dataForFetch.photoId) {
                await deletePhotoById(object.photoId);
            }
            router.push(`/${locale}/admin/${type === 'soil' ? 'objects' : 'ecosystems'}`);
            dispatch(setDirty(false));
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    const handleEditClick = async (e) => {
        e.preventDefault();
        const { valid } = await formRef.current.formCheck();
        if (valid) {
            const newValues = formRef.current.updateState();
            submitForm(newValues);
        }
    }

    return (
        <div className="flex flex-col w-full pb-[140px]">
            <div className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
                <h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
                    {title}
                </h1>
                <div className='md:min-w-[220px] md:max-w-[220px] md:w-fit'>
                    <SubmitBtn isSubmitting={isLoading} btnText={t('save')} onClick={handleEditClick} />
                </div>
            </div>
            <ObjectForm ref={formRef}
                type={type}
                item={object}
                pathname='edit'
                oldTwoLang={oldTwoLang}
                oldIsEng={searchParams.get('lang') === 'eng'}
            />
        </div>
    )
}
