'use client'

import { createAuthor } from '@/api/create_author';
import { getAuthor } from '@/api/get_author';
import { putAuthor } from '@/api/put_author';
import AuthorForm from '@/components/admin-panel/AuthorForm';
import { closeAlert, openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthorEditPage({ params: { id } }) {
    const dispatch = useDispatch();
    const [author, setAuthor] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchAuthor()
    }, [])

    const fetchAuthor = async () => {
        const result = await getAuthor(id)
        if (result.success) {
            setAuthor(result.data)
        }
    }

    const handleEditAuthor = async () => {
        setIsLoading(true);
        const result = await putAuthor(author);
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
        handleEditAuthor()
    }
    return (
        <div className="flex flex-col w-full flex-1">
            <h1 className='text-2xl font-semibold mb-4'>
                Создание автора
            </h1>
            <AuthorForm author={author} onAuthorChange={setAuthor}
                onFormSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
    )
}
