'use client'

import { createClassification } from '@/api/create_classification';
import DictionaryForm from '@/components/admin-panel/DictionaryForm';
import { closeAlert, openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
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

    const createDictionary = async () => {
        setIsLoading(true);
        const result = await createClassification(dictionary);
        if (result.success) {
            router.push('/admin/dictionary');
            dispatch(openAlert({ title: 'Успешно', message: 'Словарь добавлен' }))
            setTimeout(() => {
                dispatch(closeAlert())
            }, 3000)
        }
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        createDictionary()
    }

    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='text-2xl font-semibold mb-4'>
                Создание словаря
            </h1>
            <DictionaryForm dictionary={dictionary}
                onDictionaryChange={setDictionary}
                onFormSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
    )
}
