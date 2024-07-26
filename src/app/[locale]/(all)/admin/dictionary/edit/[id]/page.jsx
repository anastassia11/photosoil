'use client'

import { createTerm } from '@/api/term/create_term';
import { deleteTerm } from '@/api/term/delete_term';
import { getClassification } from '@/api/classification/get_classification';
import { putClassification } from '@/api/classification/put_classification';
import { putTerm } from '@/api/term/put_term';
import DictionaryForm from '@/components/admin-panel/DictionaryForm';
import { openAlert } from '@/store/slices/alertSlice';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function DictionaryEditPage({ params: { id } }) {
    const dispatch = useDispatch();
    const [dictionary, setDictionary] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        fetchDictionary();
    }, [])

    const fetchDictionary = async () => {
        const result = await getClassification(id);
        if (result.success) {
            setDictionary(result.data);
        }
    }

    const editDictionary = async (data) => {
        setIsLoading(true);
        try {
            await Promise.all([
                putClassification(id, { name: data.name, translationMode: data.translationMode }),
                ...dictionary.terms.map((oldTerm) => {
                    const newTerm = data.terms.find((newTerm) => newTerm.id === oldTerm.id);
                    if (!newTerm) {
                        deleteTerm(oldTerm.id);
                    } else if (newTerm.name !== oldTerm.name) {
                        putTerm(oldTerm.id, { name: newTerm.name });
                    }
                    return Promise.resolve();
                }),
                ...data.terms.map((newTerm) => {
                    if (typeof newTerm === "string") {
                        createTerm({ classificationId: id, name: newTerm });
                    }
                    return Promise.resolve();
                })
            ]);
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='sm:text-2xl text-xl font-semibold mb-4'>
                {t('edit_dictionary')}
            </h1>
            <DictionaryForm _dictionary={dictionary} isEdit={true}
                onFormSubmit={editDictionary} isLoading={isLoading} btnTitle={t('save')} />
        </div>
    )
}
