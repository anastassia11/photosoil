import { createTag } from '@/api/tags/create_tag';
import { deleteTag } from '@/api/tags/delete_tag';
import { putTag } from '@/api/tags/put_tag';
import { setDropdown } from '@/store/slices/generalSlice'
import { openModal } from '@/store/slices/modalSlice';
import modalThunkActions from '@/store/thunks/modalThunk';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Oval } from 'react-loader-spinner';
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from 'react-tooltip';

export default function Filter({ type, itemId, name, items, setTags, allSelectedItems, addItem, deleteItem, resetItems, isMapFilter, isEng }) {
    const dispatch = useDispatch();
    const [filterOpen, setFilterOpen] = useState(false)
    const paths = usePathname();
    const pathNames = paths.split('/').filter(path => path);

    const dropdown = useSelector(state => state.general.dropdown);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [formVisible, setFormVisible] = useState({
        visible: false,
        type: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [tagData, setTagData] = useState({});
    const { t } = useTranslation();

    const _id = itemId ? `filter-${itemId}` : name;

    useEffect(() => {
        items && setSelectedItems(items.filter(({ id }) => allSelectedItems?.includes(id)).map(({ id }) => id));
    }, [items, allSelectedItems])

    useEffect(() => {
        items && setFilteredItems(items.filter((item) => item.name?.toLowerCase().includes(filterName.toLowerCase()) ||
            item.dataEng?.name?.toLowerCase().includes(filterName.toLowerCase()) || item.dataRu?.name?.toLowerCase().includes(filterName.toLowerCase()) ||
            item.nameEng?.toLowerCase().includes(filterName.toLowerCase()) || item.nameRu?.toLowerCase().includes(filterName.toLowerCase()))
        )
    }, [filterName, items])

    const handleItemSelect = (e, itemId) => {
        const updatedItems = e.target.checked
            ? [...selectedItems, itemId]
            : selectedItems.filter(item => item !== itemId);

        e.target.checked ? addItem(itemId) : deleteItem(itemId)
        setSelectedItems(updatedItems);
    }

    const handleItemsReset = () => {
        resetItems(selectedItems);
        setSelectedItems([]);
    }

    const handleOpenClick = () => {
        isMapFilter ? setFilterOpen(!filterOpen) : dispatch(setDropdown({ key: _id, isActive: dropdown.key !== null && dropdown.key !== _id ? true : !dropdown.isActive }))
    }

    const handleAddTag = () => {
        setFormVisible(prev => ({ visible: true, type: 'create' }));
    }

    const handleCloseForm = () => {
        setFormVisible(prev => ({ visible: false, type: '' }));
        setTagData({});
    }

    const createNewTag = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        const result = formVisible.type === 'create' ?
            await createTag(tagData)
            : await putTag({ id: tagData.id, data: { nameRu: tagData.nameRu, nameEng: tagData.nameEng } });
        if (result.success) {
            formVisible.type === 'create' ? setTags(prev => [...prev, result.data])
                : setTags(prev => prev.map(item => item.id === tagData.id ? result.data : item));
            setFormVisible(prev => ({ visible: false, type: '' }));
            setTagData({});
        }
        setIsLoading(false);
    }

    const handleEditClick = (e, { id, nameEng, nameRu }) => {
        e.stopPropagation();

        setTagData({ id, nameEng, nameRu });
        setFormVisible(prev => ({ visible: true, type: 'edit' }));
    }

    const fetchDeleteTag = async (id) => {
        const result = await deleteTag(id);
        if (result.success) {
            setTags(prev => prev.filter(item => item.id !== id));
        } else {
            console.log(result)
        }
    }

    const handleDeleteClick = async (e, id) => {
        dispatch(openModal({
            title: t('warning'),
            message: t('delete_tag'),
            buttonText: t('delete')
        }))

        const isConfirm = await dispatch(modalThunkActions.open());
        if (isConfirm.payload) {
            await fetchDeleteTag(id);
        }
    }

    const TagForm = () => <div
        className="tag-form bg-black/30 fixed top-0 left-0 z-50 overflow-y-auto w-screen h-screen">
        <div className="flex items-center h-full justify-center px-4 pt-4 pb-20 ml-[290px] text-center">
            <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-md sm:p-6 sm:align-middle">
                <h3 className="text-center text-lg font-medium leading-6 text-gray-800 capitalize" id="modal-title">
                    {t('new_tag')}
                </h3>
                <ul className='my-2 space-y-3'>
                    <div>
                        <label className="font-medium">
                            {t('name')}
                        </label >
                        <input
                            name='nameRu'
                            onChange={(e) => setTagData(prev => ({ ...prev, nameRu: e.target.value }))}
                            value={tagData.nameRu}
                            type='text'
                            className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                        />
                    </div>
                    <div>
                        <label className="font-medium">
                            {`${t('name')} (EN)`}
                        </label >
                        <input
                            name='nameEng'
                            onChange={(e) => setTagData(prev => ({ ...prev, nameEng: e.target.value }))}
                            value={tagData.nameEng}
                            type='text'
                            className="bg-white w-full mt-1 p-2 outline-none border focus:border-blue-600 shadow-sm rounded-md"
                        />
                    </div>
                </ul>
                <div className="mt-8">
                    <div className="mt-4 sm:flex sm:items-center sm:-mx-2">
                        <button type='button' onClick={handleCloseForm} className="w-full px-4 py-2 font-medium tracking-wide text-gray-700 capitalize transition-colors duration-300 transform border border-gray-200 rounded-md sm:w-1/2 sm:mx-2 focus:outline-none">
                            {t('cancel')}
                        </button>
                        <button onClick={createNewTag} type='button'
                            disabled={isLoading}
                            className="flex items-center justify-center w-full px-4 py-2 mt-3 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform 
                                    bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none active:bg-blue-600 sm:mt-0 sm:w-1/2 sm:mx-2">
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
                                : t('_save')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    return (
        <div className="select-none flex gap-8 w-full">
            <div className="relative w-full">
                <div className="filter_dropdown">
                    <div className={`overflow-visible flex cursor-pointer items-center justify-between gap-2 ${!isMapFilter ? 'bg-white border h-[40px] p-2' : ''} transition rounded-md`}
                        onClick={handleOpenClick}
                        data-tooltip-id={`${_id}`}
                        data-tooltip-content={`${name}`}
                        data-tooltip-place={isMapFilter ? "right" : "top"}
                        data-tooltip-variant="dark">
                        <span className={`text-base overflow-hidden whitespace-nowrap text-ellipsis duration-300
                        ${isMapFilter && filterOpen && 'font-medium text-blue-700'} ${!isMapFilter && 'font-medium'}`}>{name}</span>
                        <span className={`transition ${(dropdown.key == _id && dropdown.isActive) || filterOpen ? '-rotate-180' : ''} `}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </span>

                    </div>

                    <div className={`w-full duration-200 transition-all ${!isMapFilter ? 'top-[30px] absolute border z-50' : ''} 
                    ${isMapFilter ? (filterOpen ? 'block' : 'hidden') :
                            (dropdown.key == _id && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0')}
                     rounded-md border-gray-200 bg-white`}>

                        <header className={`flex items-center justify-between ${!isMapFilter ? 'px-4 py-2' : 'px-4 py-1 pt-2'}`}>
                            <span className=" text-gray-700">{selectedItems.length} {t('select')} </span>

                            <button type="button" className=" text-gray-900 underline underline-offset-4"
                                onClick={handleItemsReset}>
                                {t('reset')}
                            </button>
                        </header>

                        <div className={`relative ${isMapFilter ? 'mx-2.5 px-1.5' : 'w-full '}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`absolute top-0 bottom-0 w-5 h-5 my-auto text-zinc-400 ${isMapFilter ? 'left-1.5' : 'left-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input value={filterName}
                                type="text"
                                placeholder="Найти"
                                className={`w-full pr-4  outline-none  ${isMapFilter ? 'border-b focus:border-blue-600 py-1 pl-[32px]' : 'py-2 pl-12  border-y'}`}
                                onChange={(e) => setFilterName(e.target.value)}
                            />
                        </div>
                        {filteredItems.length ? <ul className={`scroll space-y-1 max-h-[200px] overflow-auto py-2 ${isMapFilter ? 'px-4' : 'px-4'}`}>
                            {filteredItems.map(({ name, id, dataRu, dataEng, nameEng, nameRu }) => {
                                const isValid = (isEng ? ((nameEng && nameEng !== '') || (dataEng && dataEng.name !== ''))
                                    : ((nameRu && nameRu !== '') || (dataRu && dataRu.name !== ''))) || name;
                                if (isValid) return <li key={`Item${type ? `-${type}-${id}` : `-${id}`}`} className='flex flex-row justify-between group'>
                                    <label htmlFor={`Item${type ? `-${type}-${id}` : `-${id}`}`} className="flex flex-row cursor-pointer w-full"
                                    // onClick={(e) => {
                                    //     e.stopPropagation();
                                    //     handleItemSelect(e, id);
                                    // }}
                                    >
                                        <input type="checkbox" id={`Item${type ? `-${type}-${id}` : `-${id}`}`}
                                            checked={selectedItems.includes(id)}
                                            onChange={(e) => handleItemSelect(e, id)}
                                            className="min-w-5 w-5 min-h-5 h-5 mr-1 rounded border-gray-300 " />
                                        <span className="text-gray-700 ml-2 ">{name || (isEng ? nameEng : nameRu) || (isEng ? dataEng?.name : dataRu?.name)}</span>
                                    </label>
                                    {(pathNames.includes('create') || pathNames.includes('edit')) && pathNames.includes('news') ? <span className='flex flex-row'>
                                        <button onClick={(e) => handleEditClick(e, { id, nameEng, nameRu })}
                                            className='group-hover:visible invisible mr-3 text-gray-500 hover:text-gray-700'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                        <button onClick={(e) => handleDeleteClick(e, id)}
                                            className='group-hover:visible invisible text-gray-500 hover:text-red-700'>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </span> : ''}
                                </li>
                            })}
                        </ul> : ''}

                        {(pathNames.includes('create') || pathNames.includes('edit')) && pathNames.includes('news') ? <button type='button' className='font-medium text-blue-600 w-fit ml-4 mb-2'
                            onClick={handleAddTag}>
                            <span className='text-2xl pr-2'>+</span>
                            {t('add_tag')}
                        </button> : ''}
                    </div>
                </div>
                {pathNames.includes('create') || pathNames.includes('edit') ? <ul className='mt-2 flex flex-row flex-wrap w-fit max-w-full'>
                    {selectedItems.map(_id => items.map(({ name, id, dataRu, dataEng, nameEng, nameRu }) => {
                        if (id === _id) {
                            const isValid = isEng ? ((nameEng && nameEng !== '') || (dataEng && dataEng.name !== ''))
                                : ((nameRu && nameRu !== '') || (dataRu && dataRu.name !== ''));
                            if (isValid) return <li key={id}
                                className='border border-zinc-400 rounded-full w-fit max-w-full h-fit px-2 flex flex-row justify-center space-x-2 mr-2 mb-1'>
                                <p className='overflow-hidden text-nowrap text-ellipsis max-w-full'>{name || (isEng ? nameEng : nameRu) || (isEng ? dataEng?.name : dataRu?.name)}</p>
                                <button className='text-black pt-[1px]'
                                    onClick={(e) => handleItemSelect(e, _id)}>
                                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                                        <g id="Menu / Close_LG">
                                            <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                    </svg>
                                </button>
                            </li>
                        }
                    }))}
                </ul> : ''}
            </div>
            {pathNames.includes('create') || pathNames.includes('edit') ? '' : <Tooltip id={`${_id}`}
                style={{
                    fontSize: "14px",
                    height: "25px",
                    padding: "1px 8px 1px 8px",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "rgb(82 82 91)",
                    zIndex: "100",
                }} />}
            {formVisible.visible ? TagForm() : ''}
        </div >
    )
}
