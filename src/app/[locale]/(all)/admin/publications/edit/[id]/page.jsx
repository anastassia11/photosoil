'use client'

import { getPublication } from '@/api/publication/get_publication';
import { putPublication } from '@/api/publication/put_publication';
import PublicationForm from '@/components/admin-panel/PublicationForm'
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function EditPublicationPage({ params: { id } }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [publication, setPublication] = useState();
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchPublication();
    }, [])

    const fetchPublication = async () => {
        const result = await getPublication(id)
        if (result.success) {
            setPublication(result.data);
            let createTwoLang = result.data.translations?.length > 1;
            setOldTwoLang(createTwoLang);
        }
    }

    const fetchEditPublication = async (data) => {
        const result = await putPublication(id, data);
        if (result.success) {
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
        setIsLoading(false);
    }

    const handleSubmit = async ({ createTwoLang, isEng, publication }) => {
        setIsLoading(true)
        try {
            const langPublication = { ...publication, translations: publication.translations.filter(({ isEnglish }) => isEnglish === isEng) };
            await fetchEditPublication(createTwoLang ? publication : langPublication);
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('edit_publication')}
            </h1>
            <PublicationForm _publication={publication} isLoading={isLoading}
                pathname='edit'
                oldTwoLang={oldTwoLang} oldIsEng={searchParams.get('lang') === 'eng'}
                onPublicationSubmit={handleSubmit} btnText={t('save')} />
        </div>
    )
}
