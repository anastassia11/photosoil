'use client'

import { getPublication } from '@/api/publication/get_publication';
import { putPublication } from '@/api/publication/put_publication';
import PublicationForm from '@/components/admin-panel/PublicationForm'
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function PublicationEditComponent({ id }) {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [publication, setPublication] = useState({});
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const router = useRouter();

    useEffect(() => {
        fetchPublication();
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && Object.keys(publication).length) {
            const title = publication.translations?.find(({ isEnglish }) =>
                isEnglish === (searchParams.get('lang') === 'eng'))?.name
            if (title) {
                document.title = `${title} | ${t('edit')} | PhotoSOIL`;
            }
        }
    }, [publication]);

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
            router.push(`/${locale}/admin/publications`);
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
        setIsLoading(false);
    }

    const handleSubmit = async ({ createTwoLang, isEng, publication }) => {
        try {
            const langPublication = { ...publication, translations: publication.translations.filter(({ isEnglish }) => isEnglish === isEng) };
            await fetchEditPublication(createTwoLang ? publication : langPublication);
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
    }

    return <PublicationForm _publication={publication}
        title={t('edit_publication')}
        pathname='edit'
        oldTwoLang={oldTwoLang} oldIsEng={searchParams.get('lang') === 'eng'}
        onPublicationSubmit={handleSubmit} btnText={t('save')} />
}
