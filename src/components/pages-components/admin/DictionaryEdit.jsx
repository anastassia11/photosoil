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
import { setDirty } from '@/store/slices/formSlice';

export default function DictionaryEditPageComponent({ id }) {
    const dispatch = useDispatch();
    const [dictionary, setDictionary] = useState({});
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
        const { nameRu, nameEng, translationMode } = data;
        const _data = {
            translationMode,
            ...(translationMode == 0 && { nameRu, nameEng }),
            ...(translationMode == 1 && { nameEng }),
            ...(translationMode == 2 && { nameRu })
        };

        const createTermData = (term) => ({
            classificationId: Number(id),
            ...(translationMode === 0 && { nameRu: term.nameRu, nameEng: term.nameEng }),
            ...(translationMode === 1 && { nameEng: term.nameEng }),
            ...(translationMode === 2 && { nameRu: term.nameRu })
        });
        try {
            await Promise.all([
                await putClassification(id, _data),
                ...dictionary.terms.map(async (oldTerm) => {
                    const newTerm = data.terms.find((newTerm) => newTerm.id == oldTerm.id);
                    if (!newTerm) {
                        await deleteTerm(oldTerm.id);
                    } else {
                        const isChanged =
                            translationMode == 0 ? ((newTerm.nameRu !== oldTerm.nameRu) || (newTerm.nameEng !== oldTerm.nameEng))
                                : translationMode == 1 ? (newTerm.nameEng !== oldTerm.nameEng)
                                    : (newTerm.nameRu !== oldTerm.nameRu)
                        if (isChanged) {
                            const _term = createTermData(newTerm);
                            putTerm(oldTerm.id, _term);
                        }
                    }
                    return Promise.resolve();
                }),
                ...data.terms.map(async (newTerm) => {
                    if (!newTerm.id) {
                        const _term = createTermData(newTerm);
                        await createTerm(_term);
                    }
                    return Promise.resolve();
                })
            ]);
            router.push(`/${locale}/admin/dictionary`);
            dispatch(setDirty(false));
            dispatch(openAlert({ title: t('success'), message: t('success_edit'), type: 'success' }));
        } catch (error) {
            dispatch(openAlert({ title: t('error'), message: t('error_edit'), type: 'error' }));
        }
    }

    return <DictionaryForm _dictionary={dictionary} title={t('edit_dictionary')}
        onFormSubmit={editDictionary} btnTitle={t('save')} />
}
