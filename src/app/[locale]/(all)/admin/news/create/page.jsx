'use client'

import { createNews } from '@/api/news/create_news';
import { putPhoto } from '@/api/photo/put_photo';
import NewsForm from '@/components/admin-panel/NewsForm';
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function CreateNewsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const fetchCreateNews = async (news) => {
        const result = await createNews(news);
        if (result.success) {
            router.push(`/admin/news`)
            dispatch(openAlert({ title: t('success'), message: t('created_news'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_news'), type: 'error' }));
        }
        setIsLoading(false);
    }

    const editPhoto = async (id, data) => {
        const result = await putPhoto(id, data);
        if (result.success) {

        }
    }

    const handleSubmit = async ({ createTwoLang, isEng, news, newsPhotos }) => {
        setIsLoading(true)
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
            console.log(error)
            dispatch(openAlert({ title: t('error'), message: t('error_news'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('creation_news')}
            </h1>
            <NewsForm isLoading={isLoading} onNewsSubmit={handleSubmit}
                btnText={t('create_news')} />
        </div>
    )
}
