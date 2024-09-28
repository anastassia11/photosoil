'use client'

import { deleteNewsById } from '@/api/news/delete_news';
import { getNewsForAdmin } from '@/api/news/get_news_forAdmin';
import { putNewsVisible } from '@/api/news/put_newsVisible';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { getTranslation } from '@/i18n/client';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function NewsAdminComponent() {
    const dispatch = useDispatch();
    const [news, setNews] = useState([]);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    useEffect(() => {
        fetchNews()
    }, []);

    const fetchNews = async () => {
        const result = await getNewsForAdmin();
        if (result.success) {
            setNews(result.data);
        }
    }

    const fetchDeleteNews = async (id) => {
        const result = await deleteNewsById(id);
        if (result.success) {
            setNews(prevNews => prevNews.filter(news => news.id !== id));
        }
    }

    const fetchVisibleChange = async (id, data) => {
        const result = await putNewsVisible(id, data);
        if (result.success) {
            setNews(prevNews => prevNews.map(news => news.id === id ? { ...news, ...data } : news));
        }
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_manyNews') : t('delete_news'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteNews(id);
        }
        dispatch(closeModal());
    }

    const handleVisibleClick = async ({ id, isVisible, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: !isVisible ? (isMulti ? t('rem_published_manyNews') : t('rem_published_news')) :
                (isMulti ? t('published_manyNews') : t('published_news')),
            buttonText: t('confirm')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchVisibleChange(id, { isVisible });
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('news')}
                </h1>
                <Link href={`/${locale}/admin/news/create`}
                    prefetch={false}
                    className="w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('create_news')}
                </Link>
            </div>
            <ObjectsView _objects={news} onDeleteClick={handleDeleteClick} objectType='news'
                pathname='' visibilityControl={true} languageChanger={true}
                onVisibleChange={handleVisibleClick} />
        </div >
    );
}
