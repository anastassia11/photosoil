'use client'

import { createClassification } from '@/api/classification/create_classification';
import DictionaryForm from '@/components/admin-panel/DictionaryForm';
import { openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Oval } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';

export default function DictionatyCreatePage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [dictionary, setDictionary] = useState({
        name: '',
        terms: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

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

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='text-2xl font-semibold mb-4'>
                {t('creation_dictionary')}
            </h1>
            <DictionaryForm onFormSubmit={createDictionary} isLoading={isLoading} btnTitle={t('create_dictionary')} />
        </div>
    )
}
