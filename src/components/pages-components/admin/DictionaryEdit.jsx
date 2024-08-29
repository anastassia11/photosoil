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
import { useParams, useRouter } from 'next/navigation';
import { getTranslation } from '@/i18n/client';

export default function DictionaryEditPageComponent({ id }) {
    const dispatch = useDispatch();
    const [dictionary, setDictionary] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const router = useRouter();

    useEffect(() => {
        fetchDictionary();
    }, [])

    useEffect(() => {
        if (typeof document !== 'undefined' && Object.keys(dictionary).length) {
            const title = locale === 'en' ? (dictionary.nameEng || dictionary.nameRu)
                : (dictionary.nameRu || dictionary.nameEng)
            if (title) {
                document.title = `${title} | ${t('edit')} | PhotoSOIL`;
            }
        }
    }, [dictionary]);

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
            router.push(`/${locale}/admin/dictionary`);
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        } finally {
            setIsLoading(false);
        }
    }

    return <DictionaryForm _dictionary={dictionary} isEdit={true} title={t('edit_dictionary')}
        onFormSubmit={editDictionary} isLoading={isLoading} btnTitle={t('save')} />
}
