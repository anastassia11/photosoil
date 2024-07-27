'use client'

import { useEffect, useRef, useState } from 'react'
import Dropdown from './Dropdown';
import { BASE_SERVER_URL } from '@/utils/constants';
import DragAndDrop from './ui-kit/DragAndDrop';
import { Oval } from 'react-loader-spinner';
import { sendPhoto } from '@/api/photo/send_photo';
import * as Tabs from "@radix-ui/react-tabs";
import { useTranslation } from 'react-i18next';
import { useConstants } from '@/hooks/useConstants';
import Filter from '../soils/Filter';
import { getBaseEcosystems } from '@/api/ecosystem/get_base_ecosystems';
import { getBaseSoils } from '@/api/soil/get_base_soils';
import MapArraySelect from '../map/MapArraySelect';

export default function PublicationForm({ _publication, pathname, onPublicationSubmit, isLoading, btnText, oldTwoLang, oldIsEng }) {
    const [publication, setPublication] = useState({});
    const [file, setFile] = useState({});
    const [isEng, setIsEng] = useState(false);
    const [createTwoLang, setCreateTwoLang] = useState(false);
    const [ecosystems, setEcosystems] = useState([]);
    const [soils, setSoils] = useState([]);
    const [coordinates, setCoordinates] = useState([]);
    const [currentCoord, setCurrentCoord] = useState({});

    const mapRef = useRef(null);
    const { t } = useTranslation();
    const { PUBLICATION_INFO, PUBLICATION_ENUM } = useConstants();

    useEffect(() => {
        fetchEcosystems();
        fetchSoils();
    }, [])

    useEffect(() => {
        if (_publication) {
            setPublication({ ..._publication, fileId: _publication.file?.id });
            setCoordinates(JSON.parse(_publication.coordinates));
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
        const result = await sendPhoto(file);
        if (result.success) {
            setPublication(prev => ({ ...prev, fileId: result.data.id }));
            setFile(result.data);
        }
    }

    const handleFileDelete = (e) => {
        e.stopPropagation();
        const _publication = { ...publication };
        delete _publication.fileId;
        delete _publication.file;
        setPublication(_publication);
        setFile({});
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
        onPublicationSubmit({ createTwoLang, isEng, publication });
    }

    const Input = ({ name, label }) => {
        return <div>
            <label className="font-medium">
                {`${label} ${(name !== 'doi' && isEng) ? '(EN)' : ''}`}
            </label>
            <input
                required={name === 'name'}
                value={name === 'doi' ? publication.doi : publication.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || ''}
                onChange={handleInputChange}
                name={name}
                type="text"
                className="h-[40px] bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const Textarea = ({ name, label }) => {
        return <div className=''>
            <label className="font-medium">
                {`${label} ${isEng ? '(EN)' : ''}`}
            </label>
            <textarea
                value={publication.translations?.find(({ isEnglish }) => isEng === isEnglish)?.[name] || ''}
                name={name}
                onChange={handleInputChange}
                type="text"
                className="h-full bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
            />
        </div>
    }

    const MapInput = ({ name, label }) => {
        return <input
            value={currentCoord[name] || ''}
            onChange={handleInputChange}
            name={name}
            type="text"
            placeholder={label}
            className="h-[40px] bg-white w-full p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
        />
    }

    const FileCard = ({ name, fileName, path }) => {
        const fileTitle = <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="-4 0 40 40"
                className='w-5 h-5 mr-1' >
                <path
                    fill="#EB5757"
                    d="M25.669 26.096c-.488.144-1.203.16-1.97.049a9.392 9.392 0 0 1-2.49-.742c1.473-.214 2.615-.148 3.591.198.232.082.612.301.869.495Zm-8.214-1.35-.177.048c-.396.108-.782.213-1.153.306l-.501.127c-1.008.255-2.038.516-3.055.826.387-.932.746-1.875 1.098-2.797.26-.682.526-1.379.801-2.067.14.23.285.461.437.692a13.483 13.483 0 0 0 2.55 2.865Zm-2.562-10.513c.065 1.15-.183 2.257-.547 3.318-.449-1.312-.658-2.762-.097-3.932.144-.3.261-.46.338-.545.118.183.273.59.306 1.159Zm-5.26 14.572c-.252.451-.509.873-.772 1.272-.637.958-1.677 1.985-2.212 1.985-.052 0-.116-.008-.209-.107-.06-.062-.07-.107-.066-.169.018-.352.485-.98 1.161-1.562a11.44 11.44 0 0 1 2.098-1.419Zm17.738-2.659c-.082-1.174-2.059-1.927-2.078-1.934-.764-.271-1.594-.403-2.538-.403-1.01 0-2.098.146-3.497.473a12.17 12.17 0 0 1-3.122-3.209c-.354-.54-.673-1.079-.951-1.605.678-1.623 1.29-3.367 1.178-5.32-.09-1.566-.796-2.618-1.756-2.618-.659 0-1.226.488-1.688 1.451-.822 1.718-.606 3.915.643 6.537a91.473 91.473 0 0 0-1.272 3.213c-.504 1.319-1.023 2.68-1.607 3.973-1.64.65-2.987 1.436-4.109 2.402-.735.631-1.622 1.597-1.672 2.605-.025.474.138.91.468 1.258.352.37.793.566 1.279.566 1.603 0 3.146-2.202 3.439-2.644.589-.888 1.14-1.879 1.68-3.021 1.361-.492 2.811-.859 4.217-1.214l.503-.128a67.63 67.63 0 0 0 1.175-.313c.427-.115.867-.235 1.313-.349 1.443.918 2.995 1.517 4.51 1.737 1.274.185 2.406.078 3.173-.322.69-.36.728-.913.712-1.135Zm3.105 10.097c0 2.15-1.896 2.283-2.278 2.287H3.745c-2.143 0-2.272-1.908-2.276-2.287V3.756c0-2.152 1.899-2.283 2.276-2.287h16.518l.009.009v6.446c0 1.294.782 3.743 3.744 3.743h6.404l.055.055v24.52Zm-1.519-26.045h-4.94c-2.142 0-2.272-1.898-2.275-2.274v-4.97l7.215 7.244Zm2.988 26.045V11.116L21.742.87V.823h-.048L20.874 0H3.744C2.45 0 0 .785 0 3.757v32.486C0 37.543.783 40 3.745 40H28.2c1.295 0 3.745-.786 3.745-3.757Z" />
            </svg>
            {name || fileName}
        </>
        return <div className='flex flex-row justify-between'>
            {path ? <a className='flex flex-row text-blue-700 hover:underline cursor-pointer duration-300'
                href={`${BASE_SERVER_URL}${path}`}>
                {fileTitle}
            </a> : <p className={`flex flex-row  duration-300 `}>
                {fileTitle}
            </p>}
            <button className='text-zinc-500 hover:text-zinc-800 duration-300 pt-[1px]'
                onClick={(e) => handleFileDelete(e)}>
                <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                    <g id="Menu / Close_LG">
                        <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </svg>
            </button>
        </div>
    }

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col w-full h-fit">
            <div className='flex flex-col w-full h-full'>
                <div className='grid grid-cols-2 gap-4 w-full'>
                    <Tabs.Root defaultValue={false} className="col-span-2" value={isEng}
                        onValueChange={handleLangChange}>
                        <Tabs.List className="w-full border-b flex items-center gap-x-4 overflow-x-auto justify-between">
                            <div className='flex items-center gap-x-4 overflow-x-auto'>
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
                            {(!oldTwoLang || pathname !== 'edit') && <label htmlFor='createTwoLang' className={`pb-2.5 flex flex-row cursor-pointer items-center`}>
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
                            {PUBLICATION_INFO.map(({ name, titleRu }, idx) => {
                                return <li key={name} className={`${idx && 'mt-3'}`}>
                                    {name === 'description' ? Textarea({ name, label: titleRu }) :
                                        name === 'type' ? <Dropdown name={titleRu} value={publication.type} items={PUBLICATION_ENUM}
                                            onCategotyChange={handleTypeChange} dropdownKey='category' /> :
                                            Input({ name, label: titleRu })}
                                </li>
                            })}
                        </ul>
                        <p className='font-medium mt-3'>{t('file')}</p>
                        {file.id ?
                            <div className='mt-1'>
                                {FileCard({ ...file })}
                            </div>
                            : <div className='h-[150px] pr-2 mt-1'>
                                <DragAndDrop onLoadClick={handleFileLoad} isMultiple={false} accept='pdf' />
                            </div>
                        }
                        <p className='font-medium mt-5'>{t('connection')}</p>
                        <div className='mt-1 flex flex-col space-y-4'>
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
                    <div className='flex flex-col w-full'>
                        <label className="font-medium">
                            {t('in_map')}
                        </label>
                        <div className='flex flex-row space-x-2 pr-2'>
                            {MapInput({ name: 'latitude', label: 'Latitude' })}
                            {MapInput({ name: 'longtitude', label: 'Longtitude' })}
                            <button onClick={handleCoordDelete} type='button'
                                className='text-gray-500 hover:text-red-700 duration-300'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>
                        </div>

                        <div id='map-section' className='border rounded-lg overflow-hidden mt-2 min-h-[574px]'>
                            <MapArraySelect ref={mapRef}
                                coordinates={coordinates} onInputChange={handleCoordChange}
                                onCoordinatesChange={handleCoordArrayChange}
                            />
                        </div>
                    </div>
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
