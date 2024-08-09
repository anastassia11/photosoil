'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { deleteEcosystemById } from '@/api/ecosystem/delete_ecosystem';
import { putEcosystemVisible } from '@/api/ecosystem/put_ecosystemVisible';
import { getEcosystemsForAdmin } from '@/api/ecosystem/get_ecosystems_forAdmin';
import { useTranslation } from 'react-i18next';
import modalThunkActions from '@/store/thunks/modalThunk';

export default function EcosystemsAdminPage() {
    const dispatch = useDispatch();
    const [ecosystems, setEcosystems] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        fetchEcosystems()
    }, []);

    const fetchEcosystems = async () => {
        const result = await getEcosystemsForAdmin()
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

    const fetchVisibleChange = async (id, data) => {
        const result = await putEcosystemVisible(id, data)
        if (result.success) {
            setEcosystems(prevEcosystems => prevEcosystems.map(ecosystem => ecosystem.id === id ? { ...ecosystem, ...data } : ecosystem))
        }
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_ecosystems') : t('delete_ecosystem'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteEcosystem(id);
        }
        dispatch(closeModal());
    }

    const handleVisibleChange = async ({ id, isVisible, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: !isVisible ? (isMulti ? t('rem_published_ecosystems') : t('rem_published_ecosystem')) :
                (isMulti ? t('published_ecosystems') : t('published_ecosystem ')),
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
                    {t('ecosystems')}
                </h1>
                <Link href={`/admin/ecosystems/create`}
                    className="w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('create_ecosystems')}
                </Link>
            </div>
            <ObjectsView _objects={ecosystems} onDeleteClick={handleDeleteClick} objectType='ecosystems'
                pathname='' visibilityControl={true} languageChanger={true}
                onVisibleChange={handleVisibleChange} />
        </div >
    );
}
