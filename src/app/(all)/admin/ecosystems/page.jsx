'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { getEcosystems } from '@/api/get_ecosystems';
import { deleteEcosystemById } from '@/api/delete_ecosystem';

export default function EcosystemsAdminPage() {
    const dispatch = useDispatch();
    const [ecosystems, setEcosystems] = useState([]);

    useEffect(() => {
        fetchEcosystems()
    }, []);

    const fetchEcosystems = async () => {
        const result = await getEcosystems()
        if (result.success) {
            setEcosystems(result.data)
        }
    }

    const fetchDeleteEcosystem = async (id) => {
        const result = await deleteEcosystemById(id)
        if (result.success) {
            setEcosystems(prevEcosystems => prevEcosystems.filter(ecosystem => ecosystem.id !== id))
        }
    }

    const handleDeleteClick = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Экосистема будет удалена',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        console.log('isConfirm', isConfirm)
        if (isConfirm.payload) {
            await fetchDeleteEcosystem(id);
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold'>
                    Экосистемы
                </h1>
                <Link href={`/admin/ecosystems/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    Создать экосистемы
                </Link>
            </div>
            <ObjectsView _objects={ecosystems} onDeleteClick={handleDeleteClick} pathname='ecosystems' />
        </div >
    );
}
