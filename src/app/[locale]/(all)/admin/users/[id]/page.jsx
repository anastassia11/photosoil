'use client'

import { getAccount } from '@/api/account/get_account';
import { deleteAuthor } from '@/api/author/delete_author';
import { deleteEcosystemById } from '@/api/ecosystem/delete_ecosystem';
import { putEcosystemVisible } from '@/api/ecosystem/put_ecosystemVisible';
import { deletePublicationById } from '@/api/publication/delete_publication';
import { putPublicationVisible } from '@/api/publication/put_publicationVisible';
import { deleteSoilById } from '@/api/soil/delete_soil';
import { putSoilVisible } from '@/api/soil/put_soilVisible';
import ObjectsView from '@/components/admin-panel/ObjectsView';
import { useTranslation } from '@/i18n/client';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { useParams, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';

export default function AccountPage({ params: { id } }) {
    const dispatch = useDispatch();
    const [user, setUser] = useState({});
    const [userObjects, setUserObjects] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filteredObjects, setFilteredObjects] = useState([]);
    const { locale } = useParams();
    const { t } = useTranslation(locale);

    const FILTERS = [
        { title: t('soils'), name: 'objects' },
        { title: t('ecosystems'), name: 'ecosystems' },
        { title: t('publications'), name: 'publications' },
        { title: t('news'), name: 'news' },
    ];

    useEffect(() => {
        fetchAccount();
    }, [])

    useEffect(() => {
        setFilteredObjects(prev => userObjects.filter(object => selectedFilters.includes(object?.type?.name)));
    }, [selectedFilters, userObjects]);

    const fetchAccount = async () => {
        const result = await getAccount(id);
        if (result.success) {
            let userData = result.data;
            let _userObjects = [...userData.soilObjects.flatMap(({ translations }) =>
                translations.map(translation => ({
                    ...translation,
                    type: FILTERS.find(({ name }) => name === 'objects')
                }))),
            ...userData.ecoSystems.flatMap(({ translations }) =>
                translations.map(translation => ({
                    ...translation,
                    type: FILTERS.find(({ name }) => name === 'ecosystems')
                }))),
            ...userData.publications.flatMap(({ translations }) =>
                translations.map(translation => ({
                    ...translation,
                    type: FILTERS.find(({ name }) => name === 'publications')
                }))),
            ...userData.news.flatMap(({ translations }) =>
                translations.map(translation => ({
                    ...translation,
                    type: FILTERS.find(({ name }) => name === 'news')
                }))),
            ]
            setUser(userData);
            setUserObjects(_userObjects);
            setSelectedFilters(FILTERS.map(({ name }) => name))
        }
    }

    const handleFilterSelect = (e) => {
        const { name, checked } = e.target;
        checked ? setSelectedFilters(prevFilters => [...prevFilters, name])
            : setSelectedFilters(prevFilters => prevFilters.filter(filterName => filterName !== name))
    }

    const handleAllCheck = () => {
        selectedFilters.length === FILTERS.length ? setSelectedFilters([])
            : setSelectedFilters(FILTERS.map(({ name }) => name))
    }

    const fetchObjectDelete = async (type, id) => {
        let result;
        switch (type) {
            case 'objects':
                result = await deleteSoilById(id);
                break;
            case 'ecosystems':
                result = await deleteEcosystemById(id);
                break;
            case 'publications':
                result = await deletePublicationById(id);
                break;
        }
        if (result?.success) {
            setUserObjects(prevObjects => prevObjects.filter(object => (object.type.name !== type) || (object.id !== id)))
        }
    }

    const fetchVisibleChange = async (type, id, data) => {
        let result;
        switch (type) {
            case 'objects':
                result = await putSoilVisible(id, data);
                break;
            case 'ecosystems':
                result = await putEcosystemVisible(id, data);
                break;
            case 'publications':
                result = await putPublicationVisible(id, data);
                break;
        }
        if (result?.success) {
            setUserObjects(prevObjects => prevObjects.map(object => (object.type.name === type) && (object.id === id) ? { ...object, ...data } : object))
        }
    }


    const handleDeleteClick = async ({ type, id, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: isMulti ? t('delete_objects') : t('delete_object'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchObjectDelete(type, id);
        }
        dispatch(closeModal());
    }

    const handleVisibleChange = async ({ id, type, isVisible, isMulti }) => {
        dispatch(openModal({
            title: t('warning'),
            message: !isVisible ? (isMulti ? t('rem_published_objects') : t('rem_published_object')) :
                (isMulti ? t('published_objects') : t('published_object')),
            buttonText: t('confirm')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchVisibleChange(type, id, { isVisible });
        }
        dispatch(closeModal());
    }

    return (
        <div className="flex flex-col w-full space-y-4 ">
            <div className='flex flex-row items-center justify-between mb-2'>
                <h1 className='sm:text-2xl text-xl font-semibold'>
                    {t('user_objects')} <span className='text-blue-700'>{user.email}</span> {user.name && `(${user.name})`}
                </h1>
            </div>

            <button className="text-gray-900 underline underline-offset-4 w-fit"
                onClick={handleAllCheck}>
                {selectedFilters.length === FILTERS.length ? t('reset_all') : t('select_all')}
            </button>

            <ul className='flex flex-row flex-wrap'>
                {FILTERS.map(({ title, name }) => <li key={name}>
                    <label htmlFor={`Item${name}`} className="flex flex-row cursor-pointer mr-12 mb-4 select-none">
                        <input type="checkbox" id={`Item${name}`}
                            name={name}
                            checked={selectedFilters.includes(name)}
                            onChange={handleFilterSelect}
                            className="cursor-pointer min-w-5 w-5 min-h-5 h-5 mr-1 rounded border-gray-300 " />
                        <span className="text-gray-700">{title}</span>
                    </label>
                </li>)}
            </ul>
            <ObjectsView _objects={filteredObjects} pathname='' onVisibleChange={handleVisibleChange}
                visibilityControl={true} languageChanger={true}
                onDeleteClick={handleDeleteClick}
                objectType='userPage' />
        </div>
    )
}
