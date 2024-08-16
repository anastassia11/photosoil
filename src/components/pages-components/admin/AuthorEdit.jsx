'use client'

import { getAuthor } from '@/api/author/get_author';
import { putAuthor } from '@/api/author/put_author';
import AuthorForm from '@/components/admin-panel/AuthorForm';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthorEditComponent({ id }) {
    const dispatch = useDispatch();
    const [author, setAuthor] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    useEffect(() => {
        fetchAuthor()
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && Object.keys(author).length) {
            const title = locale === 'en' ? (author.dataEng.name || author.dataRu.name)
                : (author.dataRu.name || author.dataEng.name)
            if (title) {
                document.title = `${title} | ${t('edit')} | PhotoSOIL`;
            }
        }
    }, [author]);

    const fetchAuthor = async () => {
        const result = await getAuthor(id)
        if (result.success) {
            setAuthor(result.data)
        }
    }

    const handleEditAuthor = async (data) => {
        setIsLoading(true);
        const result = await putAuthor(id, data);
        if (result.success) {
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }))
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }))
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('edit_author')}
            </h1>
            <AuthorForm _author={author} onFormSubmit={handleEditAuthor} isLoading={isLoading} btnText={t('save')} />
        </div>
    )
}
