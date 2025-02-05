'use client'

import { getNewsById } from '@/api/news/get_news';
import { putNews } from '@/api/news/put_news';
import { deletePhotoById } from '@/api/photo/delete_photo';
import { putPhoto } from '@/api/photo/put_photo';
import NewsForm from '@/components/admin-panel/NewsForm'
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { setDirty } from '@/store/slices/formSlice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function NewsEditComponent({ id }) {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [news, setNews] = useState({});
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const router = useRouter();

    useEffect(() => {
        fetchNews();
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && Object.keys(news).length) {
            const title = news.translations?.find(({ isEnglish }) =>
                isEnglish === (searchParams.get('lang') === 'eng'))?.title
            if (title) {
                document.title = `${title} | ${t('edit')} | PhotoSOIL`;
            }
        }
    }, [news]);

    const fetchNews = async () => {
        const result = await getNewsById(id)
        if (result.success) {
            setNews(result.data);
            let createTwoLang = result.data.translations?.length > 1;
            setOldTwoLang(createTwoLang);
        }
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const handleSubmit = async ({ createTwoLang, isEng, news, newsPhotos, initialPhotos, initialFiles }) => {
        try {
            const langNews = { ...news, translations: news.translations.filter(({ isEnglish }) => isEnglish === isEng) };
            if (createTwoLang) {
                newsPhotos.map(photo => editPhoto(photo.id, { titleRu: photo.titleRu || '', titleEng: photo.titleEng || '' }));
            } else {
                if (isEng) {
                    newsPhotos.map(photo => editPhoto(photo.id, { titleEng: photo.titleEng || '' }));
                } else {
                    newsPhotos.map(photo => editPhoto(photo.id, { titleRu: photo.titleRu || '' }));
                }
            }

            const result = await putNews(id, createTwoLang ? news : langNews);
            if (result.success) {
                dispatch(setDirty(false));
                dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
                for (const id of initialPhotos) {
                    if (!news.objectPhoto.includes(id)) {
                        await deletePhotoById(id);
                    }
                }
                for (const id of initialFiles) {
                    if (!news.files.includes(id)) {
                        await deletePhotoById(id);
                    }
                }
                router.push(`/${locale}/admin/news`);
            } else {
                dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
            }
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
    }

    return (
        <>
            {news && <NewsForm _news={news}
                pathname='edit'
                oldTwoLang={oldTwoLang} oldIsEng={searchParams.get('lang') === 'eng'}
                onNewsSubmit={handleSubmit} btnText={t('save')} title={t('edit_news')} />}
        </>
    )
}
