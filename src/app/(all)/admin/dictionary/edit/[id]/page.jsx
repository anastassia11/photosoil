'use client'

import { getClassification } from '@/api/get_classification';
import { putClassification } from '@/api/put_classification';
import DictionaryForm from '@/components/admin-panel/DictionaryForm';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function DictionaryEditPage({ params: { id } }) {
    const dispatch = useDispatch();
    const [dictionary, setDictionary] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDictionary()
    }, [])

    const fetchDictionary = async () => {
        const result = await getClassification(id)
        console.log(result)
        if (result.success) {
            setDictionary(result.data)
        }
    }

    const editDictionary = async () => {
        setIsLoading(true);
        const result = await putClassification(id, dictionary);
        if (result.success) {
            dispatch(openAlert({ title: 'Успешно', message: 'Изменения сохранены' }))
            setTimeout(() => {
                dispatch(closeAlert())
            }, 3000)
        }
        setIsLoading(false);
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        editDictionary()
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='text-2xl font-semibold mb-4'>
                Редактирование словаря
            </h1>
            <DictionaryForm dictionary={dictionary}
                onDictionaryChange={setDictionary}
                onFormSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
    )
}
