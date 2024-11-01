'use client'

import { deletePublicationById } from '@/api/publication/delete_publication';
import { getPublicationsForAdmin } from '@/api/publication/get_publications_forAdmin';
import { putPublicationVisible } from '@/api/publication/put_publicationVisible';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { getTranslation } from '@/i18n/client';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

export default function PublicationsAdminComponent() {
    const dispatch = useDispatch();
    const [publications, setPublications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    useEffect(() => {
        fetchPublications()
    }, []);

    const fetchPublications = async () => {
        const result = await getPublicationsForAdmin()
        if (result.success) {
            setPublications(result.data)
            setIsLoading(false)
        }
    }

    const fetchDeletePublication = async (id) => {
        const result = await deletePublicationById(id)
        if (result.success) {
            setPublications(prevPublications => prevPublications.filter(publication => publication.id !== id))
        }
    }

    const fetchVisibleChange = async (id, data) => {
        const result = await putPublicationVisible(id, data)
        if (result.success) {
            setPublications(prevPublications => prevPublications.map(publication => publication.id === id ? { ...publication, ...data } : publication))
        }
    }

    const handleDeleteClick = async ({ id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_publications') : t('delete_publication'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeletePublication(id);
        }
        dispatch(closeModal());
    }

    const handleVisibleChange = async ({ id, isVisible, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: !isVisible ? (isMulti ? t('rem_published_publications') : t('rem_published_publication')) :
                (isMulti ? t('published_publications') : t('published_publication')),
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
                    {t('publications')}
                </h1>
                <Link href={`/${locale}/admin/publications/create`}
                    prefetch={false}
                    className="w-fit sm:px-8 px-2 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600">
                    {t('create_publication')}
                </Link>
            </div>
            <ObjectsView _objects={publications} onDeleteClick={handleDeleteClick} objectType='publications'
                pathname='' visibilityControl={true} languageChanger={true}
                onVisibleChange={handleVisibleChange} isLoading={isLoading} />
        </div>
    )
}
