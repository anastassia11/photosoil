'use client'

import { useDispatch, useSelector } from 'react-redux';
import Filter from '../soils/Filter'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { sendPhoto } from '@/api/photo/send_photo';
import { getAuthors } from '@/api/author/get_authors';
import Dropdown from './ui-kit/Dropdown';
import DragAndDrop from './ui-kit/DragAndDrop';
import { deletePhotoById } from '@/api/photo/delete_photo';
import uuid from 'react-uuid';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import { useConstants } from '@/hooks/useConstants';
import modalThunkActions from '@/store/thunks/modalThunk';
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems';
import { getBasePublications } from '@/api/publication/get_base_publications';
import { getBaseSoils } from '@/api/soil/get_base_soils';
import MapSelect from '../map/MapSelect';
import Input from './ui-kit/Input';
import Textarea from './ui-kit/Textarea';
import PhotoCard from './ui-kit/PhotoCard';
import { getClassifications } from '@/api/classification/get_classifications';
import { useParams } from 'next/navigation';
import { getTranslation } from '@/i18n/client';
import TextEditor from './TextEditor';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import LangTabs from './ui-kit/LangTabs';
import { openAlert } from '@/store/slices/alertSlice';
import { setDirty } from '@/store/slices/formSlice';

function ObjectForm({ id, oldTwoLang, oldIsEng, pathname, type, item }, ref) {
    const dispatch = useDispatch();
    const { locale } = useParams();
    const { t } = getTranslation(locale);
    const dropdown = useSelector(state => state.general.dropdown);

    const defaultValues = {
        translations: [{ isEnglish: false }],
        createTwoLang: false,
        currentLang: false,
        objectType: 1,
        latitude: '',
        longtitude: '',
        // externalSource: '',
        objectPhoto: [],
        authors: [],
        soilTerms: [],
        ecoSystems: [],
        publications: [],
        soilObjects: [],
        mainPhoto: {}
    }
    const { register, reset, control, watch, trigger, setValue, setFocus,
        formState: { errors, isDirty } } = useForm({ mode: 'onChange', defaultValues });
    const { fields: translationsFields, append: appendTranslation } = useFieldArray({
        control,
        name: 'translations'
    });

    const formValues = watch();
    const translations = watch('translations');
    const isExternal = watch('isExternal');

    const createTwoLang = watch('createTwoLang');
    const isEng = watch('currentLang');
    const objectPhoto = watch('objectPhoto');

    const [localObjectPhoto, setLocalObjectPhoto] = useState([]);

    const [classifications, setClassifications] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [ecosystems, setEcosystems] = useState([]);
    const [soils, setSoils] = useState([]);
    const [publications, setPublications] = useState([]);
    const { SOIL_INFO, ECOSYSTEM_INFO, SOIL_ENUM } = useConstants();

    const INFO = type === 'soil' ? SOIL_INFO : type === 'ecosystem' ? ECOSYSTEM_INFO : {};

    useImperativeHandle(ref, () => ({
        updateState, formCheck
    }))

    useEffect(() => {
        fetchAuthors();
        fetchPublications()
        if (type === 'soil') {
            fetchClassifications();
            fetchEcosystems();
        } else if (type === 'ecosystem') {
            fetchSoils();
        }
    }, [])

    useEffect(() => {
        if (item) {
            reset({
                ...defaultValues,
                ...item
            });
            item.objectPhoto ? setLocalObjectPhoto(item.objectPhoto) : setLocalObjectPhoto([]);
        }
    }, [item, reset])

    useEffect(() => {
        dispatch(setDirty(isDirty));
    }, [isDirty]);

    const fetchClassifications = async () => {
        const result = await getClassifications();
        if (result.success) {
            setClassifications(result.data.sort((a, b) => a.order - b.order));
        }
    }

    const fetchAuthors = async () => {
        const result = await getAuthors();
        if (result.success) {
            setAuthors(result.data);
        }
    }

    const fetchSoils = async () => {
        const result = await getBaseSoils();
        if (result.success) {
            setSoils(result.data);
        }
    }

    const fetchEcosystems = async () => {
        const result = await getBaseEcosystems();
        if (result.success) {
            setEcosystems(result.data);
        }
    }

    const fetchPublications = async () => {
        const result = await getBasePublications();
        if (result.success) {
            setPublications(result.data);
        }
    }

    const updateState = () => {
        return formValues;
    }

    const handleOtherPhotoSend = useCallback(async (file, index, field) => {
        setLocalObjectPhoto(prev => {
            const _prev = [...prev, { isLoading: true }];
            field.onChange(_prev);
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
                field.onChange(_prev);
                return _prev
            })
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_photo'), type: 'error' }))
        }
    }, [localObjectPhoto, dispatch, t])

    const handleMainPhotoSend = useCallback(async (file, field) => {
        field.onChange({ isLoading: true, name: file.name });
        const result = await sendPhoto(file);
        if (result.success) {
            field.onChange({ ...result.data, isLoading: false });
        } else {
            dispatch(openAlert({ title: t('error'), message: t('error_photo'), type: 'error' }))
        }
    }, [])

    const handleCoordChange = useCallback(({ latitude, longtitude }) => {
        setValue('latitude', latitude);
        setValue('longtitude', longtitude);
    }, [])

    const handleOtherPhotosChange = useCallback((e, id, field) => {
        setLocalObjectPhoto(prev => {
            const _prev = prev.map(photo => photo.id === id
                ? { ...photo, [isEng ? 'titleEng' : 'titleRu']: e.target.value }
                : photo);
            field.onChange(_prev);
            return _prev;
        });
    }, [isEng])

    const handleMainPhotoDelete = useCallback(async (id, field) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            const newId = uuid();
            field.onChange({ id: newId });
            if (pathname !== 'edit') {
                await deletePhotoById(id);
            }
        }
        dispatch(closeModal());
    }, [dispatch, t])

    const handleOtherPhotoDelete = useCallback(async (id, field) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_photo'),
            buttonText: t('delete'),
            type: 'delete'
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            if (pathname !== 'edit') {
                await deletePhotoById(id);
            }
            setLocalObjectPhoto(prev => {
                const _prev = prev.filter(photo => photo.id !== id);
                field.onChange(_prev);
                return _prev;
            });
        }
        dispatch(closeModal());
    }, [pathname, dispatch, t, localObjectPhoto])

    const handleTwoLangChange = (e) => {
        const isChecked = e.target.checked;
        if (pathname === 'edit') {
            if (isChecked) {
                if (translations?.length < 2) {
                    appendTranslation({ isEnglish: !isEng });
                }
            } else {
                setValue('currentLang', oldIsEng);
            }
        } else {
            if (translations?.length < 2) {
                appendTranslation({ isEnglish: !isEng });
            }
        }
        setValue('createTwoLang', isChecked);
    }

    const handleLangChange = (value) => {
        setValue('currentLang', value);
    }

    const formCheck = async () => {
        const result = await trigger();
        if (!result) {
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField === 'translations') {
                for (const [index, transl] of errors.translations.entries()) {
                    if (!!transl) {
                        setValue('currentLang', translations[index].isEnglish);
                        const firstErrorField = Object.keys(transl)[0];
                        await new Promise((resolve) => setTimeout(resolve, 10));
                        setFocus(`translations.${index}.${firstErrorField}`);
                        break;
                    }
                }
            } else {
                setFocus(firstErrorField);
                const element = document.getElementById(firstErrorField);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return { valid: false };
        } else {
            return { valid: true };
        };
    };

    return (
        <form className={`flex flex-col w-full h-fit max-h-full ${pathname !== 'edit' ? 'pb-[200px]' : 'pb-16'}`}>
            <div className='flex flex-col w-full h-full'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-x-4 w-full'>
                    <LangTabs
                        isEng={isEng}
                        oldIsEng={oldIsEng}
                        createTwoLang={createTwoLang}
                        oldTwoLang={oldTwoLang}
                        isEdit={pathname === 'edit'}
                        onLangChange={handleLangChange}
                        onTwoLangChange={handleTwoLangChange} />

                    <div className='flex flex-col w-full mt-4'>
                        {translationsFields.map((field, index) =>
                            <div key={field.id} className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                <Input
                                    required={createTwoLang || (field.isEnglish === isEng)}
                                    error={errors.translations?.[index]?.name}
                                    label={t('title')}
                                    isEng={isEng}
                                    {...register(`translations.${index}.name`,
                                        { required: createTwoLang || (field.isEnglish === isEng) ? t('required') : false })}
                                />
                            </div>
                        )}

                        {type === 'soil' && <div className='mt-3'>
                            <Controller control={control}
                                name='objectType'
                                render={({ field: { onChange, value } }) =>
                                    <Dropdown name={t('objectType')} value={value}
                                        items={SOIL_ENUM} onCategotyChange={(type) => onChange(Number(type))} dropdownKey='category' />
                                } />
                        </div>}

                        <ul className='flex flex-col w-full'>
                            {INFO.map(({ name, title }) =>
                                name !== 'objectType' && name !== 'comments'
                                && <li key={name} className={`mt-3`}>
                                    {translationsFields.map((field, index) =>
                                        <div key={field.id} className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                            {
                                                name === 'soilFeatures' || name === 'description'
                                                    ? <Textarea
                                                        required={false}
                                                        {...register(`translations.${index}.${name}`)}
                                                        label={title}
                                                        isEng={isEng}
                                                        placeholder='' />
                                                    : <Input
                                                        required={false}
                                                        error={errors.translations?.[index]?.[name]}
                                                        label={title}
                                                        isEng={isEng}
                                                        {...register(`translations.${index}.${name}`)}
                                                    />
                                            }
                                        </div>
                                    )}
                                </li>
                            )}

                            <li key='authors' className={`mt-3 ${isExternal ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Controller control={control}
                                    name='authors'
                                    render={({ field: { value, onChange } }) =>
                                        <Filter dropdown={dropdown}
                                            name={t('authors')} items={authors}
                                            type='authors' itemId={`author`}
                                            allSelectedItems={value} isEng={isEng}
                                            addItem={newItem => onChange([...value, newItem])}
                                            deleteItem={deletedItem => onChange(value.filter(item => item !== deletedItem))}
                                            resetItems={deletedItems => value.filter(item => !deletedItems.includes(item))}
                                        />
                                    } />
                            </li>
                            <label htmlFor='isExternal'
                                className={`font-medium select-none mt-3 flex flex-row cursor-pointer items-center`}>
                                <input type="checkbox" id='isExternal'
                                    {...register(`isExternal`)}
                                    className="cursor-pointer min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                                <span>{`${t('isExternal')} ${isEng ? '(EN)' : ''}`}</span>
                            </label>
                            <div className={`${isExternal ? 'visible' : 'invisible opacity-0 max-h-0 overflow-hidden'} duration-300
                            w-full relative mt-2 `}>
                                {translationsFields.map((field, index) =>
                                    <div key={field.id} className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                        <Controller control={control}
                                            name={`translations.${index}.externalSource`}
                                            render={({ field: { onChange, value } }) =>
                                                <TextEditor
                                                    type={`externalSource`}
                                                    content={value}
                                                    isSoil={true}
                                                    setContent={html => onChange(html)} />} />
                                    </div>)}
                            </div>
                        </ul>
                    </div>

                    <div className='flex flex-col w-full xl:h-[528px] md:h-[500px] h-[400px] mt-4'>
                        <label className="font-medium">
                            {t('in_map')}
                        </label>
                        <ul className='flex flex-row mb-2 w-full space-x-3'>
                            {
                                ['latitude', 'longtitude'].map(param => <li key={param} className='w-full'>
                                    <Input
                                        required={false}
                                        error={errors[param]}
                                        placeholder={param.charAt(0).toUpperCase() + param.slice(1)}
                                        isEng={isEng}
                                        type='number'
                                        {...register(param)}
                                    />
                                </li>)
                            }
                        </ul>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-1 w-full h-full'>
                            <MapSelect id={id} type={type} latitude={watch('latitude')} longtitude={watch('longtitude')}
                                onCoordinateChange={handleCoordChange} />
                        </div>
                    </div>


                    <div className='md:col-span-2'>
                        <>
                            <p className='font-medium mt-8'>{`${t('comments')} ${isEng ? '(EN)' : ''}`}</p>
                            {
                                translationsFields.map((field, index) =>
                                    <div key={field.id} className={`${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                        <Controller control={control}
                                            name={`translations.${index}.comments`}
                                            render={({ field: { onChange, value } }) =>
                                                <div className={`w-full relative mt-1 mb-2`}>
                                                    <TextEditor type={`comments-${field.id}`}
                                                        content={value}
                                                        isSoil={true}
                                                        setContent={html => onChange(html)} />
                                                </div>
                                            } />
                                    </div>)
                            }
                        </>

                        <div>
                            <p className='font-medium mt-8'>{t('main_photo')}<span className='text-orange-500'>*</span></p>
                            <Controller control={control}
                                name='mainPhoto'
                                rules={{
                                    required: t('required'),
                                    validate: {
                                        hasPath: value => value?.path ? true : t('required')
                                    }
                                }}
                                render={({ field, fieldState }) =>
                                    <div className='md:w-[50%] w-full pr-2 mt-1'>
                                        {field.value?.isLoading || field.value?.path
                                            ? <PhotoCard {...field.value} isEng={isEng}
                                                onDelete={id => handleMainPhotoDelete(id, field)}
                                                onChange={e => field.onChange({ ...field.value, [isEng ? 'titleEng' : 'titleRu']: e.target.value })} />
                                            : <div className='h-[150px]'>
                                                <DragAndDrop id='mainPhoto'
                                                    error={fieldState.error}
                                                    onLoadClick={file => handleMainPhotoSend(file, field)}
                                                    isMultiple={false}
                                                    accept='img' />
                                            </div>}
                                    </div>}
                            />
                        </div>


                        <div className='mt-8 flex flex-col'>
                            <p className='font-medium'>{t('other_photos')}</p>
                            <Controller control={control}
                                name='objectPhoto'
                                render={({ field, fieldState }) =>
                                    <ul className={`mt-1 grid md:grid-cols-2 grid-cols-1 gap-4 `}>
                                        {!!Object.keys(field.value).length && field.value.map((photo, idx) => <li key={`photo-${idx}`}>
                                            <PhotoCard {...photo} isEng={isEng}
                                                onDelete={id => handleOtherPhotoDelete(id, field)}
                                                onChange={(e, id) => handleOtherPhotosChange(e, id, field)} />
                                        </li>)}
                                        <div className='h-[150px]'>
                                            <DragAndDrop id='objectPhoto'
                                                error={fieldState.error}
                                                onLoadClick={(file, index) => handleOtherPhotoSend(file, index, field)}
                                                isMultiple={true}
                                                accept='img' />
                                        </div>
                                    </ul>}
                            />
                        </div>


                        {type === 'soil' && <>
                            <p className='font-medium mt-8'>{t('classifications')}</p>
                            <ul style={{
                                gridTemplateRows: `repeat(${Math.ceil(classifications.length / 2)}, minmax(0, 1fr))`
                            }}
                                className={`grid md:grid-cols-2 grid-cols-1 md:grid-flow-col
                                gap-4 w-full mt-1`}>
                                {classifications?.map(item => {
                                    const isVisible = item.translationMode == 0 || (isEng ? (item.translationMode == 1) : (item.translationMode == 2))
                                    if (isVisible) return <li key={`classification-${item.id}`}>
                                        <Controller control={control}
                                            name='soilTerms'
                                            render={({ field: { value, onChange } }) =>
                                                <Filter dropdown={dropdown}
                                                    name={isEng ? item.nameEng : item.nameRu} items={item.terms}
                                                    type='classif'
                                                    allSelectedItems={value} isEng={isEng}
                                                    addItem={newItem => onChange([...value, newItem])}
                                                    deleteItem={deletedItem => onChange(value.filter(item => item !== deletedItem))}
                                                    resetItems={deletedItems => value.filter(item => !deletedItems.includes(item))}
                                                />
                                            } />
                                    </li>
                                })}
                            </ul>
                        </>}

                        <p className='font-medium mt-8'>{t('connection')}</p>
                        <div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full mt-1'>
                            {type !== 'ecosystem' && <Controller control={control}
                                name='ecoSystems'
                                render={({ field: { value, onChange } }) =>
                                    <Filter dropdown={dropdown}
                                        name={t('ecosystems')} items={ecosystems}
                                        type='ecosystem'
                                        allSelectedItems={value} isEng={isEng}
                                        addItem={newItem => onChange([...value, newItem])}
                                        deleteItem={deletedItem => onChange(value.filter(item => item !== deletedItem))}
                                        resetItems={() => onChange([])}
                                    />
                                } />
                            }

                            {type !== 'soil' && <Controller control={control}
                                name='soilObjects'
                                render={({ field: { value, onChange } }) =>
                                    <Filter dropdown={dropdown}
                                        name={t('soils')} items={soils}
                                        type='soil'
                                        allSelectedItems={value} isEng={isEng}
                                        addItem={newItem => onChange([...value, newItem])}
                                        deleteItem={deletedItem => onChange(value.filter(item => item !== deletedItem))}
                                        resetItems={() => onChange([])}
                                    />
                                } />
                            }

                            <Controller control={control}
                                name='publications'
                                render={({ field: { value, onChange } }) =>
                                    <Filter dropdown={dropdown}
                                        name={t('publications')} items={publications}
                                        type='publications'
                                        allSelectedItems={value} isEng={isEng}
                                        addItem={newItem => onChange([...value, newItem])}
                                        deleteItem={deletedItem => onChange(value.filter(item => item !== deletedItem))}
                                        resetItems={() => onChange([])}
                                    />
                                } />
                        </div>

                        {translationsFields.map((field, index) =>
                            <div key={field.id} className={`mt-8 md:w-[50%] w-full md:pr-2 pr-0
                                        ${field.isEnglish === isEng ? 'visible' : 'hidden'}`}>
                                <Input
                                    required={false}
                                    error={errors.translations?.[index]?.code}
                                    label={t('code')}
                                    isEng={isEng}
                                    {...register(`translations.${index}.code`)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form >
    )
}
export default forwardRef(ObjectForm);
