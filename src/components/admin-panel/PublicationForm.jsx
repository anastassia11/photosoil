'use client'

import { useEffect, useRef, useState } from 'react'
import Dropdown from './ui-kit/Dropdown';
import { BASE_SERVER_URL } from '@/utils/constants';
import DragAndDrop from './ui-kit/DragAndDrop';
import { Oval } from 'react-loader-spinner';
import { sendPhoto } from '@/api/photo/send_photo';
import * as Tabs from "@radix-ui/react-tabs";
import { useConstants } from '@/hooks/useConstants';
import Filter from '../soils/Filter';
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems';
import { getBaseSoils } from '@/api/soil/get_base_soils';
import MapArraySelect from '../map/MapArraySelect';
import { closeModal, openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { useDispatch } from 'react-redux';
import Input from './ui-kit/Input';
import MapInput from './ui-kit/MapInput';
import Textarea from './ui-kit/Textarea';
import FileCard from './ui-kit/FileCard';
import { openAlert } from '@/store/slices/alertSlice';
import { useTranslation } from '@/i18n/client';

export default function PublicationForm({ _publication, pathname, onPublicationSubmit, isLoading, btnText, oldTwoLang, oldIsEng }) {
    const [publication, setPublication] = useState({});
    const [file, setFile] = useState({});
    const [isEng, setIsEng] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const [ecosystems, setEcosystems] = useState([]);
    const [soils, setSoils] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [currentCoord, setCurrentCoord] = useState({});
    const { locale } = useParams();
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const { t } = useTranslation(locale);
    const { PUBLICATION_INFO, PUBLICATION_ENUM } = useConstants();

    useEffect(() => {
        fetchEcosystems();
        fetchSoils();
    }, [])

    useEffect(() => {
        if (_publication) {
            setPublication({ ..._publication, fileId: _publication.file?.id });
            setCoordinates(_publication.coordinates ? JSON.parse(_publication.coordinates) : []);
            _publication.file && setFile(_publication.file);
            setIsEng(oldIsEng);
            setCreateTwoLang(_publication.translations?.length > 1);
        } else {
            setPublication({ translations: [{ isEnglish: false }] });
        }
    }, [_publication])

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

    const handleInputChange = (e) => {
        const { value, name } = e.target;
        setPublication(prevPubl => {
            const _prevPubl = name === 'doi' ? { ...prevPubl, [name]: value } : {
                ...prevPubl, translations: prevPubl.translations.map(translation =>
                    translation.isEnglish === isEng ? { ...translation, [name]: value } : translation)
            }
            return _prevPubl;
        });
    }

    const handleTypeChange = (id) => {
        setPublication(prev => ({ ...prev, type: Number(id) }));
    }

    const handleFileLoad = async (file) => {
        setFile({ isLoading: true, name: file.name });
        const result = await sendPhoto(file);
        if (result.success) {
            setPublication(prev => ({ ...prev, fileId: result.data.id }));
            setFile({ ...result.data, isLoading: false });
        }
    }

    const handleFileDelete = async (e) => {
        e.stopPropagation();
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_file'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            const _publication = { ...publication };
            delete _publication.fileId;
            delete _publication.file;
            setPublication(_publication);
            setFile({});
        }
        dispatch(closeModal());
    }

    const handleTwoLangChange = (e) => {
        if (pathname === 'edit') {
            if (e.target.checked) {
                if (publication.translations?.length < 2) {
                    setPublication(prevPubl => ({ ...prevPubl, translations: [...prevPubl.translations, { isEnglish: !isEng }] }));
                }
            } else {
                setIsEng(oldIsEng);
            }
        } else {
            if (publication.translations?.length < 2) {
                setPublication(prevPubl => ({ ...prevPubl, translations: [...prevPubl.translations, { isEnglish: !isEng }] }));
            }
        }
        setCreateTwoLang(e.target.checked);
    }

    const handleLangChange = (value) => {
        setIsEng(value);
    }

    const handleAddTerm = (type, newItem) => {
        setPublication(prevPubl => ({ ...prevPubl, [type]: prevPubl[type] ? [...prevPubl[type], newItem] : [newItem] }));
    }

    const handleDeleteTerm = (type, deletedItem) => {
        setPublication(prevPubl => ({ ...prevPubl, [type]: prevPubl[type]?.filter(id => id !== deletedItem) }));
    }

    const handleResetTerms = (type, deletedItems) => {
        setPublication(prevPubl => ({ ...prevPubl, [type]: prevPubl[type].filter(id => !deletedItems.includes(id)) }));
    }

    const handleCoordChange = ({ latitude, longtitude }) => {
        setCurrentCoord({ latitude, longtitude });
    }

    const handleCoordArrayChange = (newCoordArray) => {
        setCoordinates(newCoordArray);
        setPublication(prevPubl => ({ ...prevPubl, coordinates: JSON.stringify(newCoordArray) }));
    }

    const handleCoordDelete = (e) => {
        e.stopPropagation();
        mapRef.current.deleteCurrentPoint();
    }

    const handleSubmit = () => {
        if (createTwoLang ? (publication.translations?.every(({ name }) => name?.length))
            : publication.translations?.find(({ isEnglish }) => isEng === isEnglish).name) {
            onPublicationSubmit({ createTwoLang, isEng, publication });
        } else {
            dispatch(openAlert({ title: t('warning'), message: t('form_required'), type: 'warning' }))
        }
    }

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col w-full h-fit pb-16">
            <div className='flex flex-col w-full h-full pb-16'>
                <div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full'>
                    <Tabs.Root defaultValue={false} className="md:col-span-2" value={isEng}
                        onValueChange={handleLangChange}>
                        <Tabs.List className="w-full border-b flex md:items-center gap-x-4 overflow-x-auto justify-between md:flex-row flex-col">
                            <div className='flex items-center gap-x-4 overflow-x-auto md:order-1 order-2'>
                                <Tabs.Trigger disabled={!createTwoLang && isEng}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={false}>
                                    <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        Русскоязычная версия
                                    </div>
                                </Tabs.Trigger>
                                <Tabs.Trigger disabled={!createTwoLang}
                                    className="disabled:text-gray-400 group outline-none border-b-2 border-[#f6f7f9] data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
                                    value={true}>
                                    <div className="pb-2.5 px-2 group-disabled:text-current duration-150 group-hover:text-blue-600 font-medium">
                                        English version
                                    </div>
                                </Tabs.Trigger>
                            </div>
                            {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang' className={`md:order-2 order-1 pb-4  md:pb-2.5 flex flex-row cursor-pointer items-center`}>
                                <input type="checkbox" id='createTwoLang'
                                    checked={createTwoLang}
                                    onChange={handleTwoLangChange}
                                    className="min-w-5 w-5 min-h-5 h-5 mr-2 rounded border-gray-300 " />
                                <span>{pathname === 'edit' ? `${oldIsEng ? t('add_ru') : t('add_en')}` : t('create_two_lang')}</span>
                            </label>}
                        </Tabs.List>
                    </Tabs.Root>
                    <div className='flex flex-col w-full'>
                        <ul className='flex flex-col w-full'>
                            {PUBLICATION_INFO.map(({ name, title }, idx) => {
                                return <li key={name} className={`${idx && 'mt-3'}`}>
                                    {name === 'description' ? Textarea({
                                        name,
                                        label: `${title} ${isEng ? '(EN)' : ''}`,
                                        value: publication.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || '',
                                        onChange: handleInputChange
                                    }) :
                                        name === 'type' ? <Dropdown name={title} value={publication.type} items={PUBLICATION_ENUM}
                                            onCategotyChange={handleTypeChange} dropdownKey='category' /> :
                                            Input({
                                                name: name,
                                                label: title,
                                                isEng: name !== 'doi' && isEng,
                                                value: name === 'doi' ? publication.doi : publication.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || '',
                                                onChange: handleInputChange,
                                                required: name === 'name'
                                            })}
                                </li>
                            })}
                        </ul>
                    </div>
                    <div className='flex flex-col w-full xl:h-[528px] md:h-[500px] h-[400px]'>
                        <label className="font-medium">
                            {t('in_map')}
                        </label>
                        <div className='flex flex-row space-x-2 pr-2'>
                            {MapInput({
                                name: 'latitude',
                                label: 'Latitude',
                                value: currentCoord.latitude || '',
                                onChange: handleInputChange,
                            })}
                            {MapInput({
                                name: 'longtitude',
                                label: 'Longtitude',
                                value: currentCoord.longtitude || '',
                                onChange: handleInputChange,
                            })}
                            <button onClick={handleCoordDelete} type='button'
                                className='text-gray-500 hover:text-red-700 duration-300'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-2 w-full h-full'>
                            <MapArraySelect ref={mapRef}
                                coordinates={coordinates} onInputChange={handleCoordChange}
                                onCoordinatesChange={handleCoordArrayChange}
                            />
                        </div>
                    </div>
                </div>

                <p className='font-medium mt-3 w-full'>{t('file')}</p>
                {file.name || file.fileName ? FileCard({
                    ...file,
                    onDelete: handleFileDelete,
                }) : <div className='md:w-[50%] w-full h-[150px] pr-2 mt-1'>
                    <DragAndDrop onLoadClick={handleFileLoad} isMultiple={false} accept='pdf' />
                </div>}

                <p className='font-medium mt-5'>{t('connection')}</p>
                <div className='md:w-[50%] w-full mt-1 flex flex-col space-y-4'>
                    <Filter name={t('soils')} items={soils}
                        type='soil'
                        allSelectedItems={publication?.soilObjects} isEng={isEng}
                        addItem={newItem => handleAddTerm('soilObjects', newItem)}
                        deleteItem={deletedItem => handleDeleteTerm('soilObjects', deletedItem)}
                        resetItems={deletedItems => handleResetTerms('soilObjects', deletedItems)}
                    />
                    <Filter name={t('ecosystems')} items={ecosystems}
                        type='ecosystem'
                        allSelectedItems={publication?.ecoSystems} isEng={isEng}
                        addItem={newItem => handleAddTerm('ecoSystems', newItem)}
                        deleteItem={deletedItem => handleDeleteTerm('ecoSystems', deletedItem)}
                        resetItems={deletedItems => handleResetTerms('ecoSystems', deletedItems)}
                    />
                </div>
            </div>
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[232px] mt-8 min-h-[40px] flex items-center justify-center self-end w-fit px-8 py-2 font-medium text-center text-white transition-colors duration-300 
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
        </form >
    )
}
