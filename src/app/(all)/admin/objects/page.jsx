'use client'

import { deleteSoilById } from '@/api/delete_soil';
import { modalAction, setDropdown, setModal } from '@/store/slices/generalSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSoils } from '@/api/get_soils';
import { closeModal, confirmationModal, openModal } from '@/store/slices/modalSlice';
import Pagination from '@/components/Pagination';
import ObjectsView from '@/components/admin-panel/ObjectsView';

export default function ObjectsPage() {
    const dispatch = useDispatch();
    const [soils, setSoils] = useState([]);

    useEffect(() => {
        fetchSoils()
    }, []);

    const fetchSoils = async () => {
        const result = await getSoils()
        if (result.success) {
            setSoils(result.data)
        }
    }

    const fetchDeleteSoil = async (id) => {
        const result = await deleteSoilById(id)
        if (result.success) {
            setSoils(prevSoils => prevSoils.filter(soil => soil.id !== id))
        }
    }

    const handleDeleteClick = async (id) => {
        dispatch(openModal({
            title: 'Предупреждение',
            message: 'Почвенный объект будет удален',
            buttonText: 'Удалить'
        }))

        const isConfirm = await dispatch(confirmationModal());
        if (isConfirm.payload) {
            await fetchDeleteSoil(id);
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='text-2xl font-semibold'>
                    Почвенные объекты
                </h1>
                <Link href={`/admin/objects/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    Создать объекты
                </Link>
            </div>
            <ObjectsView _objects={soils} onDeleteClick={handleDeleteClick} pathname='objects' />
        </div >
    );
}
