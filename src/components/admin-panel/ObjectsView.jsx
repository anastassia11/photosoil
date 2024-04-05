'use client'

import { setDropdown } from '@/store/slices/generalSlice';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '@/components/Pagination';

export default function ObjectsView({ _objects, onDeleteClick, pathname, visibilityControl }) {
    const dispatch = useDispatch();
    const [objects, setObjects] = useState([]);
    const [selectedObjects, setSelectedObjects] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [publishStatus, setPublichStatus] = useState('all')

    const [currentItems, setCurrentItems] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filteredObjects, setFilteredObjects] = useState([]);

    const dropdown = useSelector(state => state.general.dropdown);

    const OPTIONS = ['3', '10', '20', '30', '40', '50']

    useEffect(() => {
        setObjects(_objects)
        const updatedSelectedObjects = selectedObjects.filter(selectedId =>
            _objects.some(obj => obj.id === selectedId)
        );
        setSelectedObjects(updatedSelectedObjects);
    }, [_objects]);

    useEffect(() => {
        setFilteredObjects(prev => objects.filter(object =>
            object.name.toLowerCase().includes(filterName.toLowerCase()) &&
            ((publishStatus === 'publish' && object.isVisible) ||
                (publishStatus === 'not_publish' && !object.isVisible) ||
                (publishStatus === 'all' && true))
        ))
    }, [objects, filterName, publishStatus]);

    const handleDeleteClick = async (id) => {
        onDeleteClick(id)
    }

    const handleObjectSelect = (e, id) => {
        setSelectedObjects(prev => {
            if (e.target.checked) {
                return [...prev, id];
            } else {
                return prev.filter(item => item !== id);
            }
        });
    }

    const handleAllCheked = (e) => {
        if (e.target.checked) {
            const allObjectIds = filteredObjects.map(obj => obj.id);
            setSelectedObjects(allObjectIds);
        } else {
            setSelectedObjects([]);
        }
    }

    const handleSelectedDelete = () => {
        selectedObjects.forEach(id => {
            handleDeleteClick(id)
        })
    }

    const TableRow = ({ name, author, lastUpdated, isVisible, id }) =>
        <tr className={`${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}>
            <td className="px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap ">
                <div className="flex flex-row items-center gap-x-3">
                    <input type="checkbox"
                        checked={selectedObjects.includes(id)}
                        onChange={(e) => handleObjectSelect(e, id)}
                        className="text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                    <Link href={`/admin/${pathname}/edit/${id}`}
                        className="font-medium text-blue-600 hover:underline whitespace-normal ">{name}</Link>
                </div>
            </td>

            <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{author || 'ch-nastya1997'}</td>
            <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{lastUpdated}</td>
            <td className="px-4 py-3 text-sm whitespace-nowrap">
                <div className="flex items-center gap-x-2">
                    {isVisible ? <p className="px-3 py-1 text-sm text-emerald-500 rounded-full bg-emerald-100/60">Опубликовано</p> :
                        <p className="px-3 py-1 text-sm rounded-full text-zinc-500 bg-zinc-100">Не опубликовано</p>}
                </div>
            </td>
            <td class="px-4 py-3 text-sm whitespace-nowrap">
                <div className="relative inline-block">
                    <button onClick={() => dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                    </button>

                    <div onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}
                        className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                        <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">
                            {isVisible ? 'Снять с публикации' : 'Опубликовать'}</button>
                        <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">Редактировать</button>
                        <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                            onClick={() => handleDeleteClick(id)}>Удалить</button>
                    </div>
                </div>
            </td>
        </tr>

    const DictionaryTableRow = ({ name, id }) => <tr className={`${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}>
        <td className="px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap ">
            <div className="flex flex-row items-center gap-x-3">
                <input type="checkbox"
                    checked={selectedObjects.includes(id)}
                    onChange={(e) => handleObjectSelect(e, id)}
                    className="text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                <Link href={`/admin/${pathname}/edit/${id}`}
                    className="font-medium text-blue-600 hover:underline whitespace-normal ">{name}</Link>
            </div>
        </td>

        <td class="px-4 py-3 text-sm whitespace-nowrap">
            <div className="relative inline-block">
                <button onClick={() => dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </button>

                <div onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}
                    className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                    <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">Редактировать</button>
                    <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                        onClick={() => handleDeleteClick(id)}>Удалить</button>
                </div>
            </div>
        </td>
    </tr>

    const AuthorTableRow = ({ name, id, organization }) => <tr className={`${selectedObjects.includes(id) ? 'bg-yellow-100/50' : ''}`}>
        <td className="px-4 py-3 text-sm font-medium text-zinc-700 whitespace-nowrap ">
            <div className="flex flex-row items-center gap-x-3">
                <input type="checkbox"
                    checked={selectedObjects.includes(id)}
                    onChange={(e) => handleObjectSelect(e, id)}
                    className="text-blue-500 border-zinc-300 rounded min-w-4 min-h-4" />
                <Link href={`/admin/${pathname}/edit/${id}`}
                    className="font-medium text-blue-600 hover:underline whitespace-normal ">{name}</Link>
            </div>
        </td>


        <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">{organization}</td>


        <td class="px-4 py-3 text-sm whitespace-nowrap">
            <div className="relative inline-block">
                <button onClick={() => dispatch(setDropdown({ key: id, isActive: dropdown.key !== null && dropdown.key !== id ? true : !dropdown.isActive }))} className="dropdown px-1 py-1 text-gray-500 transition-colors duration-200 rounded-lg hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" class="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                </button>

                <div onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}
                    className={`absolute right-0 z-20 w-48 py-2 mt-2 origin-top-right bg-white rounded-md shadow-md border
                    duration-200 transition-all border-gray-200  top-3
                    ${dropdown.key == id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}>
                    <button className="w-full duration-300 cursor-pointer hover:text-blue-600 h-9 hover:bg-zinc-100 flex items-center px-4">Редактировать</button>
                    <button className="w-full duration-300 cursor-pointer text-red-500 hover:bg-red-100/40 h-9 hover:bg-zinc-100 flex items-center px-4"
                        onClick={() => handleDeleteClick(id)}>Удалить</button>
                </div>
            </div>
        </td>
    </tr>

    const TableHead = ({ }) => {
        return <thead className="bg-zinc-100">
            <tr>
                <th scope="col" className="py-3.5 px-4 text-sm font-normal text-left text-zinc-500">
                    <div className="flex items-center gap-x-3">
                        <input type="checkbox"
                            checked={false || objects.every(object => selectedObjects.includes(object.id))}
                            onChange={handleAllCheked}
                            className="text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <span>Название</span>
                    </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left text-zinc-500">
                    <button className="flex items-center gap-x-2">
                        <span>Создатель</span>
                    </button>
                </th>

                <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left text-zinc-500">Обновлено</th>

                <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left text-zinc-500">Статус</th>

                <th scope="col" className="relative py-3.5 px-4">
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
                            checked={false || objects.every(object => selectedObjects.includes(object.id))}
                            onChange={handleAllCheked}
                            className="text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <span>Название</span>
                    </div>
                </th>
                <th scope="col" className="relative py-3.5 px-4">
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
                            checked={false || objects.every(object => selectedObjects.includes(object.id))}
                            onChange={handleAllCheked}
                            className="text-blue-500 border-zinc-300 rounded w-4 h-4" />
                        <span>Имя</span>
                    </div>
                </th>
                <th scope="col" className="px-4 py-3.5 text-sm font-normal text-left text-zinc-500">Организация</th>
                <th scope="col" className="relative py-3.5 px-4">
                    <span className="sr-only">Edit</span>
                </th>
            </tr>
        </thead>
    }

    useEffect(() => {
        console.log(selectedObjects)
    }, [selectedObjects])

    return (
        <div className="flex flex-col w-fill space-y-4">
            <div className='relative flex flex-row justify-between min-h-[42px] '>
                <div className='relative w-full'>
                    <div className={`absolute overflow-hidden w-fit inline-flex bg-white border divide-x rounded-lg duration-200
                    ${!visibilityControl ? 'opacity-0' : (selectedObjects.length ? 'opacity-0 invisible' : 'opacity-100')}`}
                    >
                        <button className={`min-w-fit px-5 py-2 font-medium text-zinc-600 transition-colors duration-200
                        ${publishStatus === 'all' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('all')}>
                            Все
                        </button>

                        <button className={`min-w-fit px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100
                        ${publishStatus === 'publish' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('publish')}>
                            Опубликованные
                        </button>

                        <button className={`min-w-fit px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100
                         ${publishStatus === 'not_publish' ? 'bg-zinc-100' : 'hover:bg-zinc-100 bg-none'}`}
                            onClick={() => setPublichStatus('not_publish')}>
                            Не опубликованные
                        </button>
                    </div>
                    <div className={`shadow-md z-30 absolute overflow-hidden w-fit inline-flex bg-white border divide-x rounded-lg duration-200
                    ${selectedObjects.length ? 'opacity-100' : 'invisible opacity-0'}`}>
                        <div className="min-w-fit px-5 py-2 font-medium text-blue-700 transition-colors duration-200 ">
                            {selectedObjects.length} Выбрано:
                        </div>
                        {visibilityControl ? <>
                            <button className="min-w-fit px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100">
                                Опубликовать
                            </button>

                            <button className="min-w-fit px-5 py-2 font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100">
                                Снять с публикации
                            </button>
                        </> : ''}
                        <button className="min-w-fit px-5 py-2 font-medium text-red-500 transition-colors duration-200 hover:bg-zinc-100"
                            onClick={handleSelectedDelete}>
                            Удалить
                        </button>
                    </div>
                </div>

                <div className={`flex-grow 
                ${!visibilityControl ? 'w-full absolute left-0 ' : 'relative max-w-[800px] min-w-[500px]'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-6 h-6 my-auto text-zinc-400 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                        type="text"
                        placeholder="Найти по названию"
                        className="w-full py-2 pl-12 pr-4 border rounded-md outline-none bg-white focus:border-blue-600"
                    />
                </div>
            </div>
            <div className="-mx-4 -my-2 sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full align-middle md:px-6 lg:px-8">
                    <div className="border border-zinc-200">
                        <table className="min-w-full divide-y divide-zinc-200">
                            {pathname === 'dictionary' ? <DictionaryTableHead /> :
                                pathname === 'authors' ? <AuthorTableHead /> :
                                    <TableHead />}
                            <tbody className="bg-white divide-y divide-zinc-200">
                                {filteredObjects.map(object => {
                                    return pathname === 'dictionary' ? DictionaryTableRow(object) :
                                        pathname === 'authors' ? AuthorTableRow(object) :
                                            TableRow(object)
                                })}
                                {!filteredObjects.length && <tr className='bg-white'>
                                    <td className="px-4 py-[18px] text-sm font-medium text-zinc-700 whitespace-nowrap ">
                                        Нет объектов, удовлетворяющих результатам поиска
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
            <div className='flex flex-row self-end space-x-6'>
                <div className='flex flex-row justify-center items-center space-x-2'>
                    <p className=''>На странице:</p>
                    <select value={itemsPerPage}
                        onChange={e => setItemsPerPage(e.target.value)}
                        className="ml-2 p-0 px-2 h-full focus:outline-[0] border rounded-md outline-none">
                        {OPTIONS.map((item) => <option value={item} key={item}
                            className=''>{item}</option>)}
                    </select >
                </div>
                <Pagination itemsPerPage={itemsPerPage} items={filteredObjects}
                    updateCurrentItems={(newCurrentItems) => setCurrentItems(newCurrentItems)} />
            </div>
        </div >
    );
}
