'use client'

import { deleteClassification } from '@/api/classification/delete_classification';
import { getClassifications } from '@/api/classification/get_classifications';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { getTranslation } from '@/i18n/client';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function DictionaryAdminPageComponent() {
    const dispatch = useDispatch();
    const [disconaries, setDisconaries] = useState([]);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

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

    const handleDeleteClick = async ({ id }) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_dictionary'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteDisconary(id);
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='flex flex-row justify-between items-center'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('dictionaries')}
                </h1>
                <Link href={`/${locale}/admin/dictionary/create`}
                    prefetch={false}
                    className="w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('add_dictionary')}
                </Link>
            </div>
            <ObjectsView _objects={disconaries} onDeleteClick={handleDeleteClick} objectType='dictionary'
                pathname='' visibilityControl={false} languageChanger={true} />
        </div >
    );
}
