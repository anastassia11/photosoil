'use client'

import { deleteAuthor } from '@/api/delete_author';
import { getAuthors } from '@/api/get_authors';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function AuthorsAdminPage() {
    const dispatch = useDispatch();
    const [authors, setAuthors] = useState([]);

    useEffect(() => {
        fetchAuthors()
    }, []);

    const fetchAuthors = async () => {
        const result = await getAuthors()
        if (result.success) {
            setAuthors(result.data)
        }
    }

    const fetchDeleteAuthor = async (id) => {
        const result = await deleteAuthor(id)
        if (result.success) {
            setAuthors(prevAuthors => prevAuthors.filter(ecosystem => ecosystem.id !== id))
        }
    }

    const handleDeleteClick = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Автор будет удален',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        console.log('isConfirm', isConfirm)
        if (isConfirm.payload) {
            await fetchDeleteAuthor(id);
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold'>
                    Авторы
                </h1>
                <Link href={`/admin/authors/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    Добавить автора
                </Link>
            </div>
            <ObjectsView _objects={authors} onDeleteClick={handleDeleteClick} pathname='authors' visibilityControl={false} />
        </div >
    );
}
