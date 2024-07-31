'use client'

import { getAllNews } from '@/api/news/get_allNews';
import { getNewsById } from '@/api/news/get_news';
import { putNews } from '@/api/news/put_news';
import { putPhoto } from '@/api/photo/put_photo';
import NewsForm from '@/components/admin-panel/NewsForm'
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function EditNewsPage({ params: { id } }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState();
    const [oldTwoLang, setOldTwoLang] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchNews();
    }, [])

    const fetchNews = async () => {
        const result = await getNewsById(id)
        if (result.success) {
            setNews(result.data);
            let createTwoLang = result.data.translations?.length > 1;
            setOldTwoLang(createTwoLang);
        }
    }

    const fetchEditNews = async (data) => {
        const result = await putNews(id, data);
        if (result.success) {
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
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
            await fetchEditNews(createTwoLang ? news : langNews);
        } catch (error) {
            console.log(error)
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full flex-1 pb-44">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('edit_news')}
            </h1>
            {news && <NewsForm _news={news} isLoading={isLoading}
                pathname='edit'
                oldTwoLang={oldTwoLang} oldIsEng={searchParams.get('lang') === 'eng'}
                onNewsSubmit={handleSubmit} btnText={t('save')} />}
        </div>
    )
}
