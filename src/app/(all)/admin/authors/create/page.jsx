'use client'

import { createAuthor } from '@/api/create_author';
import AuthorForm from '@/components/admin-panel/AuthorForm';
import { closeAlert, openAlert } from '@/store/slices/alertSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthorCreate() {
    const dispatch = useDispatch();
    const router = useRouter();
    const [author, setAuthor] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log(author)
    }, [author])

    const handleCreateAuthor = async () => {
        setIsLoading(true);
        const result = await createAuthor(author);
        if (result.success) {
            router.push('/admin/authors');
            dispatch(openAlert({ title: 'Успешно', message: 'Автор создан' }))
            setTimeout(() => {
                dispatch(closeAlert())
            }, 3000)
        }
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleCreateAuthor()
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
