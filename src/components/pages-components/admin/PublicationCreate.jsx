'use client'

import { createPublication } from '@/api/publication/create_publication'
import PublicationForm from '@/components/admin-panel/PublicationForm'
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function PublicationCreateComponent() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const fetchCreateNews = async (data) => {
        const result = await createPublication(data);
        if (result.success) {
            router.push(`/admin/publications`)
            dispatch(openAlert({ title: t('success'), message: t('created_publication'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_publication'), type: 'error' }));
        }
    }

    const fetchCreatePublication = async ({ createTwoLang, isEng, publication }) => {
        setIsLoading(true)
        try {
            const langPublication = { ...publication, translations: publication.translations.filter(({ isEnglish }) => isEnglish === isEng) };
            await fetchCreateNews(createTwoLang ? publication : langPublication);
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_publication'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <PublicationForm isLoading={isLoading} onPublicationSubmit={fetchCreatePublication}
            createTwoLang={createTwoLang} setCreateTwoLang={setCreateTwoLang}
            btnText={t('create_publication')} title={t('creation_publication')} />
    )
}
