'use client'

import { deleteSoilById } from '@/api/soil/delete_soil';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { putSoilVisible } from '@/api/soil/put_soilVisible';
import { getSoilsForAdmin } from '@/api/soil/get_soils_forAdmin';
import { useTranslation } from 'react-i18next';
import modalThunkActions from '@/store/thunks/modalThunk';

export default function ObjectsPage() {
    const dispatch = useDispatch();
    const [soils, setSoils] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchSoils()
    }, []);

    const fetchSoils = async () => {
        const result = await getSoilsForAdmin()
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

    const fetchVisibleChange = async (id, data) => {
        const result = await putSoilVisible(id, data)
        if (result.success) {
            setSoils(prevSoils => prevSoils.map(soil => soil.id === id ? { ...soil, ...data } : soil))
        }
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_soils') : t('delete_soil'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteSoil(id);
        }
        dispatch(closeModal());
    }

    const handleVisibleChange = async ({ id, isVisible, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: !isVisible ? (isMulti ? t('rem_published_soils') : t('rem_published_soil')) :
                (isMulti ? t('published_soils') : t('published_soil')),
            buttonText: t('confirm')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchVisibleChange(id, { isVisible });
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('soils')}
                </h1>
                <Link href={`/admin/objects/create`}
                    className="w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('create_objects')}
                </Link>
            </div>
            <ObjectsView _objects={soils} onDeleteClick={handleDeleteClick} objectType='objects'
                visibilityControl={true} languageChanger={true}
                pathname='' onVisibleChange={handleVisibleChange} />
        </div >
    );
}
