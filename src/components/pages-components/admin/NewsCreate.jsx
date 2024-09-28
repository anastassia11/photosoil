'use client'

import { createNews } from '@/api/news/create_news';
import { putPhoto } from '@/api/photo/put_photo';
import NewsForm from '@/components/admin-panel/NewsForm';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

export default function CreateNewsComponent() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const fetchCreateNews = async (news) => {
        const result = await createNews(news);
        if (result.success) {
            router.push(`/admin/news`)
            dispatch(openAlert({ title: t('success'), message: t('created_news'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_news'), type: 'error' }));
        }
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const handleSubmit = async ({ createTwoLang, isEng, news, newsPhotos }) => {
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
            await fetchCreateNews(createTwoLang ? news : langNews);
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_news'), type: 'error' }));
        }
    }

    return <NewsForm onNewsSubmit={handleSubmit}
        btnText={t('create_news')} title={t('creation_news')} />
}
