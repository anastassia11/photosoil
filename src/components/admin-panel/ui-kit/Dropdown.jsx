'use client'

import { setDropdown } from '@/store/slices/generalSlice'
import { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Dropdown = memo(function Dropdown({ name, value, items, onCategotyChange, flexRow, dropdownKey, isTransparent, noBold }) {
    const dispatch = useDispatch()
    const dropdown = useSelector(state => state.general.dropdown)
    const [selectedValue, setSelectedValue] = useState()

    useEffect(() => {
        if (value !== null && value !== undefined) setSelectedValue({ name: items[value], id: value })
    }, [value, items])

    const handleSelectClick = (name, id) => {
        setSelectedValue({ name, id })
        onCategotyChange(id)
        dispatch(setDropdown({ key: null, isActive: false }))
    }

    return (
        <div className={`${flexRow && 'flex flex-row items-center space-x-3 '} backface`}
            onClick={e => e.stopPropagation()}>
            <label className={`${!noBold && 'font-medium'} min-w-fit`}>
                {name}
            </label>
            <div className={`${flexRow ? 'w-full' : 'mt-1'} relative`}>
                <div className={`h-[40px] ${dropdownKey} ${!isTransparent && 'bg-white border'} flex cursor-pointer 
                    items-center justify-between gap-2 p-2 transition rounded-md`}
                    onClick={() =>
                        dispatch(setDropdown({ key: dropdownKey, isActive: dropdown.key !== null && dropdown.key !== dropdownKey ? true : !dropdown.isActive }))
                    }>
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">{selectedValue ? selectedValue.name : ''}</span>
                    <span className={`transition ${dropdown.key == dropdownKey && dropdown.isActive ? '-rotate-180' : ''} `}>
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
                    absolute w-full rounded-md border border-gray-200 bg-white top-[30px]
                    ${dropdown.key == dropdownKey && dropdown.isActive ? 'visible translate-y-4' : 'invisible opacity-0'}`}
                    onClick={() => dispatch(setDropdown({ key: null, isActive: false }))}>
                    <ul className={`scroll space-y-1 py-2 max-h-[200px] overflow-auto`}>
                        {items ? Object.entries(items).map(([key, value]) => <li key={`objectType-${key}`}>
                            <button type='button' className={`duration-300 space-x-2 flex-row justify-between w-full  cursor-pointer hover:text-blue-600 min-h-9 h-fit
                            hover:bg-zinc-100 flex px-4 items-center ${key === selectedValue?.id ? 'text-blue-600' : ''}`}
                                onClick={() => handleSelectClick(value, key)}>
                                <p className='text-left'>{value}</p>
                                {selectedValue?.id === key ?
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
                        </li>) : ''}
                    </ul>
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    return prevProps.dropdown?.isActive === nextProps.dropdown?.isActive &&
        prevProps.dropdown?.key === nextProps.dropdown?.key
        && prevProps.value === nextProps.value
        && prevProps.name === nextProps.name
})
export default Dropdown;
