'use client'

import { Oval } from 'react-loader-spinner'
import DragAndDrop from './ui-kit/DragAndDrop';
import { useEffect, useState } from 'react';
import { BASE_SERVER_URL } from '@/utils/constants';
import { sendPhoto } from '@/api/photo/send_photo';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useConstants } from '@/hooks/useConstants';
import Dropdown from './ui-kit/Dropdown';
import Input from './ui-kit/Input';
import { openAlert } from '@/store/slices/alertSlice';
import { useDispatch } from 'react-redux';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';

export default function AuthorForm({ _author, onFormSubmit, isLoading, btnText }) {
    const dispatch = useDispatch();
    const [author, setAuthor] = useState({});
    const [photo, setPhoto] = useState({});
    const [role, setRole] = useState(null);
    const { t } = useTranslation();
    const { AUTHOR_INFO, RANK_ENUM } = useConstants();

    useEffect(() => {
        localStorage.getItem('tokenData') && setRole(JSON.parse(localStorage.getItem('tokenData'))?.role)
    }, []);

    useEffect(() => {
        if (_author) {
            setAuthor(_author);
            setPhoto(_author.photo);
        }
    }, [_author]);

    const handleCreateAuthor = async (e) => {
        e.preventDefault();
        if (author.dataEng?.name?.length && author.dataRu?.name?.length && author.photoId) {
            onFormSubmit(author);
        } else {
            dispatch(openAlert({ title: t('warning'), message: t('form_required'), type: 'warning' }))
        }
    }

    const handleInputChange = (e, lang) => {
        const { name, value } = e.target;
        let data = lang === 'ru' ? 'dataRu' : 'dataEng'
        setAuthor(prev => ({ ...prev, [data]: { ...prev[data], [name]: value } }));
    }

    const handleFieldChange = (e, index) => {
        const { name, value } = e.target;
        setAuthor(prev => ({ ...prev, [name]: prev[name].map((item, idx) => index === idx ? value : item) }));
    }

    const handleDeleteField = (name, index) => {
        const updatedArray = author[name] ? [...author[name]] : [];
        updatedArray.splice(index, 1);
        setAuthor(prev => ({ ...prev, [name]: updatedArray }))
    }

    const handleAddField = (name) => {
        setAuthor(prev => ({
            ...prev,
            [name]: prev[name] ? [...prev[name], ''] : ['']
        }))
    }

    const handlePhotoDelete = async () => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            const updatedAuthor = JSON.parse(JSON.stringify(author));
            delete updatedAuthor.photoId;
            delete updatedAuthor.photo;

            setAuthor(updatedAuthor);
            setPhoto({});
        }
        dispatch(closeModal());
    }

    const fetchSendPhoto = async (file) => {
        const result = await sendPhoto(file);
        if (result.success) {
            setAuthor(prev => ({
                ...prev,
                'photoId': result.data.id
            }));
            setPhoto(result.data);
        }
    }

    const handleRankChange = (newRank) => {
        setAuthor(prev => ({ ...prev, authorType: Number(newRank) }));
    }

    const ArrayInput = ({ title, name }) => {
        return <div className='flex flex-col w-full '>
            <p className="font-medium">
                {title}
            </p>
            <ul>
                {author[name]?.map((item, index) => <li className='flex flex-row mb-1' key={`${name}_${index}`}>
                    <input
                        value={author[name][index] || ''}
                        onChange={(e) => handleFieldChange(e, index)}
                        name={name}
                        type="text"
                        className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                    />
                    <button type='button'
                        className='p-2'
                        onClick={() => handleDeleteField(name, index)}>
                        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                            <g id="Menu / Close_LG">
                                <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </svg>
                    </button>
                </li>
                )}
            </ul>
            <button type='button' className='font-medium text-blue-600 w-fit'
                onClick={() => handleAddField(name)}>
                <span className='text-2xl pr-2'>+</span>
                {t('add')}
            </button>
        </div>
    }

    return (
        <form
            onSubmit={handleCreateAuthor}
            className="flex flex-col items-start pb-16">
            <div className='flex sm:flex-row flex-col w-full 3xl:w-[50%]'>
                <div className='mt-4'>
                    <div className=''>
                        <p className="font-medium mb-1">
                            {t('photo')}<span className='text-orange-500'>*</span>
                        </p>
                        {photo?.path ? <div className='relative max-h-full rounded-md overflow-hidden'>
                            <button type='button' className='overflow-hidden p-[6px] text-sm font-medium z-10 absolute top-0 right-0 rounded-bl-md
                                backdrop-blur-md bg-black bg-opacity-40 text-zinc-200 hover:text-white duration-300'
                                onClick={handlePhotoDelete}>
                                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-4 h-4'>
                                    <g id="Menu / Close_LG">
                                        <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                </svg>
                            </button>
                            <Image src={`${BASE_SERVER_URL}${photo.path}`} height={370} width={370} alt='author photo'
                                className='object-cover rounded-md max-h-[370px] min-h-[370px] aspect-[3/4] overflow-hidden' />
                        </div> :
                            <div className='max-h-[370px] min-h-[370px] aspect-[3/4] overflow-hidden'>
                                <DragAndDrop onLoadClick={fetchSendPhoto} isMultiple={false} accept='img' />
                            </div>
                        }
                    </div>
                </div>
                <ul className='sm:pl-6 w-full space-y-4'>
                    {role === 'Admin' && <li key='rang' className='w-[285px] mt-4'>
                        <Dropdown name={t('rank')} value={(author.authorType !== undefined) ? author.authorType : 3} items={RANK_ENUM} onCategotyChange={handleRankChange} dropdownKey='rang' />
                    </li>}
                    {AUTHOR_INFO.map(item => <li key={item.name}>
                        {item.isArray && ArrayInput({ ...item })}
                    </li>)}
                </ul>
            </div>

            <div className='flex xl:flex-row flex-col w-full mt-8'>
                <ul className='space-y-3 xl:w-[50%] xl:pr-6 xl:border-r'>
                    <p className='text-blue-700 font-semibold'>Русская версия</p>
                    {AUTHOR_INFO.map(({ name, isArray, title }) => <li key={name}>
                        {!isArray && Input({
                            required: name === 'name',
                            label: title,
                            name: name,
                            value: author.dataRu?.[name] || '',
                            onChange: e => handleInputChange(e, 'ru')
                        })}
                    </li>)}
                </ul>
                <ul className='space-y-3 xl:w-[50%] xl:pl-6 xl:mt-0 mt-6'>
                    <p className='text-blue-700 font-semibold'>English version</p>
                    {AUTHOR_INFO.map(({ name, isArray, title }) => <li key={name}>
                        {!isArray && Input({
                            required: name === 'name',
                            label: title,
                            isEng: true,
                            name: name,
                            value: author.dataEng?.[name] || '',
                            onChange: e => handleInputChange(e, 'eng')
                        })}
                    </li>)}
                </ul>
            </div>

            <button
                type='submit'
                disabled={isLoading}
                className="self-end min-w-[200px] mt-6 min-h-[40px] w-fit flex items-center justify-center px-8 py-2 font-medium text-center text-white transition-colors duration-300 
                transform bg-blue-600 disabled:bg-blue-600/70 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 align-bottom">
                {isLoading ?
                    <Oval
                        height={20}
                        width={20}
                        color="#FFFFFF"
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#FFFFFF"
                        strokeWidth={4}
                        strokeWidthSecondary={4} />
                    : btnText}
            </button>
        </form>
    )
}
