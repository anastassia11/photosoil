'use client'

import { deleteClassification } from '@/api/delete_classification';
import { getClassifications } from '@/api/get_classifications';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function DictionaryAdminPage() {
    const dispatch = useDispatch();
    const [disconaries, setDisconaries] = useState([]);

    useEffect(() => {
        fetchDisconaries()
    }, []);

    const fetchDisconaries = async () => {
        const result = await getClassifications()
        if (result.success) {
            setDisconaries(result.data)
        }
    }

    const fetchDeleteDisconary = async (id) => {
        const result = await deleteClassification(id)
        if (result.success) {
            setDisconaries(prev => prev.filter(disconary => disconary.id !== id))
        }
    }

    const handleDeleteClick = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Словарь будет удален',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        console.log('isConfirm', isConfirm)
        if (isConfirm.payload) {
            await fetchDeleteDisconary(id);
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold'>
                    Словари
                </h1>
                <Link href={`/admin/dictionary/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    Добавить словарь
                </Link>
            </div>
            <ObjectsView _objects={disconaries} onDeleteClick={handleDeleteClick} pathname='dictionary' />
        </div >
    );
}
