import { setDropdown } from '@/store/slices/generalSlice'
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function Filter({ name, items, allSelectedItems, onChange }) {
    const dispatch = useDispatch();

    const paths = usePathname();
    const pathNames = paths.split('/').filter(path => path);

    const dropdown = useSelector(state => state.general.dropdown);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filterName, setFilterName] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);

    useEffect(() => {
        items && setSelectedItems(items.filter(({ id }) => allSelectedItems?.includes(id)).map(({ id }) => id));
    }, [items, allSelectedItems])

    useEffect(() => {
        items && setFilteredItems(items.filter((item) => {
            if (item.name) {
                return item.name.toLowerCase().includes(filterName.toLowerCase())
            } else {
                return item.name.toLowerCase().includes(filterName.toLowerCase())
            }
        }))
    }, [filterName, items])

    const handleItemSelect = (e, itemId) => {
        const updatedItems = e.target.checked
            ? [...selectedItems, itemId]
            : selectedItems.filter(item => item !== itemId);

        setSelectedItems(updatedItems);
        console.log(updatedItems)
        onChange(updatedItems);
    }

    const handleItemsReset = () => {
        setSelectedItems([])
        onChange([])
    }

    return (
        <div className="flex gap-8 w-full">
            <div className="relative w-full">
                <div className="filter_dropdown ">
                    <div className="bg-white flex cursor-pointer items-center justify-between gap-2 border p-2  transition rounded-md"
                        onClick={() => dispatch(setDropdown({ key: name, isActive: dropdown.key !== null && dropdown.key !== name ? true : !dropdown.isActive }))}>
                        <span className="text-base font-medium overflow-hidden whitespace-nowrap text-ellipsis">{name}</span>
                        <span className={`transition ${dropdown.key == name && dropdown.isActive ? '-rotate-180' : ''} `}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </span>
                    </div>

                    <div className={`w-full z-50 duration-200 transition-all 
                    absolute rounded-md border border-gray-200 bg-white top-8
                    ${dropdown.key == name && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}
                    >
                        <div className="w-full rounded border border-gray-200 bg-white">
                            <header className="flex items-center justify-between px-4 py-2">
                                <span className=" text-gray-700">{selectedItems.length} Выбрано </span>

                                <button type="button" className=" text-gray-900 underline underline-offset-4"
                                    onClick={handleItemsReset}>
                                    Сбросить
                                </button>
                            </header>

                            <div className="relative w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 w-5 h-5 my-auto text-zinc-400 left-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input value={filterName}
                                    type="text"
                                    placeholder="Найти"
                                    className=" w-full py-2 pl-12 pr-4 border-t outline-none"
                                    onChange={(e) => setFilterName(e.target.value)}
                                />
                            </div>
                            <ul className="scroll space-y-1 border-t border-gray-200 p-4 py-2 max-h-[200px] overflow-auto">
                                {filteredItems.map(({ name, id }) => <li key={id}>
                                    <label htmlFor={`Item${id}`} className="flex flex-row cursor-pointer">
                                        <input type="checkbox" id={`Item${id}`}
                                            checked={selectedItems.includes(id)}
                                            onChange={(e) => handleItemSelect(e, id)}
                                            className="min-w-5 w-5 min-h-5 h-5 mr-1 rounded border-gray-300 " />
                                        <span className="text-gray-700 ml-2 ">{name}</span>
                                    </label>
                                </li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {pathNames.includes('create') || pathNames.includes('edit') ? <ul className='mt-2 flex flex-row flex-wrap max-w-full '>
                    {selectedItems.map(id => items.map(item => item.id === id && <li key={item.id}
                        className='border border-zinc-400 rounded-full min-w-fit h-fit px-2 flex flex-row justify-center space-x-2 mr-2 mb-1'>
                        <p>{item.name}</p>
                        <button className='text-black pt-[1px]'
                            onClick={(e) => handleItemSelect(e, id)}>
                            <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className='w-[10px] h-[10px]'>
                                <g id="Menu / Close_LG">
                                    <path id="Vector" d="M21 21L12 12M12 12L3 3M12 12L21.0001 3M12 12L3 21.0001" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                            </svg>
                        </button>
                    </li>))}
                </ul> : ''}
            </div>
        </div>
    )
}
