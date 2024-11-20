'use client'

import { setDropdown } from '@/store/slices/generalSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@/components/Pagination';
import Dropdown from './ui-kit/Dropdown';
import { useParams } from 'next/navigation';
import { PAGINATION_OPTIONS } from '@/utils/constants';
import moment from 'moment';
import { getTranslation } from '@/i18n/client';
import { Oval } from 'react-loader-spinner';

export default function ObjectsView({ _objects, isLoading, onDeleteClick, objectType, visibilityControl, languageChanger, onVisibleChange, onRoleChange }) {
    const dispatch = useDispatch();
    const [objects, setObjects] = useState([]);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [currentLang, setCurrentLang] = useState('any');
    const [publishStatus, setPublichStatus] = useState('all')

    // true: по возрастанию, false: по убыванию
    const [sortedTypes, setSortedTypes] = useState({
        name: true,
        title: true,
        email: true,
        role: true,
        authorType: true,
        creator: true,
        lastUpdated: true,
        isVisible: true,
    })
    const [lastSorted, setLastSorted] = useState('lastUpdated')

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(0);
    const [filteredObjects, setFilteredObjects] = useState([]);

    const dropdown = useSelector(state => state.general.dropdown);
    const { locale } = useParams();
    const { t } = getTranslation(locale);

    let _isEng = locale === 'en';

    const LANGUAGES = {
        any: t('any'),
        ru: t('ru'),
        eng: t('eng'),
    }

    useEffect(() => {
        setObjects(_objects.sort((a, b) => {
            const dateA = new Date(a.lastUpdated);
            const dateB = new Date(b.lastUpdated);
            return dateB.getTime() - dateA.getTime();
        }));
        setSelectedObjects([]);
    }, [_objects]);

    useEffect(() => {
        const _filterName = filterName.toLowerCase().trim();
        setFilteredObjects(prev => objects
            .filter(object =>
                (object?.name?.toLowerCase().includes(_filterName) ||
                    object?.code?.toLowerCase().includes(_filterName) ||
                    object?.email?.toLowerCase().includes(_filterName) ||
                    object?.title?.toLowerCase().includes(_filterName) ||
                    object?.dataEng?.name?.toLowerCase().includes(_filterName) ||
                    object?.dataRu?.name?.toLowerCase().includes(_filterName) ||
                    object?.nameRu?.toLowerCase().includes(_filterName) ||
                    object?.nameEng?.toLowerCase().includes(_filterName)) &&
                ((publishStatus === 'publish' && object.isVisible) ||
                    (publishStatus === 'not_publish' && (!object.isVisible && object.isVisible !== undefined)) ||
                    (publishStatus === 'all' && true)) &&
                (((currentLang === 'eng' && object.isEnglish) ||
                    (currentLang === 'ru' && !object.isEnglish && object.isEnglish !== undefined) ||
                    (currentLang === 'any' && true)) ||
                    ((currentLang === 'eng' && object.translationMode !== undefined && (object.translationMode == 1 || object.translationMode == 0)) ||
                        (currentLang === 'ru' && object.translationMode !== undefined && (object.translationMode == 2 || object.translationMode == 0)) ||
                        (currentLang === 'any' && true)))
            )
        )
    }, [objects, filterName, publishStatus, currentLang]);

    const handleObjectSelect = (checked, id, type) => {
        setSelectedObjects(prev => {
            if (checked) {
                return type ? [...prev, { id, type }] : [...prev, id];
            } else {
                return type ? prev.filter(item => (item.type !== type) || (item.id !== id)) : prev.filter(item => item !== id);
            }
        });
    }

    const handleAllCheked = (checked) => {
        if (checked) {
            const allObjectIds = currentItems.map(obj => obj.type ? { type: obj.type.name, id: obj.id } : obj.id);
            setSelectedObjects(allObjectIds);
        } else {
            setSelectedObjects([]);
        }
    }

    const handleVisibleChange = ({ type, id, isVisible }) => {
        type ? onVisibleChange({ id, type, isVisible, isMulti: false }) : onVisibleChange({ id, isVisible, isMulti: false });
    }

    const handleSelectedDelete = () => {
        selectedObjects.forEach(item => {
            item.type ? onDeleteClick({ id: item.id, type: item.type, isMulti: true })
                : onDeleteClick({ id: item, isMulti: true })
        });
    }

    const handleSelectedVisibleChange = (isVisible) => {
        selectedObjects.forEach(item => {
            item.type ? onVisibleChange({ id: item.id, type: item.type, isVisible, isMulti: true })
                : onVisibleChange({ id: item, isVisible, isMulti: true })
        });
    }

    const handleRoleChange = (userId, isAdmin) => {
        onRoleChange(userId, isAdmin)
    }

    const handleLangChange = (lang) => {
        setCurrentLang(lang);
    }

    const sortedBy = (fieldName) => {
        setLastSorted(fieldName);
        const isAscending = sortedTypes[fieldName];
        let parentName
        switch (objectType) {
            case 'objects':
                parentName = 'soilObject';
                break;
            case 'ecosystems':
                parentName = 'ecoSystem';
                break;
            case 'publications':
                parentName = 'publication';
                break;
            case 'news':
                parentName = 'news';
                break;
        }

        const compareFn = (a, b) => {
            let fieldA, fieldB;

            if (fieldName === 'name' && objectType === 'authors') {
                fieldA = a[_isEng ? 'dataEng' : 'dataRu'][fieldName];
                fieldB = b[_isEng ? 'dataEng' : 'dataRu'][fieldName];
            } else if (fieldName === 'name' && objectType === 'dictionary') {
                fieldA = _isEng ? (a.nameEng || a.nameRu) : (a.nameRu || a.nameEng);
                fieldB = _isEng ? (b.nameEng || b.nameRu) : (b.nameRu || b.nameEng);
            } else {
                fieldA = a[fieldName];
                fieldB = b[fieldName];
            }

            if (fieldName === 'lastUpdated') {
                const dateA = new Date(fieldA);
                const dateB = new Date(fieldB);
                return isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }

            if (fieldName === 'creator') {
                const emailA = a[parentName].user.email;
                const emailB = b[parentName].user.email;
                return isAscending ? emailA.localeCompare(emailB) : emailB.localeCompare(emailA);
            }

            if (fieldName === 'isVisible') {
                return (fieldA === fieldB) ? 0 : (isAscending ? (fieldA ? 1 : -1) : (fieldA ? -1 : 1));
            }

            const valueA = fieldA.toString();
            const valueB = fieldB.toString();
            return isAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }
        // const [objects, setObjects] = useState([]);
        setObjects(prev => [...prev].sort(compareFn));
        setFilteredObjects(prev => [...prev].sort(compareFn));
        setSortedTypes(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
    }

    const ThItem = ({ name, fieldName }) => {
        return <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left text-zinc-500">
            <button className='flex items-center' onClick={() => sortedBy(fieldName)}>
                <span>{t(name)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                    className={`ml-1 size-4 ${!sortedTypes[fieldName] && 'rotate-180'} ${lastSorted === fieldName && 'text-blue-700'}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
            </button>
        </th >
    }

    const TableRow = ({ name, dataEng, dataRu, soilObject, ecoSystem, publication, news,
        lastUpdated, isVisible, id, soilId, ecoSystemId, publicationId, newsId, type, isEnglish, title }) => {
        return <tr key={`tableRow_${type?.name}_${id}`}
            onClick={() => handleObjectSelect(!(selectedObjects.includes(id) || selectedObjects.find(obj => obj.id === id && obj.type === type.name)), id, type?.name)}
            className={`overflow-hidden cursor-pointer ${(!type ? selectedObjects.includes(id) : selectedObjects.find(obj => obj.id === id && obj.type === type.name)) ? 'bg-yellow-100/50' : ''}`}>
            <td className="px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap overflow-hidden w-full">
                <div className="max-w-full md:w-fit w-[300px] flex flex-row items-center gap-x-3 overflow-hidden">
                    <input type="checkbox"
                        checked={!!(selectedObjects.includes(id) || selectedObjects.find(obj => obj.id === id && obj.type === type.name))}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleObjectSelect(e.target.checked, id, type?.name)}
                        className="cursor-pointer text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                    <Link onClick={e => e.stopPropagation()}
                        prefetch={false}
                        href={{
                            pathname: `/${locale}/admin/${objectType === 'userPage' ? type?.name : objectType}/edit/${soilId || ecoSystemId || publicationId || newsId || id}`,
                            query: { lang: isEnglish ? 'eng' : 'ru' }
                        }}
                        className="font-medium text-blue-600 hover:underline whitespace-normal line-clamp-2">{name || (_isEng ? dataEng?.name : dataRu?.name) || title}</Link>
                </div>
            </td>

            {objectType === 'userPage' ? <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{type?.title}</td>
                : <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{soilObject?.user?.email || ecoSystem?.user?.email || publication?.user?.email || news?.user?.email}</td>}
            <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{moment(lastUpdated).format('DD.MM.YYYY HH:mm')}</td>
            <td className="px-4 py-3 text-sm whitespace-nowrap min-w-[175px]">
                {isVisible !== undefined && <div className="flex items-center gap-x-2">
                    {isVisible ? <p className="px-3 py-1 text-sm text-emerald-500 rounded-full bg-emerald-100/60">{t('publish')}</p> :
                        <p className="px-3 py-1 text-sm rounded-full text-zinc-500 bg-zinc-100">{t('no_publish')}</p>}
                </div>}
            </td>
            <td className="xl:flex hidden px-4 py-3 text-sm whitespace-nowrap items-center my-1">
                <div className="relative inline-block">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setDropdown({
                            key: `${objectType === 'userPage' ? `${type?.name}_${id}` : id}`,
                            isActive: dropdown.key !== null
                                && dropdown.key !== `${objectType === 'userPage' ? `${type?.name}_${id}` : id}`
                                ? true : !dropdown.isActive
                        }))
                    }} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    <div onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setDropdown({ key: null, isActive: false }))
                    }}
                        className={`absolute right-0 z-50 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == `${objectType === 'userPage' ? `${type?.name}_${id}` : id}` && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                        {isVisible !== undefined && <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVisibleChange({ type: type?.name, id, isVisible: !isVisible })
                            }}>
                            {isVisible ? t('no_publish_go') : t('publish_go')}</button>}

                        <Link onClick={e => e.stopPropagation()}
                            prefetch={false}
                            href={{ pathname: `/${locale}/admin/${objectType === 'userPage' ? type?.name : objectType}/edit/${soilId || ecoSystemId || publicationId || id}`, query: { lang: isEnglish ? 'eng' : 'ru' } }}
                            className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">{t('edit_go')}</Link>
                        <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick({ type: type?.name, id })
                            }}>{t('delete')}</button>
                    </div>
                </div>
            </td>
        </tr >
    }

    const DictionaryTableRow = ({ nameRu, nameEng, id, translationMode }) => <tr className={`${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}>
        <td key={`tableRow_dictionary_${id}`}
            onClick={() => handleObjectSelect(!selectedObjects.includes(id), id)}
            className="w-full cursor-pointer px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap ">
            <div className="flex flex-row items-center gap-x-3">
                <input type="checkbox"
                    checked={selectedObjects.includes(id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        e.stopPropagation();
                        handleObjectSelect(e.target.checked, id)
                    }}
                    className="text-blue-500 border-zinc-300 rounded min-w-4 min-h-4 cursor-pointer" />
                <Link href={`/${locale}/admin/${objectType}/edit/${id}`}
                    prefetch={false}
                    onClick={e => e.stopPropagation()}
                    className="font-medium text-blue-600 hover:underline whitespace-normal ">{
                        currentLang === 'any' ? (
                            translationMode === 0 ? (_isEng ? `${nameEng} (${nameRu})`
                                : `${nameRu} (${nameEng})`)
                                : translationMode === 1 ? nameEng
                                    : translationMode === 2 ? nameRu : ''
                        )
                            : (currentLang === 'ru' ? nameRu
                                : currentLang === 'eng' ? nameEng : '')
                    }
                </Link>
            </div>
        </td>

        <td className="px-4 py-3 text-sm whitespace-nowrap xl:flex hidden flex-row justify-end">
            <div className="relative inline-block">
                <button onClick={() => dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </button>

                <div onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}
                    className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                    <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">{t('edit_go')}</button>
                    <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                        onClick={() => onDeleteClick({ id })}>{t('delete')}</button>
                </div>
            </div>
        </td>
    </tr >

    const AuthorTableRow = ({ dataRu, dataEng, authorType, id }) => <tr
        className={`cursor-pointer ${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}
        onClick={() => handleObjectSelect(!selectedObjects.includes(id), id)}>
        <td key={`tableRow_author_${id}`}
            className="w-full px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap">
            <div className="flex flex-row items-center gap-x-3">
                <input type="checkbox"
                    checked={selectedObjects.includes(id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleObjectSelect(e.target.checked, id)}
                    className="cursor-pointer text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                <Link href={`/${locale}/admin/${objectType}/edit/${id}`}
                    prefetch={false}
                    onClick={e => e.stopPropagation()}
                    className="font-medium text-blue-600 hover:underline whitespace-normal ">{_isEng ? dataEng.name : dataRu.name || ''}</Link>
            </div>
        </td>

        <td className="px-4 py-3 text-sm whitespace-nowrap">
            {authorType !== undefined && <div className="flex items-center gap-x-2">
                {authorType == '0' ? <p className="px-3 py-1 text-sm text-red-500 rounded-full bg-red-100/60">{t('main_editor')}</p> :
                    authorType == '1' ? <p className="px-3 py-1 text-sm text-emerald-500 rounded-full bg-emerald-100/60">{t('executive_editor')}</p> :
                        authorType == '2' ? <p className="px-3 py-1 text-sm text-blue-500 rounded-full bg-blue-100/60">{t('editor')}</p> :
                            <p className="px-3 py-1 text-sm rounded-full text-zinc-500 bg-zinc-100">{t('author')}</p>}
            </div>}
        </td>

        <td className="px-4 py-3 text-sm whitespace-nowrap xl:flex hidden flex-row justify-end">
            <div className="relative">
                <button onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))
                }
                } className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </button>

                <div onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setDropdown({ key: null, isActive: false }))
                }}
                    className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                    <Link onClick={e => e.stopPropagation()}
                        prefetch={false}
                        href={{ pathname: `/${locale}/admin/authors/edit/${id}` }}
                        className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">{t('edit_go')}</Link>
                    <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClick({ id })
                        }}>{t('delete')}</button>
                </div>
            </div>
        </td>
    </tr>

    const ModeratorTableRow = ({ name, email, id, role }) => {
        return <tr className={`cursor-pointer 
    ${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}
            onClick={() => handleObjectSelect(!selectedObjects.includes(id), id)}>
            <td key={`tableRow_moderator_${id}`}
                className="px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap ">
                <div className="flex flex-row items-center gap-x-3">
                    <input type="checkbox"
                        checked={selectedObjects.includes(id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleObjectSelect(e.target.checked, id)
                        }}
                        className="cursor-pointer text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                    <Link onClick={e => e.stopPropagation()} href={`/${locale}/admin/${objectType}/${id}`}
                        prefetch={false}
                        className="font-medium text-blue-600 hover:underline whitespace-normal">{email}</Link>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{name || t('no_name')}</td>
            <td className="px-4 py-3 text-sm whitespace-nowrap ">
                <div className="flex items-center gap-x-2">
                    {role === 'Admin' ? <p className="px-3 py-1 text-sm text-emerald-500 rounded-full bg-emerald-100/60">Администратор</p> :
                        role === 'Moderator' ? <p className="px-3 py-1 text-sm rounded-full text-blue-500 bg-blue-100">Модератор</p> : ''}
                </div>
            </td>


            <td className="px-4 py-3 text-sm whitespace-nowrap xl:flex hidden flex-row justify-end">
                <div className="relative inline-block">
                    <button onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))
                    }} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    <div onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setDropdown({ key: null, isActive: false }))
                    }}
                        className={`absolute right-0 z-20 w-56 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                        <Link href={`/${locale}/admin/${objectType}/${id}`}
                            prefetch={false}
                            className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">{t('view')}</Link>
                        <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRoleChange(id, role === 'Moderator')
                            }}>
                            {role === 'Moderator' ? t('make_admin') : t('make_moderator')}</button>
                        <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick({ id })
                            }}>{t('delete')}</button>
                    </div>
                </div>
            </td>
        </tr>
    }

    const TableHead = () => {
        const name = objectType === 'news' ? 'title' : 'name';
        return <thead className="bg-zinc-100">
            <tr>
                <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left text-zinc-500">
                    <div className="flex items-center">
                        <input type="checkbox"
                            checked={(currentItems.every(object => selectedObjects.includes(object.id)
                                || selectedObjects.find(obj => obj.id === object.id && obj.type === object.type.name))) && selectedObjects.length}
                            onChange={e => handleAllCheked(e.target.checked)}
                            className="cursor-pointer text-blue-500 border-zinc-300 rounded w-4 h-4 mr-3" />

                        <button className='flex items-center'
                            onClick={() => sortedBy(name)}>
                            <span>{t('title')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                                className={`ml-1 size-4 ${!sortedTypes[name] && 'rotate-180'} ${lastSorted === name && 'text-blue-700'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                    </div>
                </th>
                {objectType === 'userPage' && <ThItem name='type' />}
                {objectType !== 'users' && objectType !== 'userPage' && <ThItem name='creator' fieldName='creator' />}
                <ThItem name='updated' fieldName='lastUpdated' />
                <ThItem name='status' fieldName='isVisible' />
                <th scope="col" className="xl:block hidden relative py-3.5 px-4">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    }

    const DictionaryTableHead = () => {
        return <thead className="bg-zinc-100">
            <tr>
                <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left text-zinc-500">
                    <div className="flex items-center gap-x-3">
                        <input type="checkbox"
                            checked={currentItems.every(object => selectedObjects.includes(object.id)) && selectedObjects.length}
                            onChange={e => handleAllCheked(e.target.checked)}
                            className="cursor-pointer text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <button className='flex items-center'
                            onClick={() => sortedBy('name')}>
                            <span>{t('title')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                                className={`ml-1 size-4 ${!sortedTypes['name'] && 'rotate-180'} ${lastSorted === 'name' && 'text-blue-700'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                    </div>
                </th>
                <th scope="col" className="xl:block hidden relative py-3.5 px-4">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    }

    const AuthorTableHead = () => {
        return <thead className="bg-zinc-100">
            <tr>
                <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left text-zinc-500">
                    <div className="flex items-center gap-x-3">
                        <input type="checkbox"
                            checked={currentItems.every(object => selectedObjects.includes(object.id)) && selectedObjects.length}
                            onChange={e => handleAllCheked(e.target.checked)}
                            className="cursor-pointer text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <button className='flex items-center'
                            onClick={() => sortedBy('name')}>
                            <span>{t('name')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                                className={`ml-1 size-4 ${!sortedTypes['name'] && 'rotate-180'} ${lastSorted === 'name' && 'text-blue-700'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                    </div>
                </th>
                <ThItem name='rank' fieldName='authorType' />
                <th scope="col" className="xl:block hidden relative py-3.5 px-4">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    }

    const ModeratorTableHead = () => {
        return <thead className="bg-zinc-100">
            <tr>
                <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left text-zinc-500">
                    <div className="flex items-center gap-x-3">
                        <input type="checkbox"
                            checked={currentItems.every(object => selectedObjects.includes(object.id)) && selectedObjects.length}
                            onChange={e => handleAllCheked(e.target.checked)}
                            className="cursor-pointer text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <button className='flex items-center'
                            onClick={() => sortedBy('email')}>
                            <span>Email</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                                className={`ml-1 size-4 ${!sortedTypes['email'] && 'rotate-180'} ${lastSorted === 'email' && 'text-blue-700'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                            </svg>
                        </button>
                    </div>
                </th>

                <ThItem name='fio' fieldName='name' />
                <ThItem name='role' fieldName='role' />
                <th scope="col" className="xl:block hidden relative py-3.5 px-4">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    }

    return (
        <div className={`flex flex-col w-fill  ${visibilityControl ? 'space-y-4' : 'space-y-2'}`}>
            <div className='w-full relative'>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    type="text"
                    placeholder={objectType === 'users' ? t('search_email')
                        : objectType === 'authors' ? t('search_name')
                            : objectType === 'objects' || objectType === 'ecosystems' ? t('search_code')
                                : t('search_title')}
                    className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                />
            </div>
            <div className={`relative flex flex-col md:flex-row justify-between ${(visibilityControl || languageChanger) ? 'min-h-[42px]' : 'h-0'}`}>
                <div className={`relative ${visibilityControl && 'sm:min-w-[447px] sm:w-[447px] w-full min-h-[40px]'} flex-1 sm:text-base text-sm`}>
                    <div className={`absolute overflow-hidden sm:w-fit w-full h-full inline-flex
                    justify-between bg-white border divide-x rounded-md duration-200
                    ${!visibilityControl ? 'opacity-0 hidden' : (selectedObjects.length ? 'opacity-0 invisible' : 'opacity-100')}`}>
                        <button className={`min-w-fit max-w-full px-2 mini:px-4 sm:px-5 py-2 font-medium text-zinc-600 transition-colors duration-200
                        ${publishStatus === 'all' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('all')}>
                            {t('all')}
                        </button>

                        <button className={`min-w-fit w-full px-2 sm:px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100
                        ${publishStatus === 'publish' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('publish')}>
                            {t('published')}
                        </button>

                        <button className={`min-w-fit w-full px-2 sm:px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100
                         ${publishStatus === 'not_publish' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('not_publish')}>
                            {t('no_published')}
                        </button>
                    </div>
                    <div className={`${visibilityControl ? (!_isEng ? 'sm:min-w-[588px] sm:w-[588px] w-full' : 'sm:min-w-[433px] sm:w-[433px] w-full') : '-top-[50px]'} 
                        shadow-md z-30 absolute overflow-hidden inline-flex justify-between bg-white border divide-x rounded-lg duration-200
                    ${selectedObjects.length ? 'opacity-100' : 'invisible opacity-0'}`}>
                        <div className="min-w-fit w-full px-2 mini:px-4 sm:px-5 py-2 sm:block hidden font-medium text-blue-700 transition-colors duration-200 ">
                            {selectedObjects.length} {t('select')}:
                        </div>
                        {visibilityControl ? <>
                            <button className="min-w-fit w-full px-2 mini:px-4 sm:px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100"
                                onClick={() => handleSelectedVisibleChange(true)}>
                                {t('publish_go')}
                            </button>

                            <button className="min-w-fit w-full px-2 mini:px-4 sm:px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100"
                                onClick={() => handleSelectedVisibleChange(false)}>
                                {t('no_publish_go')}
                            </button>
                        </> : ''}
                        <button className="min-w-fit w-full px-2 mini:px-4 sm:px-5 py-2 font-medium text-red-500 transition-colors duration-200 hover:bg-zinc-100"
                            onClick={handleSelectedDelete}>
                            {t('delete')}
                        </button>
                    </div>
                </div>
                {languageChanger ? <div className={`${languageChanger ? 'sm:mt-4' : 'mt-0'} sm:text-base text-sm mt-2 pl-1 sm:mt-0 sm:w-[232px] w-full md:mt-0 md:ml-4 h-fit
                     `}>
                    <Dropdown name={t('language')} value={currentLang} items={LANGUAGES} flexRow={true}
                        onCategotyChange={handleLangChange} dropdownKey='language' />
                </div> : ''}
            </div>

            <div className="w-full max-h-full overflow-x-auto xl:overflow-x-visible overflow-y-hidden xl:overflow-y-visible">
                <div className="inline-block min-w-full">
                    <div className="border border-zinc-200">
                        <table className="w-full max-w-full divide-y divide-zinc-200">
                            {objectType === 'dictionary' ? <DictionaryTableHead /> :
                                objectType === 'authors' ? <AuthorTableHead /> :
                                    objectType === 'users' ? <ModeratorTableHead /> :
                                        <TableHead />}
                            <tbody className="bg-white divide-y divide-zinc-200">
                                {currentItems.map(object => {
                                    return objectType === 'dictionary' ? DictionaryTableRow(object) :
                                        objectType === 'authors' ? AuthorTableRow(object) :
                                            objectType === 'users' ? ModeratorTableRow(object) :
                                                TableRow(object)
                                })}
                                {!filteredObjects.length && <tr className='bg-white'>
                                    <td className="px-4 py-[18px] text-sm font-medium text-zinc-700 whitespace-nowrap ">
                                        {isLoading ? <div className='flex flex-row items-center space-x-2'>
                                            <Oval
                                                height={20}
                                                width={20}
                                                color="#111827"
                                                visible={true}
                                                ariaLabel='oval-loading'
                                                secondaryColor="#111827"
                                                strokeWidth={4}
                                                strokeWidthSecondary={4} />
                                            <p className='text-sm text-zinc-700'>{t('loading')}</p></div> : t('no_objects')}
                                    </td>
                                    <td className="px-4 py-[18px] text-sm text-zinc-500 whitespace-nowrap"></td>
                                    <td className="px-4 py-[18px] text-sm text-zinc-500 whitespace-nowrap"></td>
                                    <td className="px-4 py-[18px] text-sm text-zinc-500 whitespace-nowrap"></td>
                                    <td className="px-4 py-[18px] text-sm text-zinc-500 whitespace-nowrap"></td>

                                </tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='flex xl:flex-row flex-col self-end xl:space-x-6'>
                <div className='flex flex-row xl:justify-center justify-end mb-2 mr-1 xl:mr-0 xl:mb-0 items-center'>
                    <Dropdown name={t('in_page')} value={itemsPerPage} items={PAGINATION_OPTIONS}
                        onCategotyChange={setItemsPerPage} flexRow={true} dropdownKey='in_page' />
                </div>
                <Pagination itemsPerPage={PAGINATION_OPTIONS[itemsPerPage]} items={filteredObjects}
                    updateCurrentItems={setCurrentItems} />
            </div>
        </div >
    );
}
