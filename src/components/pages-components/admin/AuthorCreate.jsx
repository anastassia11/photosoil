'use client'

import { createAuthor } from '@/api/author/create_author';
import AuthorForm from '@/components/admin-panel/AuthorForm';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthorCreateComponent() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

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

    return <AuthorForm title={t('creation_author')} onFormSubmit={handleCreateAuthor} btnText={t('create_author')} isLoading={isLoading} />
}
