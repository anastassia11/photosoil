'use client'

import { createAuthor } from '@/api/author/create_author';
import AuthorForm from '@/components/admin-panel/AuthorForm';
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function AuthorCreate() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const handleCreateAuthor = async (data) => {
        setIsLoading(true);
        const result = await createAuthor(data);
        if (result.success) {
            router.push('/admin/authors');
            dispatch(openAlert({ title: t('success'), message: t('created_author'), type: 'success' }))
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_author'), type: 'error' }))
        }
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('creation_author')}
            </h1>
            <AuthorForm onFormSubmit={handleCreateAuthor} btnText={t('create_author')} isLoading={isLoading} />
        </div>
    )
}
