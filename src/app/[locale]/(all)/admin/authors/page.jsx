'use client'

import { deleteAuthor } from '@/api/author/delete_author';
import { getAuthors } from '@/api/author/get_authors';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function AuthorsAdminPage() {
    const dispatch = useDispatch();
    const [authors, setAuthors] = useState([]);
    const pathname = usePathname();
    const { t } = useTranslation();

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
        const result = await deleteAuthor(id);
        if (result.success) {
            setAuthors(prevAuthors => prevAuthors.filter(author => author.id !== id));

        }
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_authors') : t('delete_author'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteAuthor(id);
        }
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('photo_authors')}
                </h1>
                <Link href={`/admin/authors/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('add_author')}
                </Link>
            </div>
            <ObjectsView _objects={authors} onDeleteClick={handleDeleteClick} objectType='authors'
                pathname='' visibilityControl={false} languageChanger={false} />
        </div >
    );
}
