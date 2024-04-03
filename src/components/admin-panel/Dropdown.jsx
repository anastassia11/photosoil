'use client'

import { setDropdown } from '@/store/slices/generalSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function Dropdown({ name, items, onCategotyChange }) {
    const dispatch = useDispatch()
    const dropdown = useSelector(state => state.general.dropdown)
    const [selectedValue, setSelectedValue] = useState(null)

    const handleSelectClick = (name, id) => {
        setSelectedValue({ name, id })
        onCategotyChange(id)
        dispatch(setDropdown({ key: null, isActive: false }))

    }

    return (

        <div className="w-full">
            <label className="font-medium">
                {name}
            </label>
            <div className="mt-1 relative">
                <div className="category_dropdown bg-white flex cursor-pointer items-center justify-between gap-2 border p-2  transition rounded-md"
                    onClick={() => dispatch(setDropdown({ key: 'category_dropdown', isActive: dropdown.key !== null && dropdown.key !== 'category_dropdown' ? true : !dropdown.isActive }))}>
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">{selectedValue ? selectedValue.name : '- Выберите -'}</span>
                    <span className={`transition ${dropdown.key == 'category_dropdown' && dropdown.isActive ? '-rotate-180' : ''} `}>
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

                <div className={`z-50 duration-200 transition-all 
                    absolute w-[390px] rounded-md border border-gray-200 bg-white top-8
                    ${dropdown.key == 'category_dropdown' && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}
                    onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}>

                    <ul className={`scroll space-y-1 py-2 max-h-[200px] overflow-auto
                 `}>
                        {items.map(({ name, id }) => <li key={id}>
                            <button className={`duration-300 space-x-2 flex-row justify-between w-full  cursor-pointer hover:text-blue-600 h-9 
                            hover:bg-zinc-100 flex items-center px-4 ${id === selectedValue?.id ? 'text-blue-600' : ''}`}
                                onClick={() => handleSelectClick(name, id)}>
                                {name}
                                {selectedValue?.id === id ?
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-blue-600"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg> : ''}
                            </button>
                        </li>)}
                    </ul>

                </div>
            </div>
        </div>

    )
}
