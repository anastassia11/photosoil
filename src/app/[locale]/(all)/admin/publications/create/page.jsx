'use client'

import { createPublication } from '@/api/publication/create_publication'
import PublicationForm from '@/components/admin-panel/PublicationForm'
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function CreatePublicationPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const { t } = useTranslation();

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
            console.log(error)
            dispatch(openAlert({ title: t('error'), message: t('error_publication'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('creation_publication')}
            </h1>
            <PublicationForm isLoading={isLoading} onPublicationSubmit={fetchCreatePublication}
                createTwoLang={createTwoLang} setCreateTwoLang={setCreateTwoLang}
                btnText={t('create_publication')} />
        </div>
    )
}
