'use client'

import { createClassification } from '@/api/classification/create_classification';
import DictionaryForm from '@/components/admin-panel/DictionaryForm';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react'
import { useDispatch } from 'react-redux';

export default function DictionatyCreatePageComponent() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const createDictionary = async (data) => {
        setIsLoading(true);
        const result = await createClassification(data);
        if (result.success) {
            router.push('/admin/dictionary');
            dispatch(openAlert({ title: t('success'), message: t('created_dictionary'), type: 'success' }))
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_dictionary'), type: 'error' }))
        }
        setIsLoading(false);
    }

    return <DictionaryForm title={t('creation_dictionary')} onFormSubmit={createDictionary} isLoading={isLoading} btnTitle={t('create_dictionary')} />

}
