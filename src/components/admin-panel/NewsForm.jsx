'use client'

import { useCallback, useEffect, useState } from 'react'
import DragAndDrop from './ui-kit/DragAndDrop';
import { sendPhoto } from '@/api/photo/send_photo';
import TextEditor from './TextEditor';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { useDispatch, useSelector } from 'react-redux';
import { deletePhotoById } from '@/api/photo/delete_photo';
import Filter from '../soils/Filter';
import { getTags } from '@/api/tags/get_tags';
import Textarea from './ui-kit/Textarea';
import PhotoCard from './ui-kit/PhotoCard';
import FileCard from './ui-kit/FileCard';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import { openAlert } from '@/store/slices/alertSlice';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import LangTabs from './ui-kit/LangTabs';
import SubmitBtn from './ui-kit/SubmitBtn';
import { useConstants } from '@/hooks/useConstants';
import { setDirty } from '@/store/slices/formSlice';

export default function NewsForm({ _news, title, pathname, onNewsSubmit, btnText, oldTwoLang, oldIsEng }) {
    const dispatch = useDispatch();
    const { register, reset, control, watch, trigger, setValue, getValues, setFocus,
        formState: { errors, isSubmitting, isDirty } } = useForm({
            mode: 'onChange',
            defaultValues: {
                translations: [{
                    isEnglish: false,
                    annotation: '',
                    content: '',
                    title: '',
                }],
                tags: [],
                objectPhoto: [],
                files: []
            }
        });
    const { fields: translationsFields, append: appendTranslation } = useFieldArray({
        control,
        name: 'translations'
    });
    const translations = watch('translations');
    const objectPhoto = watch('objectPhoto')
    const files = watch('files');
    const [localObjectPhoto, setLocalObjectPhoto] = useState(objectPhoto);
    const [localFiles, setLocalFiles] = useState(files);
    const [tags, setTags] = useState([]);

    const dropdown = useSelector(state => state.general.dropdown);
    const [isEng, setIsEng] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    const { NEWS_INFO } = useConstants();

    useEffect(() => {
        if (_news) {
            reset({
                ..._news,
                tags: _news.tags?.map(({ id }) => id),
            });
            setIsEng(oldIsEng);
            setCreateTwoLang(_news.translations?.length > 1);
        }
    }, [_news])

    useEffect(() => {
        fetchTags();
    }, [])

    useEffect(() => {
        dispatch(setDirty(isDirty));
    }, [isDirty]);

    const fetchTags = async () => {
        const result = await getTags();
        if (result.success) {
            setTags(result.data);
        }
    }

    const handleTwoLangChange = (e) => {
        const isChecked = e.target.checked;
        if (pathname === 'edit') {
            if (isChecked) {
                if (translations?.length < 2) {
                    appendTranslation({ isEnglish: !isEng });
                }
            } else {
                setIsEng(oldIsEng);
            }
        } else {
            if (translations?.length < 2) {
                appendTranslation({ isEnglish: !isEng });
            }
        }
        setCreateTwoLang(isChecked);
    }

    const handleLangChange = (value) => {
        setIsEng(value);
    }

    const handleNewsPhotoSend = async (file, index) => {
        setLocalObjectPhoto(prev => {
            const _prev = [...prev, { isLoading: true }];
            setValue('objectPhoto', _prev);
            return _prev;
        });

        const result = await sendPhoto(file);
        if (result.success) {
            setLocalObjectPhoto(prev => {
                const _prev = prev.map((photo, idx) =>
                    idx === index + localObjectPhoto.length
                        ? { ...result.data, isLoading: false }
                        : photo
                )
                setValue('objectPhoto', _prev);
                return _prev
            })
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_photo'), type: 'error' }))
        }
    }

    const handleFilesSend = async (file, index) => {
        setLocalFiles(prev => {
            const _prev = [...prev, { isLoading: true, name: file.name }];
            setValue('files', _prev);
            return _prev;
        });

        const result = await sendPhoto(file);
        if (result.success) {
            setLocalFiles(prev => {
                const _prev = prev.map((file, idx) =>
                    idx === index + localFiles.length
                        ? { ...result.data, isLoading: false }
                        : file
                )
                setValue('files', _prev);
                return _prev
            })
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_file'), type: 'error' }));
            setLocalFiles(prev => {
                const _prev = prev.filter((file, idx) => idx !== index);
                setValue('files', _prev);
                return _prev;
            });
        }
    }

    const newsPhotoDelete = async (id) => {
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id)
        }
        if (pathname === 'edit' || result.success) {
            setLocalObjectPhoto(prev => {
                const _prev = prev.filter(photo => photo.id !== id);
                setValue('objectPhoto', _prev);
                return _prev;
            });
        }
    }

    const deleteFile = async (id) => {
        let result;
        if (pathname !== 'edit') {
            result = await deletePhotoById(id);
        }
        if (pathname === 'edit' || result.success) {
            setValue('files', files.filter(file => file.id !== id));
        }
    }

    const handleNewsPhotoDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await newsPhotoDelete(id);
        }
        dispatch(closeModal());
    }

    const handleFileDelete = async (id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_file'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await deleteFile(id);
        }
        dispatch(closeModal());
    }

    const handleNewsPhotosChange = (e, id) => {
        setLocalObjectPhoto(prev => {
            const _prev = prev.map(photo => photo.id === id
                ? { ...photo, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
                : photo);
            setValue('objectPhoto', _prev);
            return _prev;
        });
    }

    const handleAddTag = useCallback((newItem) => {
        const values = getValues('tags');
        setValue('tags', [...values, newItem]);
    }, [])

    const handleDeleteTag = useCallback((deletedItem) => {
        const values = getValues('tags');
        setValue('tags', values.filter(value => value !== deletedItem));
    }, [])

    const handleResetTag = useCallback(() => {
        setValue('tags', []);
    }, [])

    const formSubmit = async (e) => {
        e.preventDefault();
        const result = await trigger();
        if (result) {
            const data = getValues();
            const news = {
                ...data,
                files: data.files.map(({ id }) => id),
                objectPhoto: data.objectPhoto.map(({ id }) => id),
            };
            await onNewsSubmit({ createTwoLang, isEng, news, newsPhotos: data.objectPhoto });
        } else {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField === 'translations') {
                for (const [index, transl] of errors.translations.entries()) {
                    if (!!transl) {
                        setIsEng(translations[index].isEnglish);
                        const firstErrorField = Object.keys(transl)[0];
                        await new Promise((resolve) => setTimeout(resolve, 10));
                        setFocus(`translations.${index}.${firstErrorField}`);
                        break;
                    }
                }
            } else {
                setFocus(firstErrorField);
            }
        }
    };

    return (
        <form onSubmit={formSubmit} className="flex flex-col w-full flex-1 pb-[250px]">
            <div
                className='mb-2 flex md:flex-row flex-col md:items-end md:justify-between space-y-1 md:space-y-0'>
                <h1 className='sm:text-2xl text-xl font-semibold mb-2 md:mb-0'>
                    {title}
                </h1>
                <div className='md:min-w-[200px] md:w-fit'>
                    <SubmitBtn isSubmitting={isSubmitting} btnText={btnText} />
                </div>
            </div>

            <div className="flex flex-col w-full h-fit pb-16">
                <div className='flex flex-col w-full h-full'>
                    <LangTabs
                        isEng={isEng}
                        oldIsEng={oldIsEng}
                        createTwoLang={createTwoLang}
                        oldTwoLang={oldTwoLang}
                        isEdit={pathname === 'edit'}
                        onLangChange={handleLangChange}
                        onTwoLangChange={handleTwoLangChange} />
                    <ul className='flex flex-col w-full mt-4'>
                        {NEWS_INFO.map(({ name, title }, idx) => {
                            return <li key={name} className={`${idx && 'mt-3'}`}>
                                {translationsFields.map((field, index) =>
                                    <div key={field.id} className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                        {
                                            name === 'content'
                                                ? <Controller control={control}
                                                    name={`translations.${index}.${name}`}
                                                    render={({ field: { onChange, value } }) =>
                                                        <div className='mt-4 flex flex-col'>
                                                            <label className="font-medium min-h-fit">
                                                                {`${t('news_text')} ${isEng ? '(EN)' : ''}`}
                                                            </label>
                                                            <div className={`w-full relative`}>
                                                                <TextEditor type={`news-${field.id}`}
                                                                    content={value}
                                                                    setContent={html => onChange(html)} />
                                                            </div>
                                                        </div>
                                                    } />
                                                : <Textarea
                                                    required={name === 'title'}
                                                    error={errors.translations?.[index]?.[name]}
                                                    {...register(`translations.${index}.${name}`,
                                                        { required: (createTwoLang ? true : (field.isEnglish === isEng)) && name === 'title' ? t('required') : false })}
                                                    label={title}
                                                    isEng={isEng}
                                                    placeholder='' />}
                                    </div>
                                )}
                            </li>
                        })}
                    </ul>

                    <div className='mt-6 flex flex-col'>
                        <label className="font-medium min-h-fit">
                            {`${t('gallery')}`}
                        </label>
                        <Controller control={control}
                            name='objectPhoto'
                            render={({ field: { value }, fieldState }) =>
                                <ul className={`mt-1 grid md:grid-cols-2 grid-cols-1 gap-4 `}>
                                    {!!value.length && value.map((photo, idx) => <li key={`photo-${idx}`}>
                                        <PhotoCard {...photo} isEng={isEng}
                                            onDelete={handleNewsPhotoDelete}
                                            onChange={handleNewsPhotosChange} />
                                    </li>)}
                                    <div className='h-[150px]'>
                                        <DragAndDrop id='news-photos'
                                            error={fieldState.error}
                                            onLoadClick={handleNewsPhotoSend}
                                            isMultiple={true}
                                            accept='img' />
                                    </div>
                                </ul>}
                        />
                    </div>

                    <div className='mt-8 flex flex-col'>
                        <label className="font-medium min-h-fit">
                            {`${t('files')}`}
                        </label>
                        <Controller control={control}
                            name='files'
                            render={({ field: { value, id }, fieldState }) =>
                                <ul className={`mt-1 flex flex-col w-full`}>
                                    {!!value.length && value.map((file, idx) => <li key={`file-${idx}`}>
                                        <FileCard {...file} isEng={isEng}
                                            onDelete={() => handleFileDelete(file.id)} />
                                    </li>)}
                                    <div className={`h-[150px] md:w-[50%] w-full md:pr-2 pr-0 ${!!value.length && 'mt-4'}`}>
                                        <DragAndDrop id='news-files'
                                            error={fieldState.error}
                                            onLoadClick={handleFilesSend}
                                            isMultiple={true}
                                            accept='pdf' />
                                    </div>
                                </ul>}
                        />
                    </div>

                    <div className='mt-8 flex flex-col w-full md:w-1/2'>
                        <Controller control={control}
                            name='tags'
                            render={({ field: { value } }) =>
                                <Filter dropdown={dropdown}
                                    name={t('tags')} items={tags}
                                    type='tags'
                                    setTags={setTags}
                                    allSelectedItems={value} isEng={isEng}
                                    addItem={handleAddTag}
                                    deleteItem={handleDeleteTag}
                                    resetItems={handleResetTag}
                                />
                            } />
                    </div>
                </div>
            </div>
        </form >
    )
}
